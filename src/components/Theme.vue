<template>
    <mdui-tooltip :content="tip">
        <mdui-button-icon :icon="brightness_icon" @click="changeTheme"></mdui-button-icon>
    </mdui-tooltip>
    <mdui-dialog close-on-overlay-click close-on-esc id="colorDialog">
        <mdui-top-app-bar slot="header">
            <mdui-button-icon icon="close"
                onclick="document.getElementById('colorDialog').open = false;"></mdui-button-icon>
            <mdui-top-app-bar-title>设置颜色</mdui-top-app-bar-title>
            <mdui-button variant="tonal" @click="saveTheme">保存</mdui-button>
        </mdui-top-app-bar>
        <div class="main">
            <p>
                <span>颜色主题</span>
                <br />
                <mdui-button style="margin-top: .8rem;" id="color-picker" variant="tonal">打开颜色选择器</mdui-button>
            <p>
                已选择的颜色: <span id="colorShow">{{ color }}</span>
            </p>
            <mdui-button style="margin-top: .8rem;" id="color-from-image" variant="tonal">从图片中提取颜色</mdui-button>
            </p>
            <mdui-divider vertical></mdui-divider>
            <p>
                <span>壁纸设置</span>
            <div class="color-wallpaper" id="color-wallpaper-div">
                请选择一张壁纸
                <input id="color_imageInput" type="file" accept="image/png, image/jpeg">
            </div>
            <mdui-checkbox id="chkbox" disabled>使用该图片作为背景</mdui-checkbox>
            </p>
        </div>
    </mdui-dialog>
</template>

<script setup>
import { getCookie, setCookie } from '@/utils/cookie';
import { getColorFromImage, observeResize, setColorScheme, setTheme, snackbar } from 'mdui';
import { onMounted, ref } from 'vue';
import Compressor from 'compressorjs';

import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';

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


/**
 * 颜色主题
 */

if (getCookie("color").length <= 2) {
    //颜色主题没有被初始化
    setCookie("color", "#6750A4");
}

const color = ref(getCookie("color"))
setColorScheme(getCookie("color"));
const imgElement = new Image();

/**
 * 保存颜色主题
 */
const saveTheme = () => {
    const chkbox = document.getElementById("chkbox")
    const chkStste = String(chkbox.hasAttribute("checked"))

    if (chkStste) {
        try {
            localStorage.setItem("background", imgElement.src)
        } catch (e) {
            snackbar({ message: "图片保存失败！请考虑手动压缩图片(图片大小 <= 5MB)后再试。", autoCloseDelay: 3000 })
            console.warn(e)
            return;
        }
    }

    setCookie("color", color.value)
    setCookie("bgImage", chkStste)

    setColorScheme(color.value)

    snackbar({ placement: "top-end", message: "已保存并应用主题设置！", autoCloseDelay: 3000 })
}

