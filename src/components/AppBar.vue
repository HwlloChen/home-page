<template>
    <mdui-top-app-bar scroll-behavior="elevate" id="appbar" :class="{'glass': bgImage}">
        <div style="width: 5px;"></div>
        <mdui-top-app-bar-title>ChenServer</mdui-top-app-bar-title>
        <div style="flex-grow: 1"></div>
        <IPv6Checker />
        <mdui-tooltip :content="tip">
            <mdui-button-icon :icon="brightness_icon" @click="changeTheme"></mdui-button-icon>
        </mdui-tooltip>
        <mdui-dropdown>
            <mdui-button-icon slot="trigger" icon="more_vert"></mdui-button-icon>
            <mdui-menu>
                <mdui-menu-item @click="openDialog">主题设置</mdui-menu-item>
            </mdui-menu>
        </mdui-dropdown>
    </mdui-top-app-bar>
</template>

<script setup>
import IPv6Checker from './IPv6Checker.vue';
import { getCookie, setCookie } from '@/utils/cookie';
import { setTheme } from 'mdui';
import { ref } from 'vue';
import { openDialog } from './Theme.vue';
import { bgImage } from './Theme.vue';

const tip = ref("明暗主题")
const brightness_icon = ref()

/**
 * 设置明暗主题
 */
const brightness_modes = ['auto', 'light', 'dark']
if (!brightness_modes.includes(getCookie("theme"))) {
    //theme没有被储存过或是不合法
    setCookie("theme", "auto"); //默认为auto
}
setTheme(getCookie("theme"))
brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(getCookie("theme"))]
tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(getCookie("theme"))]
const changeTheme = () => {
    var value = brightness_modes.indexOf(getCookie("theme")) + 1;
    if (value > 2) value = 0;
    setCookie("theme", brightness_modes[value])
    setTheme(getCookie("theme"))
    brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(getCookie("theme"))]
    tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(getCookie("theme"))]
}
</script>

<style scoped>
mdui-top-app-bar {
    position: fixed !important;
    height: 4rem;
    align-items: center;
}
</style>