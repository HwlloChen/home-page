import 'mdui/mdui.css';
import 'mdui';

import '@/assets/main.less'
import '@/assets/pace-minimal.css'
import '@/assets/Artalk.css'
import '@/assets/font.css'

import Pace from 'pace-js';

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import { globalVars } from './utils/globalVars';
import Aos from 'aos';
import 'aos/dist/aos.css'

Pace.start()
Aos.init()

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('./views/Home.vue')
        },
        {
            path: '/music/share/:id',
            component: () => import('./views/MusicShare.vue')
        }
    ]
})

const app = createApp(App)

// 确保inject也能使用globalVars
app.provide('globalVars', globalVars)

app.use(router)
app.mount('#app')