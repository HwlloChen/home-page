<!-- 网站上方一言 -->
<script setup>
import { ref, onMounted } from "vue";

onMounted(() => {
    if (!showed || hitokoto == undefined) {
        //从Hitokoto获取数据
        fetch('https://v1.hitokoto.cn')
            .then(response => response.json())
            .then(data => {
                hitokoto = {
                    text: data.hitokoto,
                    who: data.from_who,
                    from: data.from
                }
                const blinker = document.getElementById("blinker")
                YIYAN.value = ''
                blinker.classList.remove("blink")
                const speed = 120; // 打字速度，单位为毫秒
                let index = 0;
                function typeWriter() {
                    if (index < hitokoto.text.length) {
                        YIYAN.value += hitokoto.text.charAt(index);
                        index++;
                        setTimeout(typeWriter, speed);
                    } else {
                        const yiyan_from = document.getElementById("yiyan-from")
                        if ((typeof hitokoto.who) === "string" && hitokoto.who.length >= 1) {
                            YIYAN_FROM.value = `——— ${hitokoto.who}`
                        } else {
                            YIYAN_FROM.value = `出自《${hitokoto.from}》`
                        }
                        yiyan_from.style.opacity = "1"
                        blinker.classList.add("blink")
                    }
                }
                typeWriter()
                showed = true
            })
            .catch(console.error)
    } else {
        YIYAN.value = hitokoto.text
    }
})
</script>

<template>
    <div class="yiyan-box ubuntu-medium">
        <div id="yiyan">
            <!--Typing Yiyan-->
            {{ YIYAN }}
            <span class="blink" id="blinker"></span>
        </div>
        <div id="yiyan-from-box">
            <div id="yiyan-from" class="ubuntu-light">
                {{ YIYAN_FROM }}
            </div>
        </div>
    </div>
</template>

<script>
const YIYAN = ref("Hitokotooooo...")
const YIYAN_FROM = ref("")
var showed = false
var hitokoto = undefined
</script>

<style lang="less" scoped>
#yiyan-from-box {
    width: 100%;
    padding-top: 0.3rem;
    padding-right: 3rem;

    font-size: 1.35rem;

    @media (max-width: 600px) {
        padding-right: 1.3rem;
        font-size: 1.15rem;
    }

    @media (max-width: 1080px) and (min-width: 601px) {
        padding-right: 2rem;
        font-size: 1.25rem;
    }
}

#yiyan-from {
    height: 2rem;
    color: grey;
    float: right;
    opacity: 0;
    /* 初始状态为透明 */
    transition: font-size .3s var(--mdui-motion-easing-standard), opacity 1.5s var(--mdui-motion-easing-standard);
    /* 设置过渡效果 */
}

.yiyan-box {
    width: 100%;
    overflow: hidden;
    display: flex;
    align-items: center; // 单行垂直居中
    flex-wrap: wrap; // 允许多行内容
    align-content: center; // 多行内容整体垂直居中

    @media (max-width: 600px) {
        justify-content: center; // 水平居中
        font-family: "Ubuntu", sans-serif !important;
        font-weight: 400 !important;
        font-style: normal !important;
    }
}

#yiyan {
    padding: 2.5rem 3rem 10px 3rem;
    font-size: 3rem;
    overflow: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: inherit;
    transition: font-size .3s var(--mdui-motion-easing-standard);

    @media (max-width: 600px) {
        font-size: 1.8rem;
        padding: 1.8rem 1.3rem 10px 1.3rem;
    }

    @media (max-width: 1080px) and (min-width: 601px) {
        font-size: 2.5rem;
        padding: 2.2rem 2rem 10px 2rem;
    }
}

#blinker {
    border-right: .25rem solid rgb(var(--mdui-color-primary));
    width: 0;
    padding-right: 2px;
}

.blink {
    // 为打字效果添加一个闪烁光标
    animation: blink-caret 1.1s cubic-bezier(0.7, 0, 0, 1) infinite;
}

@keyframes blink-caret {

    from,
    to {
        border-color: transparent;
    }

    50% {
        border-color: rgb(var(--mdui-color-primary));
    }
}

/* 针对不同主题的 text-shadow 处理 */
.mdui-theme-light #yiyan {
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.6);
}

.mdui-theme-dark #yiyan {
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.mdui-theme-auto #yiyan {
    @media (prefers-color-scheme: dark) {
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }

    @media (prefers-color-scheme: light) {
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.6);
    }
}
</style>
