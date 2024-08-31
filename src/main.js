import 'mdui/mdui.css';
import 'mdui';

import './assets/main.less'

import Pace from 'pace-js';
Pace.start()

import { createApp, reactive } from 'vue'
import App from './App.vue'

import { globalVars } from './utils/globalVars';

const app = createApp(App)

// import Aos from 'aos';
// Aos.init();

// 确保inject也能使用globalVars
app.provide('globalVars', globalVars)

app.mount('#app')