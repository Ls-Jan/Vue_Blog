
// 使用护眼色：https://element-plus.org/zh-CN/guide/dark-mode.html
// 加载loading指令：https://blog.csdn.net/weixin_44733774/article/details/134935153
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './assets/main.css'
import { createApp } from 'vue'
// import { ElLoading } from 'element-plus'
import App from './App.vue'
import ElementPlus from 'element-plus'

const app = createApp(App);
app.use(ElementPlus)//安装插件
// app.directive('loading', ElLoading.directive)//安装指令
app.mount('#app');


