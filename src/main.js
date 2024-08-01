import 'mdui/mdui.css';
import 'mdui';

import './assets/main.css'

import Aos from 'aos';

import { createApp } from 'vue'
import App from './App.vue'

Aos.init();

createApp(App).mount('#app')