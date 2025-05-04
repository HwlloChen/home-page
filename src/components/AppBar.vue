<template>
    <mdui-top-app-bar scroll-behavior="elevate" id="appbar" class="glass-border">
        <div style="width: 5px;"></div>
        <mdui-button-icon icon="home" class="home-button" @click="goHome" v-if="!isHomePage"></mdui-button-icon>
        <mdui-top-app-bar-title>
            {{ globalVars.site.name }}
            <span class="subtitle" id="mainsubtitle">{{ subtitleText }}</span>
        </mdui-top-app-bar-title>
        <div style="flex-grow: 1"></div>
        <IPv6Checker />
        <mdui-button-icon icon="queue_music" :="{ disabled: !available, loading: loading }"
            :style="player.playingMusic.value.pause ? '' : 'color: rgb(var(--mdui-color-primary))'" @click="opendrawer"
            v-if="hasV6 && globalVars.navidrome.enable"></mdui-button-icon>
        <mdui-tooltip :content="tip">
            <mdui-button-icon :icon="brightness_icon" @click="changeTheme(brightness_modes.indexOf(globalVars.theme.light) + 1)"></mdui-button-icon>
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
import IPv6Checker, { hasV6 } from './IPv6Checker.vue';
import { available, loading, opendrawer, player } from './SideMusic.vue';
import { confirm, setTheme } from 'mdui';
import { onMounted, ref, computed } from 'vue';
import { openDialog } from './Theme.vue';
import { globalVars } from '@/utils/globalVars';
import { artalk } from './Comments.vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isHomePage = computed(() => route.path === '/');

function goHome() {
    router.push('/');
}

/**
 * 设置明暗主题
 */

setTheme(globalVars.theme.light)
brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(globalVars.theme.light)]
tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(globalVars.theme.light)]

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

    fetch(`${globalVars.site.backpoint}/ip`)
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
document.title = globalVars.site.name

const tip = ref("明暗主题")
const brightness_icon = ref()
export const brightness_modes = ['auto', 'light', 'dark']

const clearlocalStorage = () => {
    confirm({
        headline: "清除数据？",
        description: "这将导致你的所有本地自定义信息丢失！",
        confirmText: "清除",
        cancelText: "取消",
        onConfirm: () => { localStorage.clear(); location.reload() },
    });
}

/**
 * Change light theme
 * @param value 0: auto, 1: light, 2: dark
 */
export function changeTheme(value) {
    value = value % 3;
    globalVars.theme.light = brightness_modes[value]
    setTheme(globalVars.theme.light)
    artalk === artalk ? artalk.setDarkMode(["auto", false, true][value]) : null
    brightness_icon.value = ['brightness_auto', 'light_mode', 'dark_mode'][brightness_modes.indexOf(globalVars.theme.light)]
    tip.value = ['跟随系统', '亮色模式', '暗色模式'][brightness_modes.indexOf(globalVars.theme.light)]
    localStorage.setItem("theme", JSON.stringify(globalVars.theme))
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
    border: 0 !important;

    mdui-top-app-bar {
        background-color: rgba(var(--mdui-color-surface-container), 0.8);
        backdrop-filter: blur(7.5px);
        -webkit-backdrop-filter: blur(7.5px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    mdui-top-app-bar[scrolling] {
        background-color: rgba(var(--mdui-color-surface-container), 0.35);
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.18);
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

.home-button {
    transform: translateX(-100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-right: 8px;
    
    :deep(mdui-icon) {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover :deep(mdui-icon) {
        transform: scale(1.1);
    }
}

:not(.isHomePage) .home-button {
    transform: translateX(0);
    opacity: 1;
}
</style>