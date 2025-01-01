import { globalVars } from "./globalVars"
import config from '../../package.json'

// 默认主题配置
const defaultTheme = {
    light: "dark",
    color: "#c79f5a",
    bgImage: "https://chenserver.top/files/img/mc/2021-autumn_je_5.png",
    useGlass: window.screen.width >= 1360 ? true : false, // 根据屏幕宽度决定
}
if (localStorage.getItem("theme") == null) {
    //预创建默认主题配置
    console.log("创建主题配置")
    localStorage.setItem("theme", JSON.stringify(defaultTheme))
}
// 加载主题配置
globalVars.theme = JSON.parse(localStorage.getItem("theme"))

console.log(`Welcome to ChenServer Version ${config.version}`)