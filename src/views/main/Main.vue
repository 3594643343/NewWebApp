<script setup>
import MainHeader from '@/components/layouts/MainHeader.vue';
import MainSider from '@/components/layouts/MainSider.vue';

</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-header>
            <MainHeader />
        </el-header>
        <el-container>
          <el-aside width="200px" class="main-sider">
            <MainSider />
          </el-aside>
          <el-main>Main</el-main>
        </el-container>
      </el-container>
    </div>
  </template>

<style scoped>
.common-layout {
  height: 100%;
}
.el-container {
    height: 100%;
}
.el-header {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  offset: 10;
  position: top;
}
.el-aside {
  background-color: #fff;
  overflow: auto;
}

.main-sider {
  background-color: #eef0f4;
}
</style>
