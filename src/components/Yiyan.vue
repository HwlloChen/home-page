<!-- 网站上方一言 -->
<script setup>
import { bgImage } from "./Theme.vue";
import { ref, onMounted } from "vue";

onMounted(() => {
    if (!showed || hitokoto == undefined) {
        //从Hitokoto获取数据
        fetch('https://v1.hitokoto.cn')
            .then(response => response.json())
            .then(data => {
                hitokoto = {
                    text: data.hitokoto,
                    who: data.hitokoto,
                }
                const yiyan = document.getElementById("yiyan")
                yiyan.innerHTML = ''
                yiyan.classList.remove("blink")
                const speed = 120; // 打字速度，单位为毫秒
                let index = 0;
                function typeWriter() {
                    if (index < hitokoto.text.length) {
                        yiyan.innerHTML += hitokoto.text.charAt(index);
                        index++;
                        setTimeout(typeWriter, speed);
                    } else {
                        yiyan.classList.add("blink")
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
    <div id="yiyan" class="ubuntu-medium blink">
        <!--Typing Yiyan-->
        {{ YIYAN }}
    </div>
</template>

<script>
const YIYAN = ref("Hitokotooooo...")
var showed = false
var hitokoto = undefined
</script>

<style lang="less" scoped>
#yiyan {
    white-space: nowrap;
    border-right: .25rem solid;
    padding-right: .2rem;
    font-size: 3rem;
    margin: 3rem;
    margin-top: 2.5rem;
    width: fit-content;
    overflow: hidden;
    border-color: rgb(var(--mdui-color-primary));
}

.blink {
    /* 为打字效果添加一个闪烁光标 */
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

/* 针对深色主题 */
.mdui-theme-dark {
    #yiyan {
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }
}

/* 针对浅色主题 */
.mdui-theme-light {
    #yiyan {
        text-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
    }
}

.mdui-theme-auto {

    /* 针对深色主题 */
    @media (prefers-color-scheme: dark) {
        #yiyan {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
        }
    }


    /* 针对浅色主题 */
    @media (prefers-color-scheme: light) {
        #yiyan {
            text-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
        }
    }
}
</style>
