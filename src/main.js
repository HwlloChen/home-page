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
        },
        {
            path: '/admin',
            component: () => import('./views/Admin.vue'),
            children: [
                {
                    path: '',
                    component: () => import('./views/admin/AboutAdmin.vue')
                },
                {
                    path: 'announcements',
                    component: () => import('./views/admin/AnnouncementsAdmin.vue')
                },
                {
                    path: 'sites',
                    component: () => import('./views/admin/SitesAdmin.vue')
                },
                {
                    path: 'music-share',
                    component: () => import('./views/admin/MusicShareAdmin.vue')
                }
            ]
        }
    ]
})

const app = createApp(App)

// 确保inject也能使用globalVars
app.provide('globalVars', globalVars)

app.use(router)
app.mount('#app')