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
                <mdui-button style="margin-top: .8rem;" id="color-from-image" @click="colorFromImage"
                    variant="tonal">从图片中提取颜色</mdui-button>
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
                <mdui-button @click="useImgURL" variant="text">or 使用网络图片</mdui-button>
            </div>
        </div>
    </mdui-dialog>
</template>

<script setup>
import { getColorFromImage, observeResize, prompt, setColorScheme, snackbar } from 'mdui';
import { onMounted, ref } from 'vue';
import Compressor from 'compressorjs';

import '@simonwep/pickr/dist/themes/nano.min.css';
import Pickr from '@simonwep/pickr';
import { globalVars } from '@/utils/globalVars';
import { changeTheme } from './AppBar.vue';

onMounted(() => {
    html = document.querySelector("html")
    const useImageChkBox = document.getElementById("useImage")
    if (globalVars.theme.bgImage !== false) {
        imgElement.src = globalVars.theme.bgImage
        const imageDiv = document.getElementById('color-wallpaper-div')
        imageDiv.style.backgroundImage = `url('${imgElement.src}')`;
        html.style.backgroundImage = `url('${imgElement.src}')`
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
})
</script>

<script>
/**
 * 主题配置
 */

const color = ref(globalVars.theme.color)
setColorScheme(color.value);
const imgElement = new Image();
var html
var pickr

/**
 * 判断图片明暗程度，返回一个0~1的数值
 * @param img HTMLImageElement对象
 */
function calculateImageDarkness(img) {
    return new Promise((resolve, reject) => {
        // 创建一个 canvas 元素
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // 设置 canvas 尺寸为图片尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片到 canvas 上
        context.drawImage(img, 0, 0, img.width, img.height);

        // 获取图像数据
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        let totalBrightness = 0;

        // 遍历每个像素
        for (let i = 0; i < data.length; i += 4) {
            // 获取 RGB 值
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 使用亮度公式计算该像素的亮度（加权平均法）
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            totalBrightness += brightness;
        }

        // 计算平均亮度
        const avgBrightness = totalBrightness / (img.width * img.height);

        // 反转亮度以表示黑暗程度，0（最明亮）到 1（最黑暗）
        const darkness = 1 - avgBrightness;

        canvas.remove()

        resolve(darkness);
    });
}

/**
 * 保存主题
 */
function saveTheme() {
    new Promise((resolve, reject) => {
        const useImageChkBox = document.getElementById("useImage")
        const useGlassChkBox = document.getElementById("useGlass")
        const useImage = useImageChkBox.hasAttribute("checked")

        if (useImage) {
            try {
                globalVars.theme.bgImage = imgElement.src
                localStorage.setItem("theme", JSON.stringify(globalVars.theme))
                calculateImageDarkness(imgElement).then(v => changeTheme(v >= 0.5 ? 2 : 1))
                html.style.backgroundImage = `url('${imgElement.src}')`
            } catch (e) {
                reject(e)
            }
        } else {
            globalVars.theme.bgImage = false
            html.style.backgroundImage = 'none';
        }

        globalVars.theme.color = color.value
        setColorScheme(color.value)

        globalVars.theme.useGlass = useGlassChkBox.hasAttribute("checked")
        useGlass.value = globalVars.theme.useGlass

        localStorage.setItem("theme", JSON.stringify(globalVars.theme))

        resolve()
    }).then(() => {
        snackbar({ placement: "top-end", message: "已保存并应用主题设置！", autoCloseDelay: 3000 })
    }).catch(e => {
        snackbar({ message: "图片保存失败！请考虑手动压缩图片(图片大小 <= 5MB)后再试。", autoCloseDelay: 3000 })
    })
}

export const openDialog = () => {
    const dialog = document.getElementById("colorDialog")
    pickr = Pickr.create({
        el: '#color-picker',
        theme: 'nano', // or 'monolith', or 'nano'

        swatches: [
            '#F44336',    // 红色
            '#009688',    // 茶色
            '#2196F3',    // 蓝色
            '#3F51B5',    // 群青
            '#00BCD4',  // 青色
            '#FFC107',  // 米黄
            '#FF5722'   // 橙色
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
    dialog.open = true;
    const dialogObserver = observeResize(html, function (entry, observer) {
        dialog.fullscreen = (entry.borderBoxSize[0].inlineSize <= 584)
    })
    dialog.addEventListener("close", () => {
        dialogObserver.unobserve();
        pickr.destroyAndRemove()
    })
}

export const useGlass = ref(globalVars.theme.useGlass !== false)

function useImgURL() {
    prompt({
        headline: "使用网络图片", description: "输入图片链接来使用网络图片(若更大的GIF等)", confirmText: "确定", cancelText: "取消", onConfirm: (v) => {
            imgElement.src = v;

            fetch(v, {
                method: "HEAD"
            }).then(() => {
                const imageDiv = document.getElementById('color-wallpaper-div')
                imageDiv.style.backgroundImage = `url('${imgElement.src}')`;

                const useImageChkBox = document.getElementById("useImage")
                useImageChkBox.removeAttribute("disabled")
            }).catch(e => {
                snackbar({ message: "无法使用此图片，请检查你的连接有效性及源网站是否由设置保护！" })
            })
        }
    })
}

function colorFromImage() {
    const b = document.getElementById("color-from-image")
    b.setAttribute("loading", true)
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
    b.removeAttribute("loading")
}

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
        max-width: 510px;
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