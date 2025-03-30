<script setup>
import { globalVars } from '@/utils/globalVars';
import config from '../../package.json';
import { onBeforeMount, ref } from 'vue';
import { opendrawer, player } from './Music.vue';
import { hasV6 } from './IPv6Checker.vue';

const refDate = ref("")
const dateFlag = ref(false)
var createdDate
onBeforeMount(() => {
    if (Date.parse(globalVars.site.created_date) == Date.parse(globalVars.site.created_date)) {
        createdDate = new Date(globalVars.site.created_date)
        const createdDateNumber = createdDate.getTime()
        dateFlag.value = true

        setInterval(() => { refDate.value = formatDuration(new Date().getTime() - createdDateNumber) }, 1000);
    } else {
        dateFlag.value = false
    }
})
</script>

<template>
    <footer>
        <div class="footer-music left">
            <template v-if="hasV6 && globalVars.navidrome.enable">
                <img class="playing-music-cover" :src="player.playingMusic.value.cover" @click="opendrawer">
                <div class="footer-music-info">
                    <b>{{ player.playingMusic.value.title }}</b>
                    <br>
                    {{ player.playingMusic.value.pause ? '⏸️ Paused:' : '🎵 Playing:' }}
                    {{ `${player.playingMusic.value.nowTimeString} / ${player.playingMusic.value.maxTimeString}` }}
                </div>
            </template>
        </div>
        <div class="footer-content center">
            <p>©<span v-if="dateFlag">{{ createdDate.getFullYear() }} - </span>{{ new Date().getFullYear() }} ♥️ {{
                globalVars.author.name }}</p>
            <p v-if="dateFlag">本站已持续运行{{ refDate }}</p>
            <p><a href="https://icp.gov.moe/?keyword=20244114" target="_blank">萌ICP备20244114号</a></p>
            <p>Powered by <a href="https://gitee.com/HwlloChen/home-page" target="_blank">ChenServer v{{ config.version
            }}</a></p>
        </div>
        <div class="right moeicp">
            <a href="https://icp.gov.moe/?keyword=20244114" target="_blank"><img src="/src/assets/moe_ico64.png"></a>
        </div>
    </footer>
</template>

<script>

// 预先计算各时间单位的毫秒数，使用常量避免重复计算
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_YEAR = MS_PER_DAY * 365;

function formatDuration(ms) {
    // 使用 Math.floor 进行向下取整，比 parseInt 性能更好
    const years = Math.floor(ms / MS_PER_YEAR);
    ms %= MS_PER_YEAR;

    const days = Math.floor(ms / MS_PER_DAY);
    ms %= MS_PER_DAY;

    const hours = Math.floor(ms / MS_PER_HOUR);
    ms %= MS_PER_HOUR;

    const minutes = Math.floor(ms / MS_PER_MINUTE);
    ms %= MS_PER_MINUTE;

    const seconds = Math.floor(ms / MS_PER_SECOND);

    // 使用数组和 filter 来动态构建输出字符串，只显示非零值
    const parts = [
        years > 0 && `${years}年`,
        days > 0 && `${days}天`,
        hours > 0 && `${hours}时`,
        minutes > 0 && `${minutes}分`,
        `${seconds}秒`
    ].filter(Boolean);

    return parts.join('');
}
</script>

<style lang="less" scoped>
footer {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 90px;
    box-sizing: border-box;
    margin: 0.5rem 0 0 0;
    padding: 2rem 1rem 1rem 1rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    transition: all .3s var(--mdui-motion-easing-standard);

    /* 页脚圆角边框 */
    --mask:
        radial-gradient(21.75px at 50% 30.75px, #000 99%, #0000 101%) calc(50% - 30px) 0/60px 100%,
        radial-gradient(21.75px at 50% -15.75px, #0000 99%, #000 101%) 50% 15px/60px 100% repeat-x;
    -webkit-mask: var(--mask);
    mask: var(--mask);

    background-color: rgb(var(--mdui-color-surface-container));

    .glass & {
        background-color: rgba(var(--mdui-color-surface-container), 0.6);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);

        .mdui-theme-light & {
            background-color: rgba(var(--mdui-color-surface-container), 0.45) !important;
        }

        .mdui-theme-auto & {
            @media (prefers-color-scheme: light) {
                background-color: rgba(var(--mdui-color-surface-container), 0.45) !important;
            }
        }
    }

    font-size: 1rem;

    @media (max-width: 600px) {
        padding-right: 1.3rem;
        font-size: 0.8rem;
    }

    @media (max-width: 1080px) and (min-width: 601px) {
        font-size: 0.9rem;
    }
}

.footer-content {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 1080px;
}

.footer-music {
    height: 100%;
    width: auto;
    display: flex;

    .playing-music-cover {
        height: 3.75rem;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        display: block;
        border-radius: var(--mdui-shape-corner-large);
        cursor: pointer;
    }

    .footer-music-info {
        padding: 0.5rem;
        flex: 1;
        line-height: 1.35rem;
    }
}

.right,
.left {
    position: relative;
    flex: 1;
    display: flex;

    @media (max-width: 1024px) {
        display: none;
    }
}

.right {
    margin-right: 2rem;
    align-items: end;
    justify-items: right;
    justify-content: right;
}

.left {
    margin-left: 2rem;
}

.center {
    flex: 2;
}

.moeicp {
    img {
        height: 55px;
        width: 55px;
    }
}

p {
    margin: 0.2rem;
}
</style>