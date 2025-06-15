<template>
    <canvas ref="canvasRef" id="live2d" />
</template>


<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Application, Ticker } from 'pixi.js'
import { Live2DSprite, Config, Priority } from 'easy-live2d'


// Live2D 显示区域宽高（像素）
const LIVE2D_WIDTH = 400;
const LIVE2D_HEIGHT = 500;

// 默认偏移量（像素）
const DEFAULT_LEFT = -80; // 距离左侧的像素
const DEFAULT_BOTTOM = 0; // 距离底部的像素


const canvasRef = ref(null);
const l2dapp = new Application();
const live2DSprite = new Live2DSprite();

// 检查屏幕宽度是否大于等于 1080px
const isLargeScreen = window.innerWidth >= 1080;

isLargeScreen ? Config.MouseFollow = false : Config.MouseFollow = true;

// 初始化 Live2D 精灵
live2DSprite.init({
    modelPath: '/src/assets/live2d/阿米娅(1).model3.json',
    ticker: Ticker.shared
});

// 添加点击事件监听
live2DSprite.onLive2D('hit', ({ hitAreaName, x, y }) => {
    console.log('点击区域:', hitAreaName, 'at', x, y);
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
    const model = manager._models.at(0);
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
let startBottom = 0;

const onMouseDown = (e) => {
    if (!canvasRef.value) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    // 解析当前 left/bottom
    startLeft = parseInt(canvasRef.value.style.left, 10) || 0;
    startBottom = parseInt(canvasRef.value.style.bottom, 10) || 0;
    document.addEventListener('mousemove', onMouseMoveDrag);
    document.addEventListener('mouseup', onMouseUp);
};

const onMouseMoveDrag = (e) => {
    if (!isDragging || !canvasRef.value) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    // 更新 left/bottom
    canvasRef.value.style.left = `${startLeft + dx}px`;
    canvasRef.value.style.bottom = `${startBottom - dy}px`;
};

const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMoveDrag);
    document.removeEventListener('mouseup', onMouseUp);
};

onMounted(async () => {
    // 动态加载 live2dcubismcore.min.js 脚本
    const script = document.createElement('script');
    script.src = '/src/utils/live2dcubismcore.min.js';
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

        // 设置初始偏移
        canvasRef.value.style.left = DEFAULT_LEFT + 'px';
        canvasRef.value.style.bottom = DEFAULT_BOTTOM + 'px';

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
});

onUnmounted(() => {
    // 释放资源
    live2DSprite.destroy();
    // 移除 live2dcubismcore.min.js 脚本
    const script = document.getElementById('live2d-cubismcore-script');
    if (script) {
        script.remove();
    }
    // 移除鼠标监听
    window.removeEventListener('mousemove', live2DSprite._handleMouseMove);
    if (canvasRef.value) {
        canvasRef.value.removeEventListener('mousedown', onMouseDown);
    }
});
</script>

<style scoped>
#live2d {
    position: fixed;
    left: 0;
    bottom: 0;
    width: v-bind(LIVE2D_WIDTH + 'px');
    height: v-bind(LIVE2D_HEIGHT + 'px');
    z-index: 1000;
    pointer-events: auto;
}
</style>