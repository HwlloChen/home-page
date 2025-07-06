<template>
    <canvas ref="canvasRef" id="live2d" @mouseenter="showCloseBtn = true" @mouseleave="showCloseBtn = false" />
    <!-- 关闭按钮，绝对定位到canvas右上角，渐显淡出 -->
    <mdui-button-icon v-show="showClose" class="live2d-close-btn" :class="{ visible: showCloseBtn }" icon="close"
        @click="handleClose" :style="closeBtnStyle" @mouseenter="showCloseBtn = true"
        variant="tonal"></mdui-button-icon>
    <!-- 浮动文本框 -->
    <div v-if="showTextBox" ref="textBoxRef" class="text-box"
        :class="{ 'leaving': isTextBoxLeaving, 'entering': isTextBoxEntering }" :style="{
            left: textBoxPosition.x + 'px',
            top: textBoxPosition.y + 'px'
        }">
        <div class="text-content">
            <div class="text-message" v-html="currentText"></div>
            <div class="text-controls" v-if="!isAutoMode && hasNextText">
                <button @click="nextText" class="next-btn">下一句</button>
                <button @click="hideTextBox" class="close-btn">×</button>
            </div>
            <div class="text-controls" v-else-if="!isAutoMode">
                <button @click="hideTextBox" class="close-btn">×</button>
            </div>
        </div>
        <!-- 装饰性三角箭头 -->
        <div class="arrow" :class="arrowClass"></div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, reactive, nextTick, computed, defineEmits } from 'vue'
import { globalVars } from '@/utils/globalVars';

// Live2D 显示区域宽高（像素）
const LIVE2D_WIDTH = globalVars.live2d.width;
const LIVE2D_HEIGHT = globalVars.live2d.height;

// 从配置获取位置偏移
const DEFAULT_LEFT = globalVars.live2d.left; // 水平位置偏移
const DEFAULT_BOTTOM = globalVars.live2d.bottom; // 垂直位置偏移

// 获取位置配置
const positionConfig = globalVars.live2d.position;

// 预设随机文本内容
const dialogTexts = [
    "你好！我是阿米娅，很高兴见到你~",
    "今天天气真不错呢！",
    "有什么我可以帮助你的吗？",
    "记得要好好休息哦！",
    "要一起聊聊天吗？"
];

// 初始化状态
const isInitialized = ref(false);
const isLoading = ref(false);
const canvasRef = ref(null);

// Live2D 相关变量 - 延迟初始化
let l2dapp = null;
let live2DSprite = null;
let Application = null;
let Ticker = null;
let Live2DSprite = null;
let Config = null;

// 处理点击事件
const handleClick = () => {
    // 随机显示不同类型的交互
    const randomAction = Math.random();
    if (randomAction < 0.4) {
        showRandomText();
    } else if (randomAction < 0.7) {
        showInteractiveText([
            "你想和我聊什么呢？",
            "我很乐意和你交流~",
            "有什么问题尽管问我吧！"
        ]);
    } else {
        showText("你点击了我！", 2000);
    }
}

// 文本框相关状态
const showTextBox = ref(false);
const isTextBoxLeaving = ref(false);
const isTextBoxEntering = ref(false);
const currentText = ref('');
const textBoxPosition = reactive({ x: 0, y: 0 });
const textBoxRef = ref(null);
const isAutoMode = ref(false);
const currentTextIndex = ref(0);
const textQueue = ref([]);
let autoCloseTimer = null;

// 计算属性：是否还有下一句
const hasNextText = computed(() => {
    return currentTextIndex.value < textQueue.value.length - 1;
});

// 计算箭头方向类名
const arrowClass = computed(() => {
    if (!canvasRef.value) return 'arrow-up';
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const textBoxWidth = 280;
    const textBoxHeight = 120;
    const textBoxTop = textBoxPosition.y;
    const textBoxBottom = textBoxPosition.y + textBoxHeight;
    if (textBoxBottom <= canvasRect.top) {
        return 'arrow-up';
    }
    if (textBoxTop >= canvasRect.bottom) {
        return 'arrow-down';
    }
    return 'arrow-down';
});

// 检查屏幕宽度是否大于等于 1080px
const isLargeScreen = window.innerWidth >= 1080;

