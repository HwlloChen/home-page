<template>
    <mdui-top-app-bar scroll-behavior="elevate" id="appbar" :class="{ 'glass': bgImage }">
        <div style="width: 5px;"></div>
        <mdui-top-app-bar-title>{{ globalVars.siteName }}</mdui-top-app-bar-title>
        <div style="flex-grow: 1"></div>
        <IPv6Checker />
        <mdui-tooltip :content="tip">
            <mdui-button-icon :icon="brightness_icon" @click="changeTheme"></mdui-button-icon>
        </mdui-tooltip>
        <mdui-dropdown>
            <mdui-button-icon slot="trigger" icon="more_vert"></mdui-button-icon>
            <mdui-menu>
                <mdui-menu-item @click="openDialog">主题设置</mdui-menu-item>
                <mdui-menu-item @click="clearlocalStorage">清除localStorage</mdui-menu-item>
            </mdui-menu>
        </mdui-dropdown>
    </mdui-top-app-bar>
</template>

<script setup>
import IPv6Checker from './IPv6Checker.vue';
import { getCookie, setCookie } from '@/utils/cookie';
import { confirm, setTheme } from 'mdui';
import { ref, inject } from 'vue';
import { openDialog } from './Theme.vue';
import { bgImage } from './Theme.vue';
import { globalVars } from '@/utils/globalVars';

const tip = ref("明暗主题")
const brightness_icon = ref()

/**
 * 设置明暗主题
 */
const brightness_modes = ['auto', 'light', 'dark']
setTheme(globalVars.theme.light)
brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(globalVars.theme.light)]
tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(globalVars.theme.light)]
const changeTheme = () => {
    var value = brightness_modes.indexOf(globalVars.theme.light) + 1;
    if (value > 2) value = 0;
    globalVars.theme.light = brightness_modes[value]
    setTheme(globalVars.theme.light)
    brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(globalVars.theme.light)]
    tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(globalVars.theme.light)]
    localStorage.setItem("theme", JSON.stringify(globalVars.theme))
}
</script>

<script>

document.title = globalVars.siteName

const clearlocalStorage = () => {
    confirm({
        headline: "清除数据？",
        description: "这将导致你的所有本地自定义信息丢失！",
        confirmText: "清除",
        cancelText: "取消",
        onConfirm: () => { localStorage.clear(); location.reload() },
    });
}

</script>

<style scoped>
mdui-top-app-bar {
    position: fixed !important;
    height: 4rem;
    align-items: center;
}

mdui-button-icon {
    transition: font-variation-settings .2s cubic-bezier(.2, 0, 0, 1);
}
</style>