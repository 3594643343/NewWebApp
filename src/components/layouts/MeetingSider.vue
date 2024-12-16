<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getInMeetingUsers } from '@/api/user'; 

// const users = ref([]);
const users = ref(JSON.parse(localStorage.getItem('users')) || []); // 存储当前会议中的用户列表
const meetingNumber = localStorage.getItem('meetingNumber');

const errorHandler = () => true;

const fetchUsers = async () => {
  try {
    const response = await getInMeetingUsers(meetingNumber);
    if (response && response.data) {
      console.log('获取的用户数据:', response.data);
      users.value = response.data.map(user => {
        // const newUsers = response.data.map(user => {
        // 对每个用户的头像进行格式转换
        return {
          ...user,
          avatar: user.avatar ? 'data:image/png;base64,' + user.avatar : '',// 格式转换
        };
      });
      localStorage.setItem('users', JSON.stringify(users.value)); // 缓存用户列表到本地
    }
  } catch (error) {
    console.error('获取用户列表失败:', error.response ? error.response.data : error.message);
  }
};


const addFriend = () => {
  console.log('添加好友');
};

const updateMembers = () => {
  const storedUsers = localStorage.getItem('users');
  users.value = storedUsers ? JSON.parse(storedUsers) : [];
};
// 声明定时器变量
let fetchInterval;

onMounted(() => {
  fetchUsers();
  // fetchInterval = setInterval(fetchUsers, 5000); // 每5秒调用一次fetchUsers
  fetchInterval = setInterval(updateMembers, 5000); // 每5秒调用一次fetchUsers
});

onUnmounted(() => {
  clearInterval(fetchInterval); // 清除定时器，避免内存泄漏
});
</script>

<template>
  <div class="meeting-page">
    <el-container>
      <el-aside width="250px" class="sidebar">
        <el-scrollbar :style="{ maxHeight: '400px', height: '100%' }">
          <div class="avatar-list">
            <div v-for="(user, index) in users" :key="user.id" class="avatar-item">
              <el-popover
                placement="right"
                trigger="click"
                width="300px"
              >
                <template #reference>
                  <el-avatar
                    :size="40"
                    :src="user.avatar"
                    @error="errorHandler"
                  />
                </template>
                <div class="info">
                  <el-avatar :size="60" :src="user.avatar" @error="errorHandler" />
                  <div class="details">
                    <div class="username">{{ user.username }}</div>
                    <div class="signature">{{ user.signature }}</div>
                  </div>
                </div>
                <div class="button-group">
                  <el-button type="text" @click="addFriend" class="icon-button">
                    <el-icon><User /></el-icon>
                    添加好友
                  </el-button>
                </div>
              </el-popover>
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
                <!-- <el-icon 
                  @click="toggleMicStatus(user)" 
                  aria-setsize="18"
                  :style="{'cursor': 'pointer', 'color': user.micStatus ? 'blue' : 'inherit'}" 
                >
                  <Microphone v-if="user.micStatus" />
                  <Mute v-else />
                </el-icon> -->
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-aside>
      <el-main class="main-content">
        <!-- 主内容区 -->
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.meeting-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.sidebar {
  background-color: #f5f7fa;
  padding: 20px;
  overflow: hidden;
}

.avatar-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-item {
  cursor: pointer;
  transition: transform 0.2s;
  display: flex; /* 设置为flex布局 */
  align-items: center; /* 垂直居中 */
}


.user-info {
  justify-content: flex-start;
  flex: 1;
  margin-left: 15px;
}

.username {
  font-weight: bold;
}
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  overflow-y: auto;
}

.meeting-content {
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>