// 计算文本框位置，确保不超出屏幕
const calculateTextBoxPosition = () => {
    if (!canvasRef.value) return { x: 0, y: 0 };

    const canvasRect = canvasRef.value.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const textBoxWidth = 280;
    const textBoxHeight = 120;
    const offset = 20;

    let x, y;

    x = canvasRect.left + (canvasRect.width - textBoxWidth) / 2;
    y = canvasRect.top - textBoxHeight - offset;

    if (y < 10) {
        y = canvasRect.bottom + offset;
        if (y + textBoxHeight > screenHeight - 10) {
            x = canvasRect.right + offset;
            y = canvasRect.top + (canvasRect.height - textBoxHeight) / 2;
            if (x + textBoxWidth > screenWidth - 10) {
                x = canvasRect.left - textBoxWidth - offset;
            }
            if (x < 10) {
                x = canvasRect.left + (canvasRect.width - textBoxWidth) / 2;
                y = 10;
            }
        }
    }

    if (x < 10) x = 10;
    if (x + textBoxWidth > screenWidth - 10) x = screenWidth - textBoxWidth - 10;
    if (y < 10) y = 10;
    if (y + textBoxHeight > screenHeight - 10) y = screenHeight - textBoxHeight - 10;

    return { x, y };
};

// 文本显示相关函数
const showText = (text, duration = 0) => {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
    isTextBoxLeaving.value = false;
    isTextBoxEntering.value = true;
    setTimeout(() => {
        isTextBoxEntering.value = false;
    }, 400);
    currentText.value = text;
    textBoxPosition.x = calculateTextBoxPosition().x;
    textBoxPosition.y = calculateTextBoxPosition().y;
    showTextBox.value = true;
    if (duration > 0) {
        autoCloseTimer = setTimeout(() => {
            hideTextBox();
        }, duration);
    }
};

const showTextSequence = (texts, intervalDuration = 3000) => {
    if (!Array.isArray(texts) || texts.length === 0) return;

    textQueue.value = [...texts];
    currentTextIndex.value = 0;
    isAutoMode.value = true;

    const showNextInSequence = () => {
        if (currentTextIndex.value < textQueue.value.length) {
            showText(textQueue.value[currentTextIndex.value]);
            currentTextIndex.value++;

            setTimeout(() => {
                if (currentTextIndex.value < textQueue.value.length) {
                    showNextInSequence();
                } else {
                    hideTextBox();
                    isAutoMode.value = false;
                }
            }, intervalDuration);
        }
    };

    showNextInSequence();
};

const showInteractiveText = (texts) => {
    if (!Array.isArray(texts) || texts.length === 0) return;

    textQueue.value = [...texts];
    currentTextIndex.value = 0;
    isAutoMode.value = false;

    showText(textQueue.value[currentTextIndex.value]);
};

const nextText = () => {
    currentTextIndex.value++;
    if (currentTextIndex.value < textQueue.value.length) {
        showText(textQueue.value[currentTextIndex.value]);
    } else {
        hideTextBox();
    }
};

const hideTextBox = () => {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }

    isTextBoxLeaving.value = true;

    setTimeout(() => {
        showTextBox.value = false;
        isTextBoxLeaving.value = false;
        currentText.value = '';
        textQueue.value = [];
        currentTextIndex.value = 0;
        isAutoMode.value = false;
    }, 300);
};

const showRandomText = () => {
    const randomIndex = Math.floor(Math.random() * dialogTexts.length);
    showText(dialogTexts[randomIndex], 3000);
};

// 获取 Live2DManager 实例
const getLive2DManager = () => {
    if (
        live2DSprite &&
        live2DSprite._actionsManager &&
        live2DSprite._actionsManager.getSize &&
        live2DSprite._actionsManager.getSize() > 0
    ) {
        return live2DSprite._actionsManager.at(0).live2dManager;
    }
    return null;
};

const handleMouseMove = (e) => {
    if (!canvasRef.value || !isInitialized.value) return;
    const rect = canvasRef.value.getBoundingClientRect();
    const manager = getLive2DManager();
    if (!manager) return;
    const model = manager._models.at(0);
    if (!model) return;
    
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    const x = (px / rect.width) * 2 - 1;
    const y = -((py / rect.height) * 2 - 1);
    
    if (model && typeof model.setDragging === 'function') {
        model.setDragging(x, y);
    }
};

// 拖动相关变量
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startLeft = 0;
let startRight = 0;
let startTop = 0;
let startBottom = 0;

const onMouseDown = (e) => {
    if (!canvasRef.value) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const style = canvasRef.value.style;
    if (positionConfig.x === 'right') {
        startRight = parseInt(style.right, 10) || 0;
    } else {
        startLeft = parseInt(style.left, 10) || 0;
    }

    if (positionConfig.y === 'top') {
        startTop = parseInt(style.top, 10) || 0;
    } else {
        startBottom = parseInt(style.bottom, 10) || 0;
    }

    document.addEventListener('mousemove', onMouseMoveDrag);
    document.addEventListener('mouseup', onMouseUp);
};

