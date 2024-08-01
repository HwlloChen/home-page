<template>
    <mdui-top-app-bar scroll-behavior="elevate">
        <div style="width: 5px;"></div>
        <mdui-top-app-bar-title>ChenServer</mdui-top-app-bar-title>
        <div style="flex-grow: 1"></div>
        <IPv6Checker />
        <Theme />
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
import Theme from './Theme.vue';
import { openDialog } from './Theme.vue';
</script>

<style scoped>
mdui-top-app-bar {
    position: fixed !important;
    height: 4rem;
    align-items: center;
}
</style>