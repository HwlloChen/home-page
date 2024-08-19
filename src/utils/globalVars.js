import { reactive } from "vue";

const globalVars = reactive({
    siteName: 'ChenServer',
    backpoint: '/api',
    theme: {
        light: undefined,
        color: undefined,
        bgImage: undefined,
    },
})

export { globalVars }