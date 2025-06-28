import { reactive } from "vue";

/**
 * Global reactive variables for the application
 * 应用程序的全局响应式变量
 * @typedef {Object} GlobalVars
 * @property {Object} navidrome - Navidrome music server configuration / Navidrome音乐服务器配置
 * @property {boolean} navidrome.enable - Enable/disable Navidrome integration / 启用/禁用 Navidrome 集成
 * @property {string} navidrome.server - Navidrome server URL / Navidrome 服务器地址
 * @property {string} navidrome.playListURL - URL path for playlist with sorting parameters / 播放列表URL路径及排序参数
 * @property {string} navidrome.clientName - Client name for Navidrome / Navidrome 客户端名称
 * @property {string} navidrome.user - Username for Navidrome authentication / Navidrome 用户名
 * @property {string} navidrome.password - Password for Navidrome authentication / Navidrome 密码
 * @property {boolean} navidrome.ipv6 - Enable/disable IPv6 Required / 启用/禁用 强制 IPv6
 * @property {Object} navidrome.login - Login status / 登录状态
 * @property {Object} theme - Theme configuration / 主题配置
 * @property {string} theme.light - Theme mode ('dark' or 'light') / 主题模式（'dark'或'light'）
 * @property {string} theme.color - Theme color in hex / 主题颜色（十六进制）
 * @property {string} theme.bgImage - Background image URL / 背景图片地址
 * @property {boolean} theme.useGlass - Enable/disable glass effect based on screen width / 基于屏幕宽度启用/禁用毛玻璃效果
 * @property {Object} author - Author information / 作者信息
 * @property {string} author.name - Author's name / 作者昵称
 * @property {string} author.description - Author's description with jumping text (format: %text1|text2|text3%) / 作者描述（支持跳动文字，格式：%文字1|文字2|文字3%）
 * @property {string} author.email - Author's email / 作者邮箱
 * @property {string} author.avatar - Author's avatar URL / 作者头像地址
 * @property {string} author.github - Author's GitHub username / 作者GitHub用户名
 * @property {number} author.qq - Author's QQ number / 作者QQ号
 * @property {Object} site - Website configuration / 网站配置
 * @property {string} site.name - Website name / 网站名称
 * @property {string} site.created_date - Website creation date in ISO8601 format / 网站创建日期（ISO8601格式）
 * @property {string} site.backpoint - API endpoint URL / API接口地址
 * @property {string} site.backpoint_v6 - IPv6 API endpoint URL / IPv6 API接口地址
 * @property {Object} artalk - Artalk comment system configuration / Artalk评论系统配置
 * @property {boolean} artalk.enable - Enable/disable Artalk / 启用/禁用Artalk
 * @property {string} artalk.server - Artalk server URL / Artalk服务器地址
 * @property {string} artalk.site - Artalk site name / Artalk站点名称
 * @property {string} artalk.pageTitle - Artalk page title / Artalk页面标题
 */

const globalVars = reactive({
    navidrome: { // 此处配置应在后期迁移至后端服务器获取（可能是直接得到cookie）
        enable: true,
        // Navidrome音乐服务器
        server: "https://www.etaris.moe:81/music",
        /**
         * 更改此处playListURL实现从Navidrome服务器获取不同的播放列表与切片(url + 排序方式等参数)
         * 目前支持: /api/song 全部歌曲列表
         *          /api/playlist/{歌单id}/tracks 使用歌单
         *          /api/song?_sort=album&album_id={专辑id} 使用特定专辑(注意后方参数)
         */
        playListURL: "/api/song" + "?_order=DESC&_sort=rating",
        clientName: "ChenServer",
        user: "user", // 此处不应使用高权限用户
        password: "pwd",
        ipv6: true,
        login: null,
    },
    theme: { // 默认主题设置
        light: "dark",
        color: "#e97f6d",
        bgImage: "https://etaris.moe/files/img/mc/MoAoXnX.png",
        useGlass: window.screen.width >= 1080 ? true : false, // 根据屏幕宽度决定
        live2d: true, // 是否启用Live2D
    },
    author: {
        name: "Chen",
        description: "一个%普通|不平凡|不甘现状|善于使用AI|热爱二次元文化|抽卡不歪|不怎么刷题|总想早睡却总忘记早睡|伟大|努力学习|坍缩了|善于思考%的%学生|开发者|梦想家|开源爱好者|耳机党|游戏玩家|Linux用户|刀客塔|人类|发明家%",
        email: "hwllochen@qq.com",
        avatar: "https://cravatar.cn/avatar/f9ff0db2d48c61f21a01f31de18643c2?d=mp&s=240",
        github: "HwlloChen",
        qq: 3417591076
    },
    site: {
        name: "ChenServer",
        created_date: "2022-10-09T00:00:00", // ISO8601格式日期字符串，记录网站创建时间, 胡填代表不使用
        backpoint: import.meta.env.DEV ? 'http://localhost:1145' : 'https://v4.etaris.moe/api',
        backpoint_v6: "https://www.etaris.moe:81",
    },
    artalk: {
        enable: true,
        server: "https://artalk.etaris.moe",
        site: "ChenServer主站",
        pageTitle: "ChenServer",
    },
    live2d: {
        enable: true, // 是否启用Live2D(后续以theme.live2d为准)
        model: '/live2d-assets/amiya/阿米娅(1).model3.json', // Live2D模型地址
        width: 400, // 宽度
        height: 500, // 高度
        left: -80, // 水平位置偏移
        bottom: 0, // 垂直位置偏移
        position: { // 模型位置
            x: "left", // 水平位置（left/right）
            y: "bottom" // 垂直位置（top/bottom）
        },
    }
})

export { globalVars }