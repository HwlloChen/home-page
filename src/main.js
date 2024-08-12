import 'mdui/mdui.css';
import 'mdui';

import './assets/main.css'

import Pace from 'pace-js';
Pace.start()

import { createApp } from 'vue'
import App from './App.vue'

// import Aos from 'aos';
// Aos.init();

createApp(App).mount('#app')