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
    theme: { // 默认主题设置在init.js中
        light: undefined,
        color: undefined,
        bgImage: undefined,
        useGlass: undefined,
    },
    author: {
        name: "Chen",
        email: "hwllochen@qq.com"
    },
    site: {
        name: "ChenServer",
        created_date: "2022-10-09T00:00:00", // ISO8601格式日期字符串，记录网站创建时间, 胡填代表不使用
        backpoint: 'https://v4.chenserver.top:11450/api',
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