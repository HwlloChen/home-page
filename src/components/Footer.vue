<script setup>
import { globalVars } from '@/utils/globalVars';
import config from '../../package.json';
import { onBeforeMount, ref } from 'vue';

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
        <p>©<span v-if="dateFlag">{{ createdDate.getFullYear() }} - </span>{{ new Date().getFullYear() }} ♥️ {{
            globalVars.author.name }}</p>
        <p v-if="dateFlag">本站已持续运行{{ refDate }}</p>
        <p>Powered by <a href="https://gitee.com/HwlloChen/home-page" target="_blank">ChenServer v{{ config.version
                }}</a></p>
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
    background-color: rgb(var(--mdui-color-surface-container));
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    --mask:
        radial-gradient(21.75px at 50% 30.75px, #000 99%, #0000 101%) calc(50% - 30px) 0/60px 100%,
        radial-gradient(21.75px at 50% -15.75px, #0000 99%, #000 101%) 50% 15px/60px 100% repeat-x;
    -webkit-mask: var(--mask);
    mask: var(--mask);
}

p {
    margin: 0.2rem;
}
</style>