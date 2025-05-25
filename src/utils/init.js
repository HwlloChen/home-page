/**
 * Initialize application settings and configurations
 * 初始化应用程序设置和配置
 * 
 * This module handles:
 * 该模块处理：
 * 
 * 1. Theme initialization - Creates default theme if not exists and loads theme settings
 *    主题初始化 - 如果不存在则创建默认主题并加载主题设置
 * 
 * 2. Version display - Shows welcome message with current version
 *    版本显示 - 显示带有当前版本的欢迎消息
 * 
 * @module init
 * @requires ./globalVars
 * @requires ../../package.json
 */
import { globalVars } from "./globalVars"
import config from '../../package.json'

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

console.log(`Welcome to ChenServer Version ${config.version}`)