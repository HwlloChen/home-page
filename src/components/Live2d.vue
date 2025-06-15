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
import { Application, Ticker } from 'pixi.js'
import { Live2DSprite, Config, Priority } from 'easy-live2d'
import { init } from 'aos';
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
const isTextBoxLeaving = ref(false); // 文本框离开状态
const isTextBoxEntering = ref(false); // 新增进入动画状态
const currentText = ref('');
const textBoxPosition = reactive({ x: 0, y: 0 });
const textBoxRef = ref(null);
const isAutoMode = ref(false);
const currentTextIndex = ref(0);
const textQueue = ref([]);
let autoCloseTimer = null; // 自动关闭定时器

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
    // 如果文本框在模型下方，箭头朝上
    if (textBoxBottom <= canvasRect.top) {
        return 'arrow-up';
    }
    // 如果文本框在模型上方，箭头朝下
    if (textBoxTop >= canvasRect.bottom) {
        return 'arrow-down';
    }
    // 其他情况默认朝下
    return 'arrow-down';
});

const canvasRef = ref(null);
const l2dapp = new Application();
const live2DSprite = new Live2DSprite();

// 检查屏幕宽度是否大于等于 1080px
const isLargeScreen = window.innerWidth >= 1080;

isLargeScreen ? Config.MouseFollow = false : Config.MouseFollow = true;

// 初始化 Live2D 精灵
live2DSprite.init({
    modelPath: globalVars.live2d.model,
    ticker: Ticker.shared
});

// 计算文本框位置，确保不超出屏幕
const calculateTextBoxPosition = () => {
    if (!canvasRef.value) return { x: 0, y: 0 };

    const canvasRect = canvasRef.value.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 文本框的预估尺寸
    const textBoxWidth = 280;
    const textBoxHeight = 120;
    const offset = 20; // 与模型的间距

    let x, y;

    // 优先在模型正上方显示文本框
    x = canvasRect.left + (canvasRect.width - textBoxWidth) / 2;
    y = canvasRect.top - textBoxHeight - offset;

    // 如果上方空间不够，尝试其他位置
    if (y < 10) {
        // 尝试下方
        y = canvasRect.bottom + offset;

        // 如果下方也不够，尝试侧方
        if (y + textBoxHeight > screenHeight - 10) {
            // 尝试右侧
            x = canvasRect.right + offset;
            y = canvasRect.top + (canvasRect.height - textBoxHeight) / 2;

            // 如果右侧不够，尝试左侧
            if (x + textBoxWidth > screenWidth - 10) {
                x = canvasRect.left - textBoxWidth - offset;
            }

            // 如果左侧也不够，回到上方并调整
            if (x < 10) {
                x = canvasRect.left + (canvasRect.width - textBoxWidth) / 2;
                y = 10; // 贴着屏幕顶部
            }
        }
    }

    // 最终边界检查，确保不超出屏幕
    if (x < 10) {
        x = 10;
    }
    if (x + textBoxWidth > screenWidth - 10) {
        x = screenWidth - textBoxWidth - 10;
    }
    if (y < 10) {
        y = 10;
    }
    if (y + textBoxHeight > screenHeight - 10) {
        y = screenHeight - textBoxHeight - 10;
    }

    return { x, y };
};

// 显示单条文本
const showText = (text, duration = 0) => {
    // 清除之前的自动关闭定时器
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }
    // 重置离开状态
    isTextBoxLeaving.value = false;
    // 进入动画
    isTextBoxEntering.value = true;
    setTimeout(() => {
        isTextBoxEntering.value = false;
    }, 400); // 进入动画时长 0.4s
    currentText.value = text;
    textBoxPosition.x = calculateTextBoxPosition().x;
    textBoxPosition.y = calculateTextBoxPosition().y;
    showTextBox.value = true;
    // 如果设置了持续时间，自动隐藏
    if (duration > 0) {
        autoCloseTimer = setTimeout(() => {
            hideTextBox();
        }, duration);
    }
};

// 显示文本序列（自动模式）
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

// 显示可交互文本序列
const showInteractiveText = (texts) => {
    if (!Array.isArray(texts) || texts.length === 0) return;

    textQueue.value = [...texts];
    currentTextIndex.value = 0;
    isAutoMode.value = false;

    showText(textQueue.value[currentTextIndex.value]);
};

// 下一句文本
const nextText = () => {
    currentTextIndex.value++;
    if (currentTextIndex.value < textQueue.value.length) {
        showText(textQueue.value[currentTextIndex.value]);
    } else {
        hideTextBox();
    }
};

// 隐藏文本框
const hideTextBox = () => {
    // 清除自动关闭定时器
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }

    // 启动离开动画
    isTextBoxLeaving.value = true;

    // 等待动画完成后真正隐藏
    setTimeout(() => {
        showTextBox.value = false;
        isTextBoxLeaving.value = false;
        currentText.value = '';
        textQueue.value = [];
        currentTextIndex.value = 0;
        isAutoMode.value = false;
    }, 300); // 动画持续时间
};

// 随机显示文本
const showRandomText = () => {
    const randomIndex = Math.floor(Math.random() * dialogTexts.length);
    showText(dialogTexts[randomIndex], 3000);
};

