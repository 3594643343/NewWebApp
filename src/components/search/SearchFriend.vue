<template>
  <div class="chat-layout">
    <el-container class="chat-container">
      <el-aside class="user-list" width="200px">
        <h3>好友群聊列表</h3>
        <el-popover placement="right" :width="200" trigger="click" class="circle-plus-btn">
          <template #reference>
            <el-button style="margin-right: 16px; position: relative; bottom: 45px; left: 135px; color: #fff; background-color: #409eff;">
              <el-icon type="plus-circle-o" style="font-size: large;">
                <CirclePlus />
              </el-icon>
            </el-button>
          </template>
          <div>
            <el-button @click="openSearchDialog" type="text">搜索用户</el-button>
            <br />
            <el-button @click="addFriend" type="text">加好友</el-button>
            <br />
            <el-button @click="createGroup" type="text">创建群聊</el-button>
            <br />
            <el-button @click="addGroup" type="text">加入群聊</el-button>
          </div>
        </el-popover>
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

      <!-- 搜索好友弹窗 -->
      <el-dialog title="搜索好友" v-model="searchDialogVisible">
        <el-input v-model="searchFriendId" placeholder="输入好友 ID" clearable />
        <el-button type="primary" @click="searchFriend">搜索</el-button>

        <div v-if="searchedFriend">
          <h4>搜索结果:</h4>
          <h5>点击头像可以添加好友</h5>
          <el-avatar :src="searchedFriend.avatar" size="large" class="avatar" @click="openUserProfile" />
          <span>{{ searchedFriend.name }}</span>
          
        </div>
        
        <span slot="footer">
          <el-button @click="searchDialogVisible = false">取消</el-button>
        </span>
      </el-dialog>

      <!-- 用户详情弹窗 -->
      <el-dialog title="用户信息" v-model="userProfileDialogVisible">
        <el-avatar :src="profileFriend.avatar" size="large" />
        <h4>用户名：{{ profileFriend.friendName }}</h4>
        <h4>个性签名：{{ profileFriend.friendSignature }}</h4>
        <el-input v-model="verificationMessage" placeholder="输入验证消息..." clearable />
        <span slot="footer">
          <el-button @click="userProfileDialogVisible = false">关闭</el-button>
          <el-button type="success" @click="sendAddFriendRequest">添加好友</el-button>
        </span>
      </el-dialog>

      <!-- 创建群聊弹窗 -->
      <el-dialog title="创建群聊" v-model="createGroupDialogVisible">
        <el-input v-model="groupName" placeholder="输入群聊名称" clearable />
        <el-upload
          class="upload-avatar"
          :action="uploadAvatarUrl"   
          :on-success="handleAvatarUpload"
          show-file-list="false"
        >
          <el-button size="small" type="primary">上传群聊头像</el-button>
          <span v-if="groupAvatar">已选择头像</span>
        </el-upload>
        <el-switch
          v-model="needCheck"
          active-text="需要验证"
          inactive-text="不需要验证"
          active-value="1"
          inactive-value="0"
        />
        <span>加群是否需要验证</span>

        <span slot="footer">
          <el-button @click="createGroup">创建</el-button>
          <el-button @click="createGroupDialogVisible = false">取消</el-button>
        </span>
      </el-dialog>
      <el-main class="dialog-footer">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router';
import { searchFriends, applyAddFriend } from '@/api/user';

const friends = ref([
  { id: 1, name: 'Alice', avatar: 'path/to/alice.jpg', signature: 'A lovely friend' },
  { id: 2, name: 'Bob', avatar: 'path/to/bob.jpg', signature: 'Charming personality' },
  { id: 3, name: 'Charlie', avatar: 'path/to/charlie.jpg', signature: 'Always smiling' },
  { id: 4, name: 'David', avatar: 'path/to/david.jpg', signature: 'Tech enthusiast' },
]);

const selectedFriend = ref(friends.value[0]);
const messages = ref([]);
const newMessage = ref('');
const searchDialogVisible = ref(false);
const searchFriendId = ref(null);
const searchedFriend = ref(null);
const createGroupDialogVisible = ref(false);
const groupName = ref('');
const groupAvatar = ref(null);
const needCheck = ref(0);
const uploadAvatarUrl = 'http://localhost:3000/upload';

const userProfileDialogVisible = ref(false);
const profileFriend = ref({});
const verificationMessage = ref('');

const openUserProfile = () => {
  profileFriend.value = searchedFriend.value; // 将搜索到的好友信息赋值给 profileFriend
  userProfileDialogVisible.value = true;
};

const handleAvatarUpload = (file) => {
  console.log('上传头像成功', file);
  groupAvatar.value = file.response.data.url;
};

const createGroup = () => {
  createGroupDialogVisible.value = true;
  console.log('创建群聊成功', groupName.value, groupAvatar.value, needCheck.value);
};

const selectFriend = async (friend) => {
  selectedFriend.value = friend;
  router.push({ name: 'chat', params: { friendId: friend.id } });
};

const openSearchDialog = () => {
  searchDialogVisible.value = true;
  searchFriendId.value = ''; // 清空输入框
  searchedFriend.value = null; // 清空搜索结果
};

const searchFriend = async () => {
  try {
    const response = await searchFriends({
      friendId: parseInt(searchFriendId.value)
    });

    if (response && response.data) {
      console.log('查找好友成功', response.data);
      
      // 假设返回的数据结构中包含好友头像和个性签名
      searchedFriend.value = {
        ...response.data,
        avatar: response.data.friendAvatar.startsWith('data:image/') ? response.data.friendAvatar : `data:image/jpeg;base64,${response.data.friendAvatar}`,
        signature: response.data.signature // 确保后端返回的个性签名字段存在
      };
    } else {
      console.error('查找好友失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('查找好友失败:', error);
    console.log("searchFriendId: ", searchFriendId.value);
  }
};

const sendAddFriendRequest = async () => {
  try {
    const response = await applyAddFriend({
      friendId: parseInt(profileFriend.value.friendId),
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送添加好友请求成功', response.data);
      // 发送成功后，关闭用户详情弹窗
      userProfileDialogVisible.value = false;
    } else {
      console.error('发送添加好友请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送添加好友请求失败:', error);
  }
};



const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({ id: messages.value.length + 1, text: newMessage.value, sender: 'me' });
    newMessage.value = '';
  }
};

const addFriend = () => {
  // 添加好友逻辑
};

const addGroup = () => {
  // 创建群聊逻辑
};

onMounted(() => {
  // 执行请求好友列表逻辑等
});
</script>

<style>.chat-layout {
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
