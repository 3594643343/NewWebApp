<template>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="0">
        <img
          style="width: 100px"
          src="@/assets/logo/icon_wemeet.svg"
          alt="Element logo"
        />
      </el-menu-item>
      <el-menu-item index="register">注册</el-menu-item>
      <el-sub-menu index="login">
        <template #title>登录</template>
        <el-menu-item index="email-login">邮箱登录</el-menu-item>
        <el-menu-item index="account-login">账号登录</el-menu-item>
      </el-sub-menu>
    </el-menu>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();
const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  if (key === 'register') {
    router.push('/register')
  } else if (key === 'email-login') {
    router.push('/emaillogin')
  } else if (key === 'account-login') {
    router.push('/accountlogin')
  }
}
</script>
  
<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>