// 添加点击事件监听
live2DSprite.onLive2D('click', ({ x, y }) => {
    handleClick(x, y);
});

// 获取 Live2DManager 实例
const getLive2DManager = () => {
    if (
        live2DSprite._actionsManager &&
        live2DSprite._actionsManager.getSize &&
        live2DSprite._actionsManager.getSize() > 0
    ) {
        return live2DSprite._actionsManager.at(0).live2dManager;
    }
    return null;
};

const handleMouseMove = (e) => {
    if (!canvasRef.value) return;
    const rect = canvasRef.value.getBoundingClientRect();
    const manager = getLive2DManager();
    if (!manager) return;
    const model = manager._models.at(0);
    if (!model) return;
    // 获取鼠标在canvas内的像素坐标
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    // 转换为 [-1, 1] 区间的逻辑坐标，y 轴取反
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

    // 根据当前位置配置获取起始位置
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

    // 根据位置配置更新相应的CSS属性
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

    // 如果文本框显示中，更新其位置
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

// 监听窗口大小变化，重新计算文本框和关闭按钮位置
const handleResize = () => {
    if (showTextBox.value) {
        const newPos = calculateTextBoxPosition();
        textBoxPosition.x = newPos.x;
        textBoxPosition.y = newPos.y;
    }
    updateCloseBtnPos();
};

const initLive2d = async () => {
    // 动态加载 live2dcubismcore.min.js 脚本
    const script = document.createElement('script');
    script.src = '/live2d-assets/live2dcubismcore.min.js'; // 修改为 public 目录下的路径
    script.id = 'live2d-cubismcore-script';
    script.async = true;
    document.head.appendChild(script);

    if (canvasRef.value) {
        // 设置 canvas 大小和位置（像素宽高与CSS宽高一致）
        canvasRef.value.style.position = 'fixed';
        canvasRef.value.style.width = LIVE2D_WIDTH + 'px';
        canvasRef.value.style.height = LIVE2D_HEIGHT + 'px';
        canvasRef.value.width = LIVE2D_WIDTH;
        canvasRef.value.height = LIVE2D_HEIGHT;

        // 根据配置设置位置
        if (positionConfig.x === 'right') {
            canvasRef.value.style.right = Math.abs(DEFAULT_LEFT) + 'px';
            canvasRef.value.style.left = 'auto';
        } else {
            canvasRef.value.style.left = DEFAULT_LEFT + 'px';
            canvasRef.value.style.right = 'auto';
        }

        if (positionConfig.y === 'top') {
            canvasRef.value.style.top = Math.abs(DEFAULT_BOTTOM) + 'px';
            canvasRef.value.style.bottom = 'auto';
        } else {
            canvasRef.value.style.bottom = DEFAULT_BOTTOM + 'px';
            canvasRef.value.style.top = 'auto';
        }

        await l2dapp.init({
            view: canvasRef.value,
            backgroundAlpha: 0, // 透明背景
        });

        // 让 Live2D 模型占满 Canvas
        live2DSprite.width = LIVE2D_WIDTH;
        live2DSprite.height = LIVE2D_HEIGHT;
        live2DSprite.x = 0;
        live2DSprite.y = 0;

        l2dapp.stage.addChild(live2DSprite);

        // 添加拖动事件
        canvasRef.value.addEventListener('mousedown', onMouseDown);
    }

    // 鼠标移动时让模型跟随
    window.addEventListener('mousemove', handleMouseMove);

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 欢迎消息
    setTimeout(() => {
        showText("欢迎！点击我来开始对话吧~", 4000);
    }, 2000);
}

onMounted(async () => {
    // 初始化 Live2d
    if (globalVars.theme.live2d && globalVars.live2d.enable && window.innerWidth >= 1300) {
        initLive2d();
    }
});

onUnmounted(() => {
    // 清除定时器
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
    }

    // 释放资源
    live2DSprite.destroy();
    // 移除 live2dcubismcore.min.js 脚本
    const script = document.getElementById('live2d-cubismcore-script');
    if (script) {
        script.remove();
    }
    // 移除鼠标监听
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', onMouseDown);
    }
});

const emit = defineEmits(['onClose'])

// 文本框相关状态
const showClose = ref(true)
const handleClose = () => {
    emit('onClose')
}

// 关闭按钮显示状态
const showCloseBtn = ref(false)
const closeBtnUpdateKey = ref(0)
const closeBtnStyle = computed(() => {
    if (!canvasRef.value) return {}
    // 依赖closeBtnUpdateKey，强制刷新
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
    showRandomText
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
    /* 位置由style绑定 */
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

/* 箭头朝上（模型在下方时） */
.arrow.arrow-up {
    bottom: -7px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid rgba(255, 255, 255, 0.95);
}

/* 箭头朝下（模型在上方时） */
.arrow.arrow-down {
    top: -7px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid rgba(255, 255, 255, 0.95);
}

/* 进入动画 */
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

/* 退出动画 */
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

/* 微摆动画 */
@keyframes gentleSway {

    0%,
    100% {
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

/* 响应式设计 */
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