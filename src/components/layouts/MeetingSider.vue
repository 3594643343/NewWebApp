<template>
  <div class="meeting-page">
    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-scrollbar style="height: 100vh;">
          <div class="avatar-list">
            <el-avatar
              v-for="(user, index) in users"
              :key="index"
              :src="user.avatar"
              size="60"
              class="avatar-item"
            ></el-avatar>
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
export default {
  name: 'MeetingPage',
  data() {
    return {
      users: [
        { avatar: 'https://via.placeholder.com/60' },
        { avatar: 'https://via.placeholder.com/60' },
        { avatar: 'https://via.placeholder.com/60' },
        { avatar: 'https://via.placeholder.com/60' },
        { avatar: 'https://via.placeholder.com/60' },
        // 添加更多用户头像链接
      ],
    };
  },
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