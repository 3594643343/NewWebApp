<template>
    <el-menu
      :default-active="activeIndex"
      class="base-header"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <div class="logo-container">
        <img
          style="width: 100px"
          src="@/assets/logo/icon_wemeet.svg"
          alt="Element logo"
        />
      </div>
      <div class="menu-items">
        <el-menu-item index="register" style="font-weight: bold;">注册</el-menu-item>
        <el-sub-menu index="login">
          <template #title ><span style="font-weight: bold;">登录</span></template>
          <el-menu-item index="email-login" style="font-weight: bold;">邮箱登录</el-menu-item>
          <el-menu-item index="account-login" style="font-weight: bold;">账号登录</el-menu-item>
        </el-sub-menu>
      </div>
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
.base-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.menu-items {
  display: flex;
  align-items: center;
}
</style>