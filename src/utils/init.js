import { globalVars } from "./globalVars"
import config from '../../package.json'
import { Announcements } from "./Announcements";

/**
 * Init Theme
 * 初始化主题配置
 */
// 默认主题配置
const defaultTheme = {
    light: "dark",
    color: "#394b6b",
    bgImage: "https://chenserver.top/files/img/mc/2022-summer_je_2.png",
    useGlass: window.screen.width >= 1080 ? true : false, // 根据屏幕宽度决定
}
if (localStorage.getItem("theme") == null) {
    //预创建默认主题配置
    console.log("创建主题配置")
    localStorage.setItem("theme", JSON.stringify(defaultTheme))
}
// 加载主题配置
globalVars.theme = JSON.parse(localStorage.getItem("theme"))

// 显示公告
Announcements()

console.log(`Welcome to ChenServer Version ${config.version}`)