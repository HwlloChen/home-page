import { reactive } from "vue";

const globalVars = reactive({
    navidrome: { // 此处配置应在后期迁移至后端服务器获取（可能是直接得到cookie）
        enable: true,
        // Navidrome音乐服务器
        server: "https://www.chenserver.top:81/music",
        /**
         * 更改此处playListURL实现从Navidrome服务器获取不同的播放列表与切片(url + 排序方式等参数)
         * 目前支持: /api/song 全部歌曲列表
         *          /api/playlist/{歌单id}/tracks 使用歌单
         *          /api/song?_sort=album&album_id={专辑id} 使用特定专辑(注意后方参数)
         */
        playListURL: "/api/song" + "?&_order=DESC&_sort=createdAt",
        clientName: "ChenServer",
        user: "user", // 此处不应使用高权限用户
        password: "pwd",
        ipv6: true,
        login: null,
    },
    theme: { // 默认主题设置
        light: "dark",
        color: "#394b6b",
        bgImage: "https://chenserver.top/files/img/mc/2022-summer_je_2.png",
        useGlass: window.screen.width >= 1080 ? true : false, // 根据屏幕宽度决定
    },
    author: {
        name: "Chen",
        description: "一个普通的学生",
        email: "hwllochen@qq.com",
        avatar: "https://cravatar.cn/avatar/f9ff0db2d48c61f21a01f31de18643c2?d=mp&s=240",
        github: "HwlloChen",
        qq: 3417591076
    },
    site: {
        name: "ChenServer",
        created_date: "2022-10-09T00:00:00", // ISO8601格式日期字符串，记录网站创建时间, 胡填代表不使用
        backpoint: 'https://v4.chenserver.top/api',
        backpoint_v6: "https://www.chenserver.top:81",
    },
    artalk: {
        enable: true,
        server: "https://artalk.chenserver.top",
        site: "ChenServer主站",
        pageTitle: "ChenServer",
    }
})

export { globalVars }