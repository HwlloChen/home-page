import { reactive } from "vue";

const globalVars = reactive({
    siteName: 'ChenServer',
    backpoint: 'https://v4.chenserver.top:11450/api',
    backpoint_v6: "https://www.chenserver.top:81",
    theme: {
        light: undefined,
        color: undefined,
        bgImage: undefined,
    },
})

export { globalVars }