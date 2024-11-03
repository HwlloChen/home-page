import { reactive } from "vue";

const globalVars = reactive({
    siteName: 'ChenServer',
    backpoint: 'https://v4.chenserver.top:11450/api',
    backpoint_v6: "https://www.chenserver.top:81",
    navidrome: { // 此处配置应在后期迁移至后端服务器获取（可能是直接得到cookie）
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
    theme: {
        light: undefined,
        color: undefined,
        bgImage: undefined,
        useGlass: undefined,
    },
})

export { globalVars }