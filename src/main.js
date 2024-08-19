import 'mdui/mdui.css';
import 'mdui';

import './assets/main.css'

import Pace from 'pace-js';
Pace.start()

import { createApp, reactive } from 'vue'
import App from './App.vue'

const app = createApp(App)

// import Aos from 'aos';
// Aos.init();

// 确保inject也能使用globalVars
import { globalVars } from './utils/globalVars';
app.provide('globalVars', globalVars)

app.mount('#app')