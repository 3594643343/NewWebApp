<template>
  <div class="chat-layout">
    <el-container class="chat-container">
      <el-aside class="user-list" width="200px">
        <h3>好友列表</h3>
        <el-menu>
          <el-menu-item
            v-for="friend in friends"
            :key="friend.id"
            @click="selectFriend(friend)"
          >
            <el-avatar :src="friend.avatar" size="small" class="avatar" />
            {{ friend.name }}
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="chat-header">
          <h3>与 {{ selectedFriend.name }} 的聊天</h3>
        </el-header>
        <el-main class="chat-main">
          <div class="message-list">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="['message', msg.sender === 'me' ? 'my-message' : 'friend-message']"
            >
              <span>{{ msg.text }}</span>
            </div>
          </div>
          <!-- 输入框和发送按钮现在在主体部分 -->
          <div class="input-wrapper">
            <el-input
              v-model="newMessage"
              class="input-message"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              clearable
            />
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const friends = ref([
  { id: 1, name: 'Alice', avatar: 'path/to/alice.jpg' },
  { id: 2, name: 'Bob', avatar: 'path/to/bob.jpg' },
  { id: 3, name: 'Charlie', avatar: 'path/to/charlie.jpg' },
]);

const selectedFriend = ref(friends.value[0]); // 默认选择第一个好友
const messages = ref([]); // 聊天记录
const newMessage = ref(''); // 输入框内容

// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend;
  messages.value = []; // 清空消息记录，实际应用中可以加载该好友的历史消息
};

// 发送消息
const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ id: messages.value.length + 1, text: newMessage.value, sender: 'me' });
    newMessage.value = ''; // 清空输入框
  }
};
</script>

<style>
.chat-layout {
  height: 100vh;
  display: flex;
  align-items: stretch;
}

.chat-container {
  width: 100%;
  background-color: #f2f2f2;
}

.user-list {
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
}

.chat-header {
  background-color: #ffffff;
  text-align: center;
  padding: 10px;
}

.chat-main {
  padding: 10px;
  background-color: #ffffff;
  flex: 1;
  overflow-y: auto; /* 可滚动 */
  display: flex;
  flex-direction: column; /* 使消息和输入框垂直排列 */
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 消息间距 */
  flex-grow: 1; /* 使消息列表占用剩余空间 */
  overflow-y: auto; /* 消息区域可滚动 */
}

.message {
  padding: 10px;
  border-radius: 5px;
  max-width: 60%;
}

.my-message {
  background-color: #e0f7fa;
  align-self: flex-end;
}

.friend-message {
  background-color: #ffe0b2;
  align-self: flex-start;
}

.input-wrapper {
  display: flex;
  align-items: center;
  margin-top: 10px; /* 增加输入框的上边距 */
  margin-bottom: 200px; /* 增加输入框的下边距 */
  margin-left: 10px; /* 增加输入框的左边距 */
}

.input-message {
  margin-right: 10px; /* 输入框与按钮间距 */
  width: 60%; /* 根据需要调整宽度 */
  margin-left: 220px; /* 增加输入框的左边距 */
}
</style>
