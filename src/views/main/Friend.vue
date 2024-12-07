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
        <el-button type="primary" @click="addFriend" class="add-friend-btn">添加好友</el-button>
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

const selectedFriend = ref(friends.value[0]);
const messages = ref([]);
const newMessage = ref('');

// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend;
  messages.value = [];
};

// 发送消息
const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ id: messages.value.length + 1, text: newMessage.value, sender: 'me' });
    newMessage.value = '';
  }
};

// 添加好友
const addFriend = () => {
  const friendName = prompt('请输入好友的名字:');
  const avatarPath = prompt('请输入好友的头像路径:'); // 可以根据需要更改为更复杂的输入处理
  if (friendName && avatarPath) {
    const newFriend = {
      id: friends.value.length + 1,
      name: friendName,
      avatar: avatarPath,
    };
    friends.value.push(newFriend);
    alert('好友添加成功！');
  } else {
    alert('请填写好友的名字和头像路径！');
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
  position: relative; /* 使按钮绝对定位在好友列表内 */
}

.add-friend-btn {
  position: relative; /* 绝对定位按钮 */
  left: 100px;
  bottom: 215px;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  overflow-y: auto;
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
  margin-top: 10px;
  margin-bottom: 200px;
  margin-left: 10px;
}

.input-message {
  margin-right: 10px;
  width: 60%;
  margin-left: 220px;
}
</style>
