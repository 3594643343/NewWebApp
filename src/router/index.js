import App from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import button from '@/views/test/button.vue'
import plusIcon from '@/views/test/plusIcon.vue'
import test from '@/views/test/test.vue'
import Register from '@/views/register/Register.vue'
import EmailLogin from '@/views/login/EmailLogin.vue'
import AccountLogin from '@/views/login/AccountLogin.vue'
import Main from '@/views/main/Main.vue'
import User from '@/views/main/User.vue'
import Record from '@/views/main/Record.vue'
import Schedule from '@/views/main/Schedule.vue'
import Setting from '@/views/main/Setting.vue'
import Friend from '@/views/main/Friend.vue'
import BookMeeting from '@/views/main/BookMeeting.vue'
import JoinMeeting from '@/views/main/JoinMeeting.vue'
import Meeting from '@/views/meeting/Meeting.vue'
import Admin from '@/views/admin/Admin.vue'

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
      children: [
        {
          path: 'user',
          name: 'user',
          component: User,
        },
        {
          path:'record',
          name:'record',
          component: Record,
        },
        {
          path:'schedule',
          name:'schedule',
          component: Schedule,
        },
        {
          path:'setting',
          name:'setting',
          component: Setting,
        },
        {
          path: 'friend',
          name: 'friend',
          component: Friend,
        },
        {
          path: 'bookmeeting',
          name: 'bookmeeting',
          component: BookMeeting,
        },
        {
          path: 'joinmeeting',
          name: 'joinmeeting',
          component: JoinMeeting,
        },
      ],
    },
    {
      path: '/meeting',
      name:'meeting',
      component: Meeting,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
    }
  ],
})

export default router
