
// 使用护眼色：https://element-plus.org/zh-CN/guide/dark-mode.html
// 加载loading指令：https://blog.csdn.net/weixin_44733774/article/details/134935153
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'
import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import App from './App.vue'

const app = createApp(App);
app.directive('loading', ElLoading.directive)
app.mount('#app');


