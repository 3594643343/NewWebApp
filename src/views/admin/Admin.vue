<template>
  <div class="admin-layout">
    <el-container class="main-container">
      <el-header class="fixed-header">
        <AdminHeader />
      </el-header>
      <el-main class="main-content">
        <div class="header-content">
          <div class="search-and-logout">
            <el-input
              v-model="searchText"
              placeholder="输入用户名"
              class="search-input"
              size="medium" 
            />
            <el-button type="primary" @click="searchUser" size="medium" class="search-button">搜索</el-button>
          </div>
          <el-button type="danger" @click="logoutDialogVisible = true" size="medium" class="logout-button">退出登录</el-button>
        </div>

        <div class="table-container">
          <el-table :data="filteredData" style="width: 100%;" class="table" :height="tableHeight">
            <el-table-column label="头像" width="150" fixed>
              <template v-slot="scope">
                <el-avatar :src="scope.row.avatar" size="large"></el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" fixed />
            <el-table-column prop="id" label="用户ID" fixed />
            <el-table-column label="个性签名" prop="signature" />
            <el-table-column label="操作" width="150" fixed="right">
              <template v-slot="scope">
                <div class="action-buttons">
                  <el-button :plain="true" type="text" @click="showResetPasswordDialog(scope.row)" size="medium">重置密码</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
      <!-- 确认退出登录弹窗 -->
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
      <!-- 重置密码确认弹窗 -->
      <el-dialog
        v-model="resetPasswordDialogVisible"
        :title="'是否重置用户' + selectedUser.username + '的密码？'"
        width="400"
        align-center
      >
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmResetPassword">
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
import { adminGetUserList,adminResetPassword, exitSystem } from '@/api/user';
import router from '@/router';
import { useUserStore } from '@/stores/useUserStore';



const userStore = useUserStore();
const users = ref([]);
const searchText = ref('');
const searchResults = ref([]);
const logoutDialogVisible = ref(false);
const resetPasswordDialogVisible = ref(false);
const selectedUser = ref({});
const tableHeight = ref(window.innerHeight - 140); // 根据实际需要调整

const searchUser = () => {
  console.log('搜索用户:', searchText.value);
  searchResults.value = users.value.filter(user => 
    user.username.toLowerCase().includes(searchText.value.toLowerCase())
  );
};

const showResetPasswordDialog = (user) => {
  selectedUser.value = user;
  resetPasswordDialogVisible.value = true;
};

const confirmResetPassword = async () => {
  try {
    const response = await adminResetPassword({
      userId: selectedUser.value.id,
    });
    console.log('重置密码成功:', response);
    ElMessage({
      message: '重置密码成功',
      type: 'success',
    });
    loadUsersInfo();
  } catch (error) {
    console.log(error);
  } finally {
    resetPasswordDialogVisible.value = false;
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
        };
      });
    console.log('response.data.data:', response);
    console.log('加载用户信息成功:', users.value);
  } catch (error) {
    console.log(error);
  }
};


const logout = async () => {
  try {
    await exitSystem(); // 退出系统
    localStorage.removeItem('userProfile'); // 清除用户数据
    userStore.logout();   // 更新登录状态为 false
    router.push('/accountlogin'); // 跳转到登录页面
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  loadUsersInfo();
  window.addEventListener('resize', handleResize);
});

const handleResize = () => {
  tableHeight.value = window.innerHeight - 140; // 根据实际需要调整
};

</script>

<style>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 0;
  height: 60px;
  z-index: 1000; /* 确保头部在其他元素之上 */
}

.header-content {
  position: fixed;
  top: 60px;
  height: 60px;
  width: 100%;
  background-color: #F6F7F9;
  padding: 10px;
  z-index: 999;  
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-and-logout {
  display: flex;
  align-items: center;
}

.logout-button {
  margin-top: 15px;
  margin-right: 40px;
}

.search-input {
  width: 400px;
  margin-top: 15px;
}

.search-button {
  margin-top: 15px;
  margin-left: 20px;
}

.table-container {
  width: 100%;
  margin-top: 140px; /* 根据实际需要调整，这里假设头部高度为140px */
}

.table {
  margin-top: 20px; /* 根据实际需要调整 */
}

</style>
