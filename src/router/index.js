import App from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import button from '@/views/test/button.vue'
import plusIcon from '@/views/test/plusIcon.vue'
import test from '@/views/test/test.vue'
import Register from '@/views/register/Register.vue'
import EmailLogin from '@/views/login/EmailLogin.vue'
import AccountLogin from '@/views/login/AccountLogin.vue'
import Main from '@/views/main/Main.vue'
import BookMeeting from '@/views/main/BookMeeting.vue'

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
      path: '/emaillogin',
      name: 'emaillogin',
      component: EmailLogin,
    },
    {
      path: '/accountlogin',
      name: 'accountlogin',
      component: AccountLogin,
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
    {
      path: '/main/bookmeeting',
      name: '/main/bookmeeting',
      component: BookMeeting,
    },
  ],
})

export default router
