<template>
    <mdui-top-app-bar scroll-behavior="elevate" id="appbar">
        <div style="width: 5px;"></div>
        <mdui-top-app-bar-title>
            <h1>{{ globalVars.siteName }}</h1>
            <span class="subtitle" id="mainsubtitle">{{ subtitleText }}</span>
        </mdui-top-app-bar-title>
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
import { confirm, setTheme } from 'mdui';
import { onMounted, ref } from 'vue';
import { openDialog } from './Theme.vue';
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

onMounted(() => {
    function formatLocation(l) {
        var args = l.split("|")
        args.pop()
        args = args.filter(s => s != "0") //去除空值
        for (var i = 1; i < args.length; i++) if (args[i] == args[i - 1]) args.splice(i, 1) //去重
        args.reverse() //倒序（选取两个小地方）
        var sum = ""
        // 获取最多两个量
        var i = 0
        for (const e of args) {
            if (i >= 2) break;
            if (sum.length) sum = e + " " + sum; else sum += e;
            i++;
        }

        return sum
    }

    fetch(`${globalVars.backpoint}/ip`)
        .then((response) => response.json())
        .then((data) => {
            subtitle.text(`欢迎来自「${formatLocation(data.location)}」的朋友！`)
            setTimeout(() => {
                subtitle.clear()
            }, 4000);
        })
        .catch((e) => {
            console.warn(e)
        })
})
</script>

<script>

const subtitleText = ref("")
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

export const subtitle = {
    text(text) {
        const d = document.getElementById("mainsubtitle")
        if (subtitleText.value.length >= 1) {
            d.style.opacity = 0;
            setTimeout(() => {
                subtitleText.value = text
                d.style.opacity = 1
            }, 500);
        } else {
            subtitleText.value = text
            d.style.opacity = 1;
        }
    },
    clear() {
        const d = document.getElementById("mainsubtitle")
        d.style.opacity = 0;
        setTimeout(() => {
            subtitleText.value = ""
        }, 700);
    }
}

</script>

<style lang="less" scoped>
mdui-top-app-bar {
    position: fixed !important;
    height: 4rem;
    align-items: center;
    transition: background-color backdrop-filter 0.25s cubic-bezier(0.2, 0, 0, 1);
}

.glass {
    mdui-top-app-bar {
        background-color: rgba(var(--mdui-color-surface-container), 0.8);
        backdrop-filter: blur(7.5px);
        -webkit-backdrop-filter: blur(7.5px);
    }

    mdui-top-app-bar[scrolling] {
        background-color: rgba(var(--mdui-color-surface-container), 0.35);
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
    }
}

mdui-button-icon {
    transition: font-variation-settings .2s cubic-bezier(.2, 0, 0, 1);
}

.subtitle {
    color: gray;
    transition: all .85s var(--mdui-motion-easing-standard);
    opacity: 0;

    @media(max-width: 1080px) {
        width: 100%;
        display: block;
        position: absolute;
        font-size: var(--mdui-typescale-title-small-size);
        font-weight: var(--mdui-typescale-body-small-weight);
        letter-spacing: var(--mdui-typescale-body-small-tracking);
        line-height: 0 !important;
    }

    @media (min-width: 1081px) {
        display: inline-block;
        font-size: var(--mdui-typescale-title-medium-size);
        font-weight: var(--mdui-typescale-body-small-weight);
        letter-spacing: var(--mdui-typescale-body-small-tracking);
        line-height: var(--mdui-typescale-body-small-line-height);
        padding-left: .4em;
        overflow: hidden;
    }


    white-space: nowrap;
    text-overflow: ellipsis;
}

h1 {
	display: inline;
	color: rgb(var(--mdui-color-on-surface));
	font-size: var(--mdui-typescale-title-large-size);
	font-weight: var(--mdui-typescale-title-large-weight);
	letter-spacing: var(--mdui-typescale-title-large-tracking);
	line-height: 2.5rem;
    margin: 0;
    padding: 0;
}
</style>