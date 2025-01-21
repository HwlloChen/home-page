import { globalVars } from "./globalVars"
import config from '../../package.json'
import { Announcements } from "./Announcements";

/**
 * Init Theme
 * 初始化主题配置
 */

if (localStorage.getItem("theme") == null) {
    //预创建默认主题配置
    console.log("创建主题配置")
    localStorage.setItem("theme", JSON.stringify(globalVars.theme))
}
// 加载主题配置
globalVars.theme = JSON.parse(localStorage.getItem("theme"))

// 显示公告
Announcements()

console.log(`Welcome to ChenServer Version ${config.version}`)