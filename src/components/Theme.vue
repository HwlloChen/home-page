<template>
    <mdui-dialog close-on-overlay-click close-on-esc id="colorDialog">
        <mdui-top-app-bar slot="header">
            <mdui-button-icon icon="close"
                onclick="document.getElementById('colorDialog').open = false;"></mdui-button-icon>
            <mdui-top-app-bar-title>主题设置</mdui-top-app-bar-title>
            <mdui-button variant="elevated" @click="saveTheme">保存</mdui-button>
        </mdui-top-app-bar>
        <div class="main">
            <div class="theme-box">
                <span>颜色主题</span>
                <br />
                <mdui-button style="margin-top: .8rem;" id="color-picker" variant="tonal">打开颜色选择器</mdui-button>
                <p style="margin-top: 8px;">
                    已选择的颜色: <span id="colorShow">{{ color }}</span>
                </p>
                <mdui-button style="margin-top: .8rem;" id="color-from-image" variant="tonal">从图片中提取颜色</mdui-button>
                <br />
                <mdui-checkbox id="useGlass" :="{ checked: useGlass }">亚克力材质</mdui-checkbox>
            </div>
            <mdui-divider vertical></mdui-divider>
            <div class="theme-box">
                <span>壁纸设置</span>
                <div class="color-wallpaper" id="color-wallpaper-div">
                    请选择一张壁纸
                    <input id="color_imageInput" type="file" accept="image/png, image/jpeg">
                </div>
                <mdui-checkbox id="useImage" disabled>使用该图片作为背景</mdui-checkbox>
            </div>
        </div>
    </mdui-dialog>
</template>

<script setup>
import { getColorFromImage, observeResize, setColorScheme, snackbar } from 'mdui';
import { onMounted, ref } from 'vue';
import Compressor from 'compressorjs';

import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';
import { globalVars } from '@/utils/globalVars';

onMounted(() => {
    const useImageChkBox = document.getElementById("useImage")
    if (globalVars.theme.bgImage !== false) {
        console.log("byd")
        imgElement.src = globalVars.theme.bgImage
        const imageDiv = document.getElementById('color-wallpaper-div')
        imageDiv.style.backgroundImage = `url('${imgElement.src}')`;
        document.body.style.backgroundImage = `url('${imgElement.src}')`
        setTimeout(() => {
            // 添加延时防止操作失败
            useImageChkBox.setAttribute("checked", true)
            useImageChkBox.removeAttribute("disabled")
        }, 50);
    }

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

                    useImageChkBox.setAttribute("disabled", true);
                    useImageChkBox.removeAttribute("checked")
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

                        useImageChkBox.removeAttribute("disabled")
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
            opacity: false,
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
})
</script>

<script>
/**
 * 主题配置
 */

const color = ref(globalVars.theme.color)
setColorScheme(color.value);
const imgElement = new Image();

/**
 * 保存主题
 */
const saveTheme = () => {
    const useImageChkBox = document.getElementById("useImage")
    const useGlassChkBox = document.getElementById("useGlass")
    const useImage = useImageChkBox.hasAttribute("checked")

    if (useImage) {
        try {
            globalVars.theme.bgImage = imgElement.src
            localStorage.setItem("theme", JSON.stringify(globalVars.theme))
            document.body.style.backgroundImage = `url('${imgElement.src}')`
        } catch (e) {
            snackbar({ message: "图片保存失败！请考虑手动压缩图片(图片大小 <= 5MB)后再试。", autoCloseDelay: 3000 })
            console.warn(e)
            return;
        }
    } else {
        globalVars.theme.bgImage = false
        document.body.style.backgroundImage = 'none';
    }

    globalVars.theme.color = color.value
    setColorScheme(color.value)

    globalVars.theme.useGlass = useGlassChkBox.hasAttribute("checked")
    useGlass.value = globalVars.theme.useGlass

    localStorage.setItem("theme", JSON.stringify(globalVars.theme))

    snackbar({ placement: "top-end", message: "已保存并应用主题设置！", autoCloseDelay: 3000 })
}

export const openDialog = () => {
    const dialog = document.getElementById("colorDialog")
    dialog.open = true;
    const dialogObserver = observeResize(document.body, function (entry, observer) {
        dialog.fullscreen = (entry.borderBoxSize[0].inlineSize <= 584)
    })
    dialog.addEventListener("close", () => { dialogObserver.unobserve(); })
}

export const useGlass = ref(globalVars.theme.useGlass !== false)
</script>
<style lang="less" scoped>
#colorShow {
    border-radius: var(--mdui-shape-corner-medium);
    border: 0;
    background-color: rgb(var(--mdui-color-primary-light));
    padding: .7rem;
}

.main {
    min-width: 300px;
    display: flex;
    overflow-x: hidden;
}

.theme-box {
    width: 100%;
    margin: 0 1rem;
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
    margin: .5rem auto;
}

.color-wallpaper input {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
    cursor: pointer;
}

mdui-divider {
    height: auto;
    width: 3px;
    margin: .2rem;
}

@media (max-width: 700px) {
    .main {
        width: 95%;
        height: 100%;
        flex-direction: column;
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

@media (min-width: 701px) {
    .main {
        max-width: 512px;
        width: 65vw;
        justify-content: space-between;
        flex-direction: row;
    }

    .color-wallpaper {
        height: 8.15rem;
        width: 100%;
    }
}
</style>