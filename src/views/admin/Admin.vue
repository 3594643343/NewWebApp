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
              placeholder="输入用户名"
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
            <el-table-column prop="username" label="用户名" />
            <el-table-column label="个性签名" prop="signature" />
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
import { adminGetUserList } from '@/api/user';

const users = ref([]);
const searchText = ref('');
const searchResults = ref([]);

const searchUser = () => {
  console.log('搜索用户:', searchText.value);
  searchResults.value = users.value.filter(user => 
    user.username.toLowerCase().includes(searchText.value.toLowerCase())
  );
};

const listAllUsers = () => {
  searchText.value = '';
  searchResults.value = [];
};

const viewProfile = (user) => {
  console.log('查看用户资料:', user.username);
};

const deleteUser = (user) => {
  console.log('删除用户:', user.username);
};

// 计算属性返回当前显示的数据
const filteredData = computed(() => {
  return searchResults.value.length > 0 ? searchResults.value : users.value;
});

const loadUsersInfo = async () => {
  try {
    const response = await adminGetUserList();
    users.value = response.data.data; // 确保与后端返回的数据字段对应
    console.log('加载用户信息成功:', users.value);
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  loadUsersInfo();
});
</script>

<style>
.admin-layout {
  height: 100vh;
  display: fixed;
  align-items: center;
}

.main-container {
  width: 90%;
  max-width: 1200px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.sticky-header {
  position: sticky;
  top: 0;
  background-color: #ffffff;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
}

.search-input {
  width: 250px;
  margin-right: 5px;
}

.add-button {
  margin-left: 10px;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 10px;
}

.el-avatar {
  background-color: #c0392b;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.el-table .el-table-column--center {
  justify-content: center;
}
</style>
