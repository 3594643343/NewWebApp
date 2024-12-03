<template>
  <div class="admin-layout">
    <el-container class="main-container">
      <el-header>
        <AdminHeader />
      </el-header>
      <el-main class="main-content">
        <div class="header sticky-header">
          <div class="header-content">
            <el-input
              v-model="searchText"
              placeholder="输入用户姓名"
              class="search-input"
              size="large" 
            />
            <el-button type="primary" @click="searchUser" size="small">搜索</el-button>
            <el-button @click="listAllUsers" size="small">列出全部用户</el-button>
            <el-button type="success" size="small" class="add-button">增加用户</el-button>
          </div>
        </div>
        <div class="table-container">
          <el-table :data="filteredData" style="width: 100%;">
            <el-table-column label="头像" width="80">
              <template v-slot="scope">
                <el-avatar :src="scope.row.avatar" size="large"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="用户名" />
            <el-table-column label="操作" width="200">
              <template v-slot="scope">
                <div class="action-buttons">
                  <el-button type="text" @click="viewProfile(scope.row)" size="small">查看资料</el-button>
                  <el-button type="text" @click="deleteUser(scope.row)" size="small">删除用户</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminHeader from '@/components/layouts/AdminHeader.vue';
import {adminGetUserList} from '@/api/user';

// 示例数据
const users = ref([]);

const searchText = ref('');
const searchResults = ref([]); // 用来保存搜索结果

const searchUser = () => {
  console.log('搜索用户:', searchText.value);
  searchResults.value = users.value.filter(user => 
    user.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
};

const listAllUsers = () => {
  searchText.value = '';
  searchResults.value = [];
};

const viewProfile = (user) => {
  console.log('查看用户资料:', user.name);
};

const deleteUser = (user) => {
  console.log('删除用户:', user.name);
};

// 计算属性返回当前显示数据
const filteredData = computed(() => {
  return searchResults.value.length > 0 ? searchResults.value : users.value;
});


const loadusersinfo = async () => {
  try {
    const response = await adminGetUserList();
    users.value = response.data.data;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  loadusersinfo();
});
</script>

<style>
.admin-layout {
  height: 100vh;
  display: flex;
  justify-content: center; /* 居中对齐整个组件 */
  align-items: center; /* 垂直居中 */
}

.main-container {
  width: 90%; /* 或者设置为特定宽度，例如 800px */
  max-width: 1200px; /* 限制最大宽度 */
  padding: 10px; /* 组件内间距 */
  background-color: #ffffff; /* 背景色 */
  border-radius: 8px; /* 添加圆角 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.header {
  display: flex;
  justify-content: center; /* 中心对齐内容 */
  padding: 10px; /* 调整边距，使整体更紧凑 */
}

.sticky-header {
  position: sticky;
  top: 0; /* 固定在顶部 */
  background-color: #ffffff; /* 确保背景为白色 */
  z-index: 10; /* 确保在其他元素上方 */
}

.header-content {
  display: flex;
  align-items: center;
}

.search-input {
  width: 250px; /* 增大输入框宽度 */
  margin-right: 5px; /* 减少右边距 */
}

.add-button {
  margin-left: 10px; /* 调整增加用户按钮的间距 */
}

.table-container {
  max-height: 400px; /* 限制表格的最大高度 */
  overflow-y: auto; /* 显示垂直滚动条 */
  margin-top: 10px; /* 为表格与上方区域增加一些间距 */
}

.el-avatar {
  background-color: #c0392b;
}

.action-buttons {
  display: flex;
  gap: 10px; /* 按钮之间的间距 */
}

.el-table .el-table-column--center {
  justify-content: center;
}
</style>
