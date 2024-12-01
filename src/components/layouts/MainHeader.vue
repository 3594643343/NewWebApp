<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();
  
const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
  if (key === 'main/bookmeeting') {
    router.push('/main/bookmeeting')
  } else if (key === 'email-login') {
    router.push('/emaillogin')
  } else if (key === 'account-login') {
    router.push('/accountlogin')
  }
}
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="main-header"
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
    <el-menu-item index="1">加入会议</el-menu-item>
    <el-menu-item index="main/bookmeeting">预定会议</el-menu-item>
    <el-menu-item index="3">快速会议</el-menu-item>
  </el-menu>
</template>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>