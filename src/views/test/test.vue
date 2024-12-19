<template>
  <el-container class="chat-container">
    <el-aside width="25%">
      <h3>在线好友</h3>
      <el-list>
        <el-list-item v-for="friend in friends" :key="friend.id">
          {{ friend.username }}
        </el-list-item>
      </el-list>
    </el-aside>

    <el-main width="70%">
      <h3>聊天记录</h3>
      <el-card v-for="message in messages" :key="message.id" style="margin-bottom: 10px;">
        <div>
          <strong>{{ message.from }}:</strong>
          <span>{{ message.content }}</span>
        </div>
      </el-card>
      <el-input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const wschat = ref(null); // 聊天 websocket 实例
const friends = ref([]); // 在线好友列表
const messages = ref([]); // 聊天记录
const newMessage = ref(''); // 当前输入的消息

// 关闭 websocket 连接
const closeWebSocket = () => {
  if (wschat.value) {
    wschat.value.close();
  }
};

// 初始化聊天 websocket
const initWebSocket = () => {
  if (wschat.value) {
    wschat.value.close();
  }

  // 替换为实际的 WebSocket 服务地址
  wschat.value = new WebSocket('ws://121.37.24.76:8079/chat/' + localStorage.getItem('userId'));

  wschat.value.onopen = () => {
    console.log('WebSocket 连接成功');
  };
  
  wschat.value.onmessage = (event) => {
    console.log('WebSocket 接收到消息:', event.data);
    // 假设事件数据为 JSON 格式，可以转换为对象并添加到聊天记录中
    const message = JSON.parse(event.data);
    messages.value.push(message);
  };
  
  wschat.value.onclose = () => {
    console.log('WebSocket 连接关闭');
  };
  
  wschat.value.onerror = (error) => {
    console.error('WebSocket 发生错误:', error);
  };
};

// 发送消息
const sendMessage = () => {
  if (newMessage.value.trim() === '') return; // 消息不能为空
  const message = {
    from: localStorage.getItem('username'), // 假设用户名存储在 localStorage 中
    content: newMessage.value,
  };

  wschat.value.send(JSON.stringify(message)); // 发送消息
  messages.value.push(message); // 更新聊天记录
  newMessage.value = ''; // 清空输入框
};

// 获取在线好友信息的函数（可以在实际应用中根据需求实现）
const fetchFriends = async () => {
  // 假设从服务器获取在线好友信息
  const response = await fetch('/api/getOnlineFriends'); // 替换为实际的 API 地址
  friends.value = await response.json();
};

// 组件挂载时初始化 WebSocket 连接和获取好友信息
onMounted(() => {
  fetchFriends();
  initWebSocket();
});

// 组件卸载时关闭 WebSocket 连接
onBeforeUnmount(() => {
  closeWebSocket();
});
</script>

<style scoped>
.chat-container {
  display: flex;
}
</style>
