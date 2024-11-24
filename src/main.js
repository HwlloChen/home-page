import 'mdui/mdui.css';
import 'mdui';

import './assets/main.less'

import Pace from 'pace-js';


import { createApp, reactive } from 'vue'
import App from './App.vue'

import { globalVars } from './utils/globalVars';
import Aos from 'aos';
import 'aos/dist/aos.css'

Pace.start()
Aos.init()
const app = createApp(App)



// 确保inject也能使用globalVars
app.provide('globalVars', globalVars)

app.mount('#app')