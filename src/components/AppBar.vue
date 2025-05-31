<template>
    <mdui-top-app-bar scroll-behavior="elevate" id="appbar" class="glass-border">
        <div style="width: 5px;"></div>
        <mdui-button-icon icon="home" class="home-button" @click="goHome" v-if="!isHomePage"></mdui-button-icon>
        <div class="appbar-title-wrap">
            <mdui-top-app-bar-title>
                {{ titleText }}
            </mdui-top-app-bar-title>
            <span class="subtitle" id="mainsubtitle">{{ subtitleText }}</span>
        </div>
        <IPv6Checker />
        <mdui-button-icon icon="queue_music" :="{ disabled: !available, loading: loading }"
            :style="player.playingMusic.value.pause ? '' : 'color: rgb(var(--mdui-color-primary))'" @click="opendrawer"
            v-if="hasV6 && globalVars.navidrome.enable"></mdui-button-icon>
        <mdui-tooltip :content="tip">
            <mdui-button-icon :icon="brightness_icon"
                @click="changeTheme(brightness_modes.indexOf(globalVars.theme.light) + 1)"></mdui-button-icon>
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
            subtitle.text(`欢迎来自「${formatLocation(data.location)}」的朋友！`, 0, 3000)
        })
        .catch((e) => {
            console.warn(e)
        })
})
</script>

<script>

const titleText = ref(globalVars.site.name)
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

var clearLock = false
export const subtitle = {
    async text(text, timeout = 0, interval = 1000) {
        const d = document.getElementById("mainsubtitle")
        clearLock = true
        if (subtitleText.value.length >= 1) {
            setTimeout(() => {
                d.style.opacity = 0;
                setTimeout(() => {
                    subtitleText.value = text
                    d.style.opacity = 1
                    if (interval > 0) {
                        setTimeout(() => {
                            // Only clear if the text hasn't changed
                            if (subtitleText.value === text) {
                                clearLock = false
                                subtitle.clear()
                            }
                        }, interval);
                    } else {
                        clearLock = false
                    }
                }, timeout / 2);
            }, timeout / 2);
        } else {
            clearLock = false
            subtitleText.value = text
            d.style.opacity = 1;
            setTimeout(() => {
                subtitleText.value = text
                d.style.opacity = 1
                if (interval > 0) {
                    setTimeout(() => {
                        // Only clear if the text hasn't changed
                        if (subtitleText.value === text) {
                            clearLock = false
                            subtitle.clear()
                        }
                    }, interval);
                } else {
                    clearLock = false
                }
            }, timeout / 2);
        }
    },
    async clear() {
        if (clearLock) return
        const d = document.getElementById("mainsubtitle")
        d.style.opacity = 0;
        setTimeout(() => {
            if (clearLock) return
            subtitleText.value = ""
        }, 200);
    }
}

export const setTitle = (appbarText, documentText) => {
    titleText.value = appbarText
    document.title = documentText ? documentText : appbarText
}

</script>

<style lang="less" scoped>
mdui-top-app-bar {
    position: fixed !important;
    height: 4rem;
    align-items: center;
    transition: background-color backdrop-filter 0.25s cubic-bezier(0.2, 0, 0, 1);
}

.appbar-title-wrap {
    display: flex;
    align-items: flex-start;
    position: relative;
    flex-direction: row;
    flex-grow: 1;
    min-width: 0;
    /* 允许子项收缩，防止子项撑大父容器 */

    mdui-top-app-bar-title {
        line-height: 1.7rem;
        flex-shrink: 0;
        max-width: calc(100vw - 350px);
    }
}

@media (max-width: 600px) {
    mdui-top-app-bar-title {
        max-width: calc(100vw - 225px) !important;
    }
}

@media (max-width: 1023px) {
    .appbar-title-wrap {
        flex-direction: column;
        align-items: flex-start;
        position: relative;
        min-width: 0;
        height: auto;
    }

    .subtitle {
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        /* 紧贴主标题下方 */
        width: 100%;
        max-width: 90vw;
        padding-left: 0;
        pointer-events: none;
    }
}

@media (min-width: 1024px) {
    .appbar-title-wrap {
        display: flex;
        flex-direction: row;
        align-items: center;
        min-width: 0;
        /* 允许子项收缩，防止子项撑大父容器 */
        flex: 1 1 0%;
    }

    .appbar-title-wrap mdui-top-app-bar-title {
        flex-shrink: 0;
        width: auto;
    }

    .subtitle {
        position: static;
        display: flex;
        align-items: center;
        vertical-align: middle;
        margin-left: .6em;
        max-width: 100%;
        min-width: 0;
        flex: 1 1 0%;
        overflow: hidden;
    }
}

.subtitle {
    color: gray;
    transition: all .85s var(--mdui-motion-easing-standard);
    opacity: 0;
    white-space: nowrap;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, #000 80%, transparent 100%);
    mask-image: linear-gradient(to right, #000 80%, transparent 100%);
    pointer-events: none;
    user-select: none;
    font-size: var(--mdui-typescale-title-small-size);
    font-weight: var(--mdui-typescale-body-small-weight);
    letter-spacing: var(--mdui-typescale-body-small-tracking);
    line-height: var(--mdui-typescale-body-small-line-height);
    padding-left: 0;
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