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
.el-header {
  background-color: #fff;
  padding: 0;
}

.el-aside {
  margin-top: 0%;
  background-color: #fff;
  padding: 10px;
  padding-right: 0%;
  width: 250px;
}

.el-main {
  padding: 20px;
}
</style>
