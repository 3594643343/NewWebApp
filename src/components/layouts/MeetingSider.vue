<template>
    <el-aside width="200px">
      <div class="sidebar-content" style="overflow-y: auto; height: 100vh;">
        <!-- 侧边栏菜单项等内容 -->
        <el-menu :default-openeds="[1]">
          <el-sub-menu index="1">
            <template #title>
              <i class="el-icon-location"></i>
              <span>导航一</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="1-1">选项1</el-menu-item>
              <el-menu-item index="1-2">选项2</el-menu-item>
              <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-aside>
</template>

  
  <script>
  export default {
    name: 'Sidebar'
  };
  </script>
  
  <style scoped>
  </style>