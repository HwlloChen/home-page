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
        dateFlag.value = true

        setInterval(() => {
            const now = new Date();
            refDate.value = formatDuration(now.getTime() - createdDate.getTime())

        }, 1000);
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
function formatDuration(ms) {
    // 定义常量
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const daysPerYear = 365;
    const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // 计算各个单位的值
    let remaining = ms;
    let years = Math.floor(remaining / 1000 / secondsPerMinute / minutesPerHour / hoursPerDay / daysPerYear);
    remaining %= 1000 * secondsPerMinute * minutesPerHour * hoursPerDay * daysPerYear;
    let days = Math.floor(remaining / 1000 / secondsPerMinute / minutesPerHour / hoursPerDay);
    remaining %= 1000 * secondsPerMinute * minutesPerHour * hoursPerDay;
    let hours = Math.floor(remaining / 1000 / secondsPerMinute / minutesPerHour);
    remaining %= 1000 * secondsPerMinute * minutesPerHour;
    let minutes = Math.floor(remaining / 1000 / secondsPerMinute);
    // 重新赋值remaining
    remaining %= 1000 * secondsPerMinute;
    let seconds = Math.floor(remaining / 1000);

    // 处理闰年
    const isLeapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    if (isLeapYear(years)) {
        daysPerMonth[1] = 29;
    }

    // 计算月
    let months = 0;
    while (days >= daysPerMonth[months]) {
        days -= daysPerMonth[months];
        months++;
    }

    // 格式化输出
    return `${years}年${months}月${days}天${hours}小时${minutes}分钟${seconds}秒`;
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