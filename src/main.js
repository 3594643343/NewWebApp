import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from './stores/useUserStore'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPersistedstate from 'pinia-plugin-persistedstate'

import mitt from'mitt';
const emitter = mitt();
export default emitter;


import App from './App.vue'
import router from './router'

import BaseHeader from './components/layouts/BaseHeader.vue'
import MainHeader from './components/layouts/MainHeader.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
pinia.use(piniaPersistedstate)
app.component('BaseHeader', BaseHeader)
app.component('MainHeader', MainHeader)
app.mount('#app')

// router.beforeEach((to, from, next) => {
//   const userStore = useUserStore(); // 获取用户 store

//   // 允许访问的公共页面
//   const publicPages = ['/emaillogin', '/accountlogin', '/register', '/'];
//   const authRequired = !publicPages.includes(to.path); // 是否需要认证的页面

//   if (authRequired && !userStore.isLoggedIn) {
//     // 如果是需要登录的页面且用户未登录，重定向到登录页面
//     alert('您还没有登录，请登录后再访问该页面。');
//     next('/accountlogin');
//   } else {
//     next(); // 允许访问
//   }
// });