const onMouseMoveDrag = (e) => {
    if (!isDragging || !canvasRef.value) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (positionConfig.x === 'right') {
        canvasRef.value.style.right = `${startRight - dx}px`;
    } else {
        canvasRef.value.style.left = `${startLeft + dx}px`;
    }

    if (positionConfig.y === 'top') {
        canvasRef.value.style.top = `${startTop + dy}px`;
    } else {
        canvasRef.value.style.bottom = `${startBottom - dy}px`;
    }

    if (showTextBox.value) {
        const newPos = calculateTextBoxPosition();
        textBoxPosition.x = newPos.x;
        textBoxPosition.y = newPos.y;
    }
    updateCloseBtnPos();
}

const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMoveDrag);
    document.removeEventListener('mouseup', onMouseUp);
    updateCloseBtnPos();
}

const handleResize = () => {
    if (showTextBox.value) {
        const newPos = calculateTextBoxPosition();
        textBoxPosition.x = newPos.x;
        textBoxPosition.y = newPos.y;
    }
    updateCloseBtnPos();
};

// 异步加载Live2D脚本
const loadLive2DScript = () => {
    return new Promise((resolve, reject) => {
        // 检查是否已加载
        if (document.getElementById('live2d-cubismcore-script')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = '/live2d-assets/live2dcubismcore.min.js';
        script.id = 'live2d-cubismcore-script';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// 异步加载Live2D依赖
const loadLive2DDependencies = async () => {
    try {
        // 动态导入PIXI.js和Live2D相关模块
        const [pixiModule, live2dModule] = await Promise.all([
            import('pixi.js'),
            import('easy-live2d')
        ]);

        Application = pixiModule.Application;
        Ticker = pixiModule.Ticker;
        Live2DSprite = live2dModule.Live2DSprite;
        Config = live2dModule.Config;

        return true;
    } catch (error) {
        console.error('Failed to load Live2D dependencies:', error);
        return false;
    }
};

// 优化后的初始化函数
const initLive2d = async () => {
    if (isLoading.value || isInitialized.value) return;
    
    isLoading.value = true;
    
    try {
        // 使用 requestIdleCallback 在空闲时初始化
        await new Promise((resolve) => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(resolve, { timeout: 2000 });
            } else {
                setTimeout(resolve, 16); // 约一帧的时间
            }
        });

        // 分步骤异步加载
        await loadLive2DScript();
        
        // 等待下一帧再继续
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const dependenciesLoaded = await loadLive2DDependencies();
        if (!dependenciesLoaded) {
            throw new Error('Failed to load dependencies');
        }

        // 等待下一帧再继续
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 初始化Live2D对象
        l2dapp = new Application();
        live2DSprite = new Live2DSprite();

        // 设置鼠标跟随
        if (Config) {
            Config.MouseFollow = !isLargeScreen;
        }

        if (!canvasRef.value) {
            throw new Error('Canvas not found');
        }

        // 设置canvas样式
        const canvas = canvasRef.value;
        canvas.style.position = 'fixed';
        canvas.style.width = LIVE2D_WIDTH + 'px';
        canvas.style.height = LIVE2D_HEIGHT + 'px';
        canvas.width = LIVE2D_WIDTH;
        canvas.height = LIVE2D_HEIGHT;

        // 根据配置设置位置
        if (positionConfig.x === 'right') {
            canvas.style.right = Math.abs(DEFAULT_LEFT) + 'px';
            canvas.style.left = 'auto';
        } else {
            canvas.style.left = DEFAULT_LEFT + 'px';
            canvas.style.right = 'auto';
        }

        if (positionConfig.y === 'top') {
            canvas.style.top = Math.abs(DEFAULT_BOTTOM) + 'px';
            canvas.style.bottom = 'auto';
        } else {
            canvas.style.bottom = DEFAULT_BOTTOM + 'px';
            canvas.style.top = 'auto';
        }

        // 分步骤初始化
        await l2dapp.init({
            view: canvas,
            backgroundAlpha: 0,
        });

        // 等待下一帧
        await new Promise(resolve => requestAnimationFrame(resolve));

        // 初始化Live2D精灵
        await live2DSprite.init({
            modelPath: globalVars.live2d.model,
            ticker: Ticker.shared
        });

        // 设置Live2D精灵大小和位置
        live2DSprite.width = LIVE2D_WIDTH;
        live2DSprite.height = LIVE2D_HEIGHT;
        live2DSprite.x = 0;
        live2DSprite.y = 0;

        l2dapp.stage.addChild(live2DSprite);

        // 添加点击事件监听
        live2DSprite.onLive2D('click', ({ x, y }) => {
            handleClick(x, y);
        });

        // 添加拖动事件
        canvas.addEventListener('mousedown', onMouseDown);

        // 添加事件监听器
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        isInitialized.value = true;
        console.log('Live2D initialized successfully');

    } catch (error) {
        console.error('Failed to initialize Live2D:', error);
    } finally {
        isLoading.value = false;
    }
};

// 延迟初始化
const scheduleInitialization = () => {
    // 检查是否应该初始化Live2D
    if (globalVars.theme.live2d && globalVars.live2d.enable && window.innerWidth >= 1300) {
        // 使用 setTimeout 确保不阻塞主线程
        setTimeout(() => {
            initLive2d();
        }, 100); // 延迟100ms给页面其他内容加载的时间
    }
};

onMounted(() => {
    scheduleInitialization();
});

onUnmounted(() => {
    // 清除定时器
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }

    // 释放资源
    if (live2DSprite) {
        live2DSprite.destroy();
    }
    
    // 移除事件监听器
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', onMouseDown);
    }
    
    // 清理拖动事件
    document.removeEventListener('mousemove', onMouseMoveDrag);
    document.removeEventListener('mouseup', onMouseUp);
});