onMounted(() => {
    document.getElementById('color_imageInput').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const imageDiv = document.getElementById('color-wallpaper-div')
            function useBigImg() {
                snackbar({ placement: "top-end", message: "目前图片为无法保存模式，仅可使用提取颜色功能", autoCloseDelay: 3000, queue: "img" })

                const reader = new FileReader();

                reader.onload = function (e) {
                    imgElement.src = e.target.result;

                    imageDiv.style.backgroundImage = `url('${imgElement.src}')`;

                    const chkbox = document.getElementById("chkbox")
                    chkbox.setAttribute("disabled", true);
                    chkbox.removeAttribute("checked")
                };

                reader.readAsDataURL(file);

            }
            new Compressor(file, {
                convertSize: 4900000,
                success(result) {
                    console.log(result)
                    const reader = new FileReader();

                    reader.onload = function (e) {
                        imgElement.src = e.target.result;

                        const imageDiv = document.getElementById('color-wallpaper-div')
                        imageDiv.style.backgroundImage = `url('${imgElement.src}')`;

                        const chkbox = document.getElementById("chkbox")
                        chkbox.removeAttribute("disabled")
                    };

                    reader.readAsDataURL(result);
                },
                error(err) {
                    snackbar({ placement: "top-end", message: "图片压缩失败！请考虑手动压缩图片(图片大小 <= 5MB)后再试。", autoCloseDelay: 3000, queue: "img" })
                    useBigImg();
                }
            })

        }
    });
    const dialog = document.getElementById("colorDialog")
    const pickr = Pickr.create({
        el: '#color-picker',
        theme: 'nano', // or 'monolith', or 'nano'

        swatches: [
            'rgba(255, 0, 0, 1)',    // 红色
            'rgba(0, 255, 0, 1)',    // 绿色
            'rgba(0, 0, 255, 1)',    // 蓝色
            'rgba(255, 255, 0, 1)',  // 黄色
            'rgba(0, 255, 255, 1)',  // 青色
            'rgba(255, 0, 255, 1)',  // 品红
            'rgba(255, 165, 0, 1)'   // 橙色
        ],

        components: {

            // Main components
            preview: true,
            opacity: true,
            hue: true,

            interaction: {
                input: true,
                cancel: true,
                save: true,
            }
        },

        lockOpacity: true,
        default: color.value,
        position: "right-middle",
        i18n: {
            // UI 中可见的字符串
            'ui:dialog': '颜色选择器对话框',
            'btn:toggle': '切换颜色选择器对话框',
            'btn:swatch': '颜色样本',
            'btn:last-color': '使用上一个颜色',
            'btn:save': '保存',
            'btn:cancel': '重置',
            'btn:clear': '清除',

            // 用于 aria-label 的字符串
            'aria:btn:save': '保存并关闭',
            'aria:btn:cancel': '取消并关闭',
            'aria:btn:clear': '清除并关闭',
            'aria:input': '颜色输入字段',
            'aria:palette': '颜色选择区域',
            'aria:hue': '色相选择滑块',
            'aria:opacity': '不透明度选择滑块'
        },
        useAsButton: true,
    });

    pickr.on("save", function () {
        const colorShow = document.getElementById("colorShow")
        color.value = "#" + pickr.getColor().toHEXA().join("")
        colorShow.style.backgroundColor = color.value
        pickr.hide()
    })

    document.getElementById("color-from-image").addEventListener("click", function () {
        if (!imgElement.src || imgElement.src.trim() === '') {
            console.log("Image src is empty");
            snackbar({ placement: "top-end", message: "请先选择一个图片！", autoCloseDelay: 3000 })
        } else {
            getColorFromImage(imgElement).then(c => {
                color.value = c
                colorShow.style.backgroundColor = color.value
                pickr.setColor(color.value)
            });
        }
    })
    
    if (getCookie("bgImage") === "true") {
        imgElement.src = localStorage.getItem("background")
        const chkbox = document.getElementById("chkbox")
        chkbox.setAttribute("checked", true)
        const imageDiv = document.getElementById('color-wallpaper-div')
        imageDiv.style.backgroundImage = `url('${imgElement.src}')`;
    } else {
        localStorage.removeItem("background")
    }

})
</script>

<script>
export const openDialog = () => {
    const dialog = document.getElementById("colorDialog")
    dialog.open = true;
    const dialogObserver = observeResize(document.body, function (entry, observer) {
        dialog.fullscreen = (entry.borderBoxSize[0].inlineSize <= 584)
    })
    dialog.addEventListener("close", () => { dialogObserver.unobserve(); })
}
</script>
<style scoped>
#colorShow {
    border-radius: var(--mdui-shape-corner-medium);
    border: 0px;
    background-color: rgb(var(--mdui-color-primary-light));
    padding: .7rem;
}

@media (max-width: 600px) {
    .main {
        width: 95%;
        height: 100%;
        flex-direction: column;
        /* 主轴方向设置为垂直 */
        justify-content: flex-start;
    }

    mdui-divider {
        display: none;
    }

    .color-wallpaper {
        height: 9rem;
        width: 16rem;
    }
}

@media (min-width: 601px) {
    .main {
        max-width: 512px;
        width: 65vw;
        justify-content: space-between;
        /* 子元素间隔均匀分布 */
        flex-direction: row;
        /* 主轴方向设置为水平 */
    }

    .color-wallpaper {
        height: 8.15rem;
        width: 100%;
    }
}

mdui-divider {
    height: auto;
    width: 3px;
    margin: .2rem
}

.main {
    min-width: 300px;
    display: flex;
}

p {
    width: 100%;
    margin-left: 1rem;
    margin-right: 1rem;
}

.color-wallpaper {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    background-size: cover;
    background-position: center;
    text-shadow: white .1em .1em .2em;
    border-radius: var(--mdui-shape-corner-extra-small);
    border: .0625rem solid rgb(var(--mdui-color-outline));
    margin: .5rem 0rem;
    margin-left: auto;
    margin-right: auto;
}

.color-wallpaper input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
    cursor: pointer;
}
</style>