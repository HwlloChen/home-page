import { reactive } from "vue";

const globalVars = reactive({
    siteName: 'ChenServer',
    backpoint: '/api',
})

export { globalVars }