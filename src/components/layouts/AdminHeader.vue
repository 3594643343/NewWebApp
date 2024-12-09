<script lang="ts" setup>
import { h, ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();
  
const activeIndex = ref('')
</script>

<template>
    <el-menu
      :default-active="activeIndex"
      class="meeting-header"
      mode="horizontal"
      :ellipsis="false"
      router
    >
      <el-menu-item>
        <img
          style="width: 100px"
          src="@/assets/logo/icon_wemeet.svg"
          alt="Element logo"
        />
      </el-menu-item>
      <div class="title-container">
        <h2>管理员页面</h2>
      </div>
      
    </el-menu>
</template>
  
<style>
  .meeting-header {
    background-color: #fff;
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }
  
  .title-container {
    flex: 1;  /* 使容器占满剩余空间 */
    display: flex;
    justify-content: center;  /* 水平居中 */
  }
  
  .meeting-header h1 {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin: 0;  /* 去掉默认的外边距 */
  }
</style>
  