const emit = defineEmits(['onClose'])

// 关闭按钮相关
const showClose = ref(true)
const handleClose = () => {
    emit('onClose')
}

const showCloseBtn = ref(false)
const closeBtnUpdateKey = ref(0)
const closeBtnStyle = computed(() => {
    if (!canvasRef.value) return {}
    closeBtnUpdateKey.value
    const rect = canvasRef.value.getBoundingClientRect()
    return {
        position: 'fixed',
        top: rect.top + 10 + 'px',
        left: rect.left + rect.width - 38 - 50 + 'px',
        transition: 'opacity 0.3s',
        opacity: showCloseBtn.value ? 1 : 0,
        pointerEvents: showCloseBtn.value ? 'auto' : 'none',
        zIndex: 1002
    }
})
const updateCloseBtnPos = () => { closeBtnUpdateKey.value++ }

// 暴露方法给父组件使用
defineExpose({
    initLive2d,
    showText,
    showTextSequence,
    showInteractiveText,
    hideTextBox,
    showRandomText,
    isInitialized,
    isLoading
});
</script>

<style scoped>
#live2d {
    position: fixed;
    width: v-bind(LIVE2D_WIDTH + 'px');
    height: v-bind(LIVE2D_HEIGHT + 'px');
    z-index: 1000;
    pointer-events: auto;
}

.live2d-close-btn {
    transition: all 0.2s ease, opacity 0.3s;
    opacity: 0;
    pointer-events: none;
}

.live2d-close-btn.visible {
    opacity: 1;
    pointer-events: auto;
}

.text-box {
    position: fixed;
    z-index: 1001;
    pointer-events: auto;
    animation: gentleSway 4s ease-in-out infinite;
}

.text-box.entering {
    animation: textBoxEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.text-box.leaving {
    animation: textBoxLeave 0.3s ease-in;
}

.text-content {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.1),
        0 4px 16px rgba(0, 0, 0, 0.05);
    min-width: 240px;
    max-width: 320px;
    position: relative;
}

.text-message {
    color: #374151;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 12px;
    font-weight: 500;
    word-wrap: break-word;
}

.text-controls {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    align-items: center;
}

.next-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
}

.next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.close-btn {
    background: rgba(156, 163, 175, 0.2);
    color: #6b7280;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.close-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transform: scale(1.1);
}

.arrow {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.arrow.arrow-up {
    bottom: -7px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.95);
}

.arrow.arrow-down {
    top: -7px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(255, 255, 255, 0.95);
}

@keyframes textBoxEnter {
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
    }
    60% {
        opacity: 1;
        transform: translateY(-5px) scale(1.02);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes textBoxLeave {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-15px) scale(0.95);
    }
}

@keyframes gentleSway {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateY(-4px) rotate(1deg);
    }
    50% {
        transform: translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateY(-3px) rotate(-0.8deg);
    }
}

@media (max-width: 768px) {
    .text-content {
        min-width: 200px;
        max-width: 280px;
        padding: 14px 16px;
    }
    .text-message {
        font-size: 13px;
    }
}
</style>