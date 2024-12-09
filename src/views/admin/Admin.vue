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
            <el-button type="primary" @click="searchUser" size="medium">搜索</el-button>
            <el-button type="primary" @click="logoutDialogVisible = true" size="medium">退出登录</el-button>
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
                  <el-button :plain="true" type="text" @click="resetPassword(scope.row)" size="small">重置密码</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
      <el-dialog
    v-model="logoutDialogVisible"
    title="确认退出"
    width="400"
    align-center
  >
    <span>您确定要退出登录吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="logoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="logout">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus'
import AdminHeader from '@/components/layouts/AdminHeader.vue';
import { adminGetUserList,adminResetPassword } from '@/api/user';
import router from '@/router';

const users = ref([]);
const searchText = ref('');
const searchResults = ref([]);
const logoutDialogVisible = ref(false);

const searchUser = () => {
  console.log('搜索用户:', searchText.value);
  searchResults.value = users.value.filter(user => 
    user.username.toLowerCase().includes(searchText.value.toLowerCase())
  );
};


const resetPassword = async (user) => {
  try {
    const response = await adminResetPassword({
      userId: user.id,
    }
    );
    console.log('重置密码成功:', response);
    ElMessage({
    message: '重置密码成功',
    type: 'success',
  })
    loadUsersInfo();

  } catch (error) {
    console.log(error);
  }
};

// 计算属性返回当前显示的数据
const filteredData = computed(() => {
  return searchResults.value.length > 0 ? searchResults.value : users.value;
});

const loadUsersInfo = async () => {
  try {
    const response = await adminGetUserList();
    users.value = response.data.map(user => {
        // 对每个用户的头像进行格式转换
        return {
          ...user,
          avatar: user.avatar ? 'data:image/png;base64,' + user.avatar : '',// 格式转换
          micStatus: false // 默认麦克风未禁言
        };
      });
    console.log('response.data.data:', response);
    console.log('加载用户信息成功:', users.value);
  } catch (error) {
    console.log(error);
  }
};
const logout = () => {
  router.push('/accountlogin');
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
.main-content {
  padding: 10px;
  margin-left: 300px;
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
