import 'mdui/mdui.css';
import 'mdui';

import './assets/main.css'

import Pace from 'pace-js';
Pace.start()

import Aos from 'aos';

import { createApp } from 'vue'
import App from './App.vue'

Aos.init();

createApp(App).mount('#app')