import { globalVars } from "./globalVars"

const defaultTheme = {
    light: "auto",
    color: "#6750A4",
    bgImage: false,
}
if (localStorage.getItem("theme") == null) {
    //预创建默认主题配置
    console.log("创建主题配置")
    localStorage.setItem("theme", JSON.stringify(defaultTheme))
}
// 加载主题配置
globalVars.theme = JSON.parse(localStorage.getItem("theme"))