import { reactive } from "vue";

const globalVars = reactive({
    siteName: 'ChenServer',
    backpoint: 'https://v4.chenserver.top:11450/api',
    backpoint_v6: "https://www.chenserver.top:81",
    navidrome: {
        // Navidrome音乐服务器
        server: "https://www.chenserver.top:81/music",
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