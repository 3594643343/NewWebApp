<script setup>
import MainHeader from '@/components/layouts/MainHeader.vue';
import MainSider from '@/components/layouts/MainSider.vue';
import { initWschat} from '@/api/user'
import { onMounted } from 'vue';

onMounted(() => {
  initWschat()
})
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <MainHeader />
      </el-header>
      <el-container>
        <el-aside>
          <MainSider />
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  height: 100vh; /* 高度设置为视口高度 */
  overflow: hidden; /* 隐藏溢出内容 */
}
.el-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 0;
  z-index: 1000; /* 确保头部在其他元素之上 */
}

.el-aside {
  position: fixed; /* 固定侧边栏 */
  top: 60px; /* 根据实际需要调整，这里假设头部高度为60px */
  left: 0;
  background-color: #fff;
  padding: 10px;
  width: 210px;
  bottom: 0; /* 侧边栏到底部 */
  overflow-y: auto; /* 垂直滚动条 */
  z-index: 999; /* 确保侧边栏在主内容区域之上 */
}

.el-main {
  margin-top: 60px; /* 根据实际需要调整，这里假设头部高度为60px */
  margin-left: 210px; /* 根据实际需要调整，这里假设侧边栏宽度为210px */
  background-color: #F6F7F9;
  overflow-y: auto; /* 垂直滚动条 */
  height: calc(100vh - 60px); /* 根据实际需要调整，这里假设头部高度为60px */

}
</style>
