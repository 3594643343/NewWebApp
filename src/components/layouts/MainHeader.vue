<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();
  
const activeIndex = ref('')
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="main-header"
    mode="horizontal"
    :ellipsis="false"
    router
  >
    <el-menu-item index="0">
      <img
        style="width: 100px"
        src="@/assets/logo/icon_wemeet.svg"
        alt="Element logo"
      />
    </el-menu-item>
    <el-menu-item index="1" style="font-weight: bold;">加入会议</el-menu-item>
    <el-menu-item index="/main/bookmeeting" style="font-weight: bold;">预定会议</el-menu-item>
    <el-menu-item index="3" style="font-weight: bold;">快速会议</el-menu-item>
  </el-menu>
</template>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>