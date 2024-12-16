<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router';
import { searchFriends, applyAddFriend, searchGroup } from '@/api/user';

// 好友列表数据（示例数据，可替换为真实数据获取）
const friends = ref([
  { id: 1, name: 'Alice', avatar: 'path/to/alice.jpg', signature: 'A lovely friend' },
  { id: 2, name: 'Bob', avatar: 'path/to/bob.jpg', signature: 'Charming personality' },
  { id: 3, name: 'Charlie', avatar: 'path/to/charlie.jpg', signature: 'Always smiling' },
  { id: 4, name: 'David', avatar: 'path/to/david.jpg', signature: 'Tech enthusiast' },
]);

const selectedFriend = ref(friends.value[0]);
const searchFriendId = ref('');
const searchedFriend = ref(friends.value); // 初始显示所有好友信息
const userProfileDetailsVisible = ref(false); // 控制用户详情的显示
const foruserProfileDetailsVisible = ref(false); // 控制搜索中空白页的显示
const verificationMessage = ref(''); // 验证消息
const addFriendDialogVisible = ref(false); // 控制添加好友弹窗的显示
const ifFriendOrGroup = ref(true); // 判断是否是好友或群聊,false默认为搜索用户

// onMounted(() => {
//   initWschat();
// });

const selectFriend = (friend) => {
  selectedFriend.value = friend;
  foruserProfileDetailsVisible.value = false; // 隐藏搜索中空白页
  console.log('2:', userProfileDetailsVisible.value, foruserProfileDetailsVisible.value,ifFriendOrGroup.value);
};



const searchFriend = async () => {
  if (!searchFriendId.value.trim()) {
    // 如果搜索框为空，显示所有好友
    searchedFriend.value = friends.value;
    selectedFriend.value = friends.value[0];
    userProfileDetailsVisible.value = false; // 隐藏用户详情
    ifFriendOrGroup.value = true; // 判断是否是群聊
    return;
  }
  const inputValue = searchFriendId.value.trim();
  console.log('1:', userProfileDetailsVisible.value);
  foruserProfileDetailsVisible.value = true; // 隐藏用户详情
  try {
    if (inputValue.length === 9) {
      // 搜索用户逻辑
      const response = await searchFriends({
        friendId: parseInt(inputValue)
      });

      if (response && response.data) {
        console.log('查找好友成功', response.data);
        ifFriendOrGroup.value = true; // 判断是否是好友
        searchedFriend.value = [{
         ...response.data,
          avatar: response.data.friendAvatar.startsWith('data:image/')? response.data.friendAvatar : `data:image/jpeg;base64,${response.data.friendAvatar}`,
          signature: response.data.friendSignature,
          name: response.data.friendName
        }]; // 更新搜索结果为单个好友
        userProfileDetailsVisible.value = true; // 显示用户详情
      } else {
        console.error('查找好友失败，返回数据格式不正确');
        searchedFriend.value = [];
      }
    } else if (inputValue.length === 7) {
      // 搜索群聊逻辑
      const response = await searchGroup({
        groupId: parseInt(inputValue)
      });
      if (response && response.data) {
        console.log('查找群聊成功', response.data);
        ifFriendOrGroup.value = false; // 判断是否是群聊
        // 假设群聊数据结构包含avatar（头像）、groupName（群聊名称）、ownerName（群主名）等字段，根据实际后端返回调整
        searchedFriend.value = [{
          avatar: response.data.groupAvatar.startsWith('data:image/')? response.data.groupAvatar : `data:image/jpeg;base64,${response.data.groupAvatar}`,
          groupName: response.data.groupName,
          ownerName: response.data.creatorName,
          groupId: response.data.groupId,
        }];
        // userProfileDetailsVisible.value = true; // 显示群聊详情
      } else {
        console.error('查找群聊失败，返回数据格式不正确');
        console.log(response);
        searchedFriend.value = [];
      }
    } else {
      console.error('输入的数字位数不符合搜索用户或群聊的要求');
      searchedFriend.value = [];
    }
  } catch (error) {
    console.error('查找失败:', error);
    searchedFriend.value = [];
  }
};

const addFriend = async() => {
  try {
    const response = await applyAddFriend({
      friendId: parseInt(selectedFriend.value.friendId),
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送添加好友请求成功', response.data);
      // 发送成功后，关闭用户详情弹窗
      addFriendDialogVisible.value = false;
    } else {
      console.error('发送添加好友请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送添加好友请求失败:', error);
  }
  
};

const addGroup = () => {
  // 群聊申请逻辑，暂时不做实现
  console.log('申请入群');
};

const sendAddFriendRequest = async () => {
  try {
    const response = await applyAddFriend({
      friendId: parseInt(selectedFriend.value.friendId),
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送添加好友请求成功', response.data);
      // 发送成功后，关闭用户详情弹窗
      addFriendDialogVisible.value = false;
    } else {
      console.error('发送添加好友请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送添加好友请求失败:', error);
  }
};
</script>
<template>
  <div class="chat-layout">
    <el-container class="chat-container">
      <el-aside class="user-list" width="300px">
        <div>
          <el-input
            v-model="searchFriendId"
            class="search-input"
            placeholder="搜索好友/群聊"
            @input="searchFriend"
          />
        </div>

        <div class="friend-list">
          <h3>好友/群聊列表</h3>
          <el-menu v-if="searchedFriend.length > 0">
            <el-menu-item
              v-for="item in searchedFriend"
              :key="item.id"
              @click="selectFriend(item)"
            >
              <el-avatar :src="item.avatar" size="large" class="avatar" />
              <!-- 根据数据结构判断是用户还是群聊来展示不同内容 -->
              <span v-if="item.name">{{ item.name }}</span>
              <span v-else-if="item.groupName">{{ item.groupName }}</span>
              <span v-else>{{ '未知名称' }}</span>
            </el-menu-item>
          </el-menu>
          <div v-else>
            <p>没有找到匹配的好友/群聊</p>
          </div>
        </div>
      </el-aside>

      <el-container>
        <el-main class="chat-main">
          <div v-if="userProfileDetailsVisible==true&&foruserProfileDetailsVisible==false&&ifFriendOrGroup==true" class="user-details">
            <h5 style="margin-bottom: 10px;font-size: large;align-items: center;">用户信息：</h5>
            <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
            <h4>用户名：{{ selectedFriend.friendName }}</h4>
            <p>ID: {{ selectedFriend.friendId }}</p>
            <p>个性签名: {{ selectedFriend.signature }}</p>
            <el-button type="primary" @click="addFriend;addFriendDialogVisible=true">添加好友</el-button>
          </div>
          <div v-else-if="foruserProfileDetailsVisible">
            <el-empty description="点击搜索好友的头像显示详情" />
          </div>
          <div v-else-if="!ifFriendOrGroup" class="user-details">
            <h5 style="margin-bottom: 10px;font-size: large;align-items: center;">群聊信息：</h5>
            <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
            <h4>群聊名：{{ selectedFriend.groupName }}</h4>
            <p>群号: {{ selectedFriend.groupId }}</p>
            <p>群聊创建者: {{ selectedFriend.ownerName }}</p>
            <el-button type="primary" @click="addGroup">申请入群</el-button>
          </div>
          <div v-else class="chat-header">
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
          </div>
        </el-main>
      </el-container>
    </el-container>
    <!-- 添加好友请求对话框 -->
    <el-dialog class="add-friend-dialog" title="添加好友" v-model="addFriendDialogVisible">
      <el-input
        v-model="verificationMessage"
        placeholder="输入验证消息..."
        clearable
      />
      <span slot="footer">
        <el-button @click="addFriendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendAddFriendRequest">发送请求</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>
.chat-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.chat-container {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.user-list {
  background-color: #f5f5f5;
  border-right: 1px solid #ccc;
  height: 100%;
}

.search-input {
  width: 60%;
  padding: 5px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  margin-left: 15px;
  font-size: large;
}

.avatar {
  margin-right: 10px;
}

.chat-header {
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.chat-main {
  background-color: #f5f5f5;
  flex: 1;
  padding: 10px;
}

.message-list {
  height: 303px;
  overflow-y: scroll;
}

.friend-list {
  margin-top: 10px;
  margin-left: 70px;
}

.my-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.friend-message {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 10px;
  background-color: #fff;
  border-radius: 10px;
}

.input-wrapper {
  display: flex;
  justify-content: baseline;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.input-message {
  height: 100%;
  width: 60%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-message:focus {
  outline: none;
  border-color: #409eff;
  background-color: #f0f9ff;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.add-friend-dialog {
  width: 300px;
  margin-top: 100px;
}

.add-friend-dialog.el-input__inner {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.add-friend-dialog.el-button {
  width: 80%;
  margin-top: 10px;
  margin-left: 27px;
}
</style>