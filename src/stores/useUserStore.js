import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false, // 登录状态
  }),
  actions: {
    login() {
      this.isLoggedIn = true; // 登录
    },
    logout() {
      this.isLoggedIn = false; // 登出
    }
  }
})
