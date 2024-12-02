import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPersistedstate from 'pinia-plugin-persistedstate'



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
