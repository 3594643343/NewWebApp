import App from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import button from '@/views/test/button.vue'
import plusIcon from '@/views/test/plusIcon.vue'
import test from '@/views/test/test.vue'
import Register from '@/views/register/Register.vue'
import Main from '@/views/main/Main.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: App,
    },
    {
      path: '/button',
      name: 'button',
      component: button,
    },
    {
      path: '/plusIcon',
      name: 'plusIcon',
      component: plusIcon,
    },
    {
      path: '/register',
      name:'register',
      component: Register,
    },
    {
      path: '/test',
      name: 'test',
      component: test,
    },
    {
      path: '/main',
      name:'main',
      component: Main,
    },
  ],
})

export default router
