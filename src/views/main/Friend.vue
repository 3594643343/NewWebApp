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
            <el-avatar :src="friend.avatar" size="large" class="avatar" />
            {{ friend.name }}
          </el-menu-item>
        </el-menu>
        <el-button type="primary" @click="addFriend" class="add-friend-btn">添加好友</el-button>
        <!-- 添加好友弹窗 -->
        <el-dialog title="申请添加好友" v-model="addFriendDialog" width="30%">
          <el-form :model="newFriend">
            <el-form-item label="好友 ID" required>
              <el-input v-model="newFriend.id"></el-input>
            </el-form-item>
            <el-form-item label="验证消息" required>
              <el-input v-model="newFriend.message"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addFriendDialog = false">取消</el-button>
            <el-button type="primary" @click="addFriend">发送申请</el-button>
          </span>
        </el-dialog>
      </el-aside>

      <!-- 新增的群聊列表 -->
      <el-aside class="group-list" width="250px">
        <h3>群聊列表</h3>
        <el-menu>
          <el-menu-item
            v-for="group in groups"
            :key="group.id"
            @click="selectGroup(group)"
          >
            <el-avatar :src="group.avatar" size="large" class="avatar" />
            {{ group.name }}
          </el-menu-item>
        </el-menu>
        <el-button type="primary" @click="addGroup" class="add-group-btn">创建群聊</el-button>
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
import { ref , onMounted } from 'vue';
import { getUserFriends} from '../../api/user';

const friends = ref([
  { id: 1, name: 'Alice', avatar: 'path/to/alice.jpg' },
  { id: 2, name: 'Bob', avatar: 'path/to/bob.jpg' },
  { id: 3, name: 'Charlie', avatar: 'path/to/charlie.jpg' },
  { id: 4, name: 'David', avatar: 'path/to/david.jpg' },
]);

const groups = ref([
  { id: 1, name: '工作群', avatar: 'path/to/group1.jpg' },
  { id: 2, name: '家庭群', avatar: 'path/to/group2.jpg' },
  { id: 3, name: '朋友群', avatar: 'path/to/group3.jpg' },
  { id: 4, name: '同学群', avatar: 'path/to/group4.jpg' },
]);

const selectedFriend = ref(friends.value[0]);
console.log("selectedFriend.value", selectedFriend.value);
const messages = ref([]);
const newMessage = ref('');
const addFriendDialog = ref(false);
const newFriend = ref({ id: '', message: '' });

// const getFriends = async () => {
//   const result = await getUserFriends();
//   friends.value = result.data;
//   console.log("friends.value", friends.value);
// };


// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend;
  messages.value = [];
};

// 选择群聊
const selectGroup = (group) => {
  selectedFriend.value = group;
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
  addFriendDialog.value = true;
};

// 创建群聊
const addGroup = () => {
  const groupName = prompt('请输入群聊的名字:');
  const avatarPath = prompt('请输入群聊的头像路径:');
  if (groupName && avatarPath) {
    const newGroup = {
      id: groups.value.length + 1,
      name: groupName,
      avatar: avatarPath,
    };
    groups.value.push(newGroup);
    alert('群聊创建成功！');
  } else {
    alert('请填写群聊的名字和头像路径！');
  }
};
onMounted(() => {
  // getFriends();
});
</script>

<style>
.chat-layout {
  height: 80vh;
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

.group-list {
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0; /* 添加左边框以区分 */
}

.add-friend-btn,
.add-group-btn {
  position: relative;
  bottom: 265px;
  left: 90px;
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
  padding: 10px;
  margin-bottom: 100px;
}

.input-message {
  margin-right: 10px;
  flex-grow: 1; /* 自适应宽度 */
}

.avatar {
  margin-right: 10px; /* 头像与名称间距 */
  border-radius: 50%;
  margin-bottom: 10px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
