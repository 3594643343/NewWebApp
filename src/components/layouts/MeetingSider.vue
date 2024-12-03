<template>
  <div class="meeting-page">
    <el-container>
      <el-aside width="300px" class="sidebar">
        <el-scrollbar style="height: 100vh;">
          <div class="avatar-list">
            <div
              v-for="(user, index) in users"
              :key="index"
              class="avatar-item"
            >
            <el-avatar
                :src="user.avatar"
                size="60"
              ></el-avatar>
              <span class="username">{{ user.username }}</span>
              <span class="mic-status" :class="{'on': user.micStatus, 'off': !user.micStatus}">
                {{ user.micStatus ? '麦克风开' : '麦克风关' }}
              </span>
            </div>
          </div>
        </el-scrollbar>
      </el-aside>
      <el-main class="main-content">
        <!-- 会议内容区域 -->
        <div class="meeting-content">
          <h1>会议进行中</h1>
          <!-- 其他会议内容 -->
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getInMeetingUsers } from '@/api/user'; 

const users = ref([]);

export default {
  name: 'MeetingPage',
  setup() {
    const users = ref([]);
    const meetingNumber = localStorage.getItem('meetingNumber');

    const fetchUsers = async () => {
      try {
        const response = await getInMeetingUsers(meetingNumber);
        if (response && response.data) {
          console.log('获取的用户数据:', response.data);
          users.value = response.data;
        }
      } catch (error) {
        console.error('获取用户列表失败:', error.response ? error.response.data : error.message);
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return { users }; // 确保返回 users
  }
};


</script>

<style scoped>
.meeting-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar {
  background-color: #f5f7fa;
  padding: 10px;
  overflow: hidden;
}

.avatar-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar-item:hover {
  transform: scale(1.1);
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
  overflow-y: auto;
}

.meeting-content {
  padding: 20px;
}
</style>