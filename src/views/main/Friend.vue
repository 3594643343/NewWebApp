<template>
  <el-container class="friend-container">
    <el-aside width="25%">
      <el-header>
        <h3>管理我的好友和群聊</h3>
        <el-popover placement="bottom" :width="150" trigger="click" class="circle-plus-btn">
          <template #reference>
            <el-button 
              style="margin-right: 12px; position: relative; bottom: 45px; left: 190px; color: #fff; background-color: #409eff;"
            >
              <el-icon class="el-icon-plus">
                <CirclePlus />
              </el-icon>
            </el-button>
          </template>
          <div class="circle-plus-btn-actions">
            <el-button @click="showMessages" type="primary" class="action-button">我的消息</el-button>
            <el-button @click="showCreateGroup" type="primary" class="action-button">创建群聊</el-button>
          </div>
        </el-popover>
      </el-header>
      <el-scrollbar style="height: 400px;">
        <el-list>
          <el-list-item 
            v-for="item in friendsAndGroups" 
            :key="item.id" 
            class="friend-item"
            @dblclick="showFriendOrGroupDetails(item)"
          >
          <el-avatar :src="item.avatar" size="large" class="avatar" />
              <!-- 根据数据结构判断是用户还是群聊来展示不同内容 -->
              <span v-if="item.friendName"  >{{ item.friendName }}</span>
              <span v-else-if="item.groupName">{{ item.groupName }}</span>
              <span v-else>{{ '未知名称' }}</span>
          

            <div v-if = "item.friendName" class="friend-actions">
              <el-button type="primary" @click="goToChat">聊天</el-button>
              <el-button type="primary" @click="deleteFriend(item.friendId)">删除好友</el-button>
            </div>
            <div v-else-if = "item.groupName" class="friend-actions">
              <el-button type="primary" @click="goToChat">聊天</el-button>
              <el-button type="primary" @click="deleteGroup(item.groupId)">解散群聊</el-button>
            </div>
          </el-list-item>
        </el-list>
      </el-scrollbar>
    </el-aside>

    <el-main width="70%">
      <div v-if="currentPage === 'messages'" class="message-box">
        <h1 style="font-size: large;">我的消息</h1>
        <el-list>
          <el-card v-for="item in messageForm" :key="item.id" style="margin-bottom: 10px;">
            <div>
              <el-avatar :src="item.messagesederavatar" size="large" style="width: 50px;height: 50px;margin-right: 10px;" />
              <br>
              <span class="message-from">发送人：{{ item.messagesederusername + ':' }}</span>
              <br>
              <span class="message-to">发送人Id：{{ item.messagesenderid + ':' }}</span>
              <br>
              <span class="message-content">验证消息：{{ item.messagecontent }}</span>
              <br>
              <span class="message-time">时间：{{ item.time }}</span>
            </div>
        <el-button @click="handleRequest(1)" type="primary">同意</el-button>
        <el-button @click="handleRequest(0)" type="primary">拒绝</el-button>
          </el-card>
        </el-list>
      </div>
      <div v-if="currentPage === 'createGroup'" class="create-group-box">
        <h1 style="font-size: large;">创建群聊</h1>
        <el-form :model="groupForm" label-width="150px" class="create-group-form">
          <el-form-item label="群名称：" style="margin-bottom: 10px; margin-left: 0%;">
            <el-input style="width: 20%;" v-model="groupForm.groupName" placeholder="请输入群名称" />
          </el-form-item>
          <el-form-item label="上传群聊头像：" style="margin-bottom: 10px;">
            <el-upload
              class="avatar-uploader"
              :show-file-list="true"
              :http-request="handleAvatarUpload"
              :on-success="handleAvatarChange"
               @change="handleFileChange"
            >
              <el-button size="small" type="primary">选择头像</el-button>
              <img v-if="groupForm.avatar" :src="groupForm.avatar" class="avatar-preview" />
            </el-upload>
          </el-form-item>
          <el-form-item label="入群是否需要验证：" style="margin-bottom: 10px;">
            <el-radio-group v-model="groupForm.requireVerification">
              <el-radio label="是">是</el-radio>
              <el-radio label="否">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="createGroup">确认创建</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="friendgroup-detail-box">
        <div v-if="currentPage === 'friendDetail'" >
          <h5 style="margin-bottom: 10px;font-size: large; align-items: center;">用户信息：</h5>
          <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
          <h4>用户名：{{ selectedFriend.friendName }}</h4>
          <p>ID: {{ selectedFriend.friendId }}</p>
          <p>个性签名: {{ selectedFriend.signature }}</p>
        </div>
        <div v-if="currentPage === 'groupDetail'" >
          <h5 style="margin-bottom: 10px;font-size: large; align-items: center;">群聊信息：</h5>
          <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
          <h4>群聊名：{{ selectedFriend.groupName }}</h4>
          <p>群号: {{ selectedFriend.groupId }}</p>
          <p>群聊创建者: {{ selectedFriend.creatorName }}</p>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import { createMyGroup,getMyApplyList, deleteMyFriend,handleAddFriend,getOneFriend } from '@/api/user';
import emitter from '@/main.js'; // 根据实际路径调整引入
emitter.on('messageReceived', (receivedMessage) => {
  console.log('接收到消息', receivedMessage);
  

});

const friendsAndGroups = ref([]);
const showfriendData = () => {
  const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];
  console.log("friendsData", friendsData);
  friendsData.forEach((friend) => {
    const newFriend = {
      avatar: friend.avatar ? `data:image/png;base64,${friend.avatar}` : '',
      friendName: ref(friend.username),
      signature: ref(friend.signature && friend.signature.trim()!== ''? friend.signature : '尚未设置个性签名'),
      friendId: ref(friend.id)
    };
    friendsAndGroups.value.push(newFriend);
  });
};
// 我的申请列表
const showgroupData = () => {
  const groupsData = localStorage.getItem('usergroups') ? JSON.parse(localStorage.getItem('usergroups')) : [];
  console.log("groupsData", groupsData);
  groupsData.forEach((group) => {
    const newGroup = {
      avatar: group.groupAvatar ? `data:image/png;base64,${group.groupAvatar}` : '',
      groupName: group.groupName,
      creatorName: group.creatorName,
      groupId: group.groupId // 确保每个群组都有唯一的ID
    };
    friendsAndGroups.value.push(newGroup); // 将群组信息也添加到好友列表
  });
};



const message = ref([]);//id等信息
const messageForm = ref([]);//消息的发送人名单
const currentmessage = ref({
  messagesederavatar: '',
  messagesenderusername: '',
  messagereceiverusername: '',
  messagecontent: '',
  time: '',
  messagesenderid: '',
  messagereceiverid: '',
  messagesendersignature: '',
  recordId: ''
});

//显示请求
const showRequest = async() => {
  console.log("message.value.length", message.value.length)
  for (let i = 0; i < message.value.length; i++) {
    try {
      console.log("senderId 类型:", typeof message.value[0].senderId);
      console.log("message.value[" + i + "].senderId", message.value[i].senderId);
      const res = await getOneFriend({
        friendId: message.value[i].senderId
      });
      console.log(res);
      currentmessage.value.messagesederavatar = res.data.avatar ? `data:image/png;base64,${res.data.avatar}` : ''
      currentmessage.value.messagesederusername = res.data.username;
      currentmessage.value.messagesenderid = res.data.id;
      currentmessage.value.messagecontent = message.value[i].message;
      currentmessage.value.time = new Date().toLocaleString() ;//获取当前时间
      currentmessage.value.messagereceiverid = message.value[i].receiverId;
      currentmessage.value.messagesendersignature = res.data.signature;
      currentmessage.value.recordId = message.value[i].recordId;
      console.log("currentmessage", currentmessage.value);
    } catch (error) {
      console.error(error);
    }
    const myId= Number(localStorage.getItem('userId'));
    console.log("myId", myId);
    if (message.value[i].receiverId === myId) {
      messageForm.value.push(currentmessage.value);
    };
  }
  console.log("messageForm", messageForm.value);
  
};


// 处理请求
const handleRequest = async(check) => {
  console.log("check", check);
  try {
    const res = await handleAddFriend({
      recordId: currentmessage.value.recordId,
      friendId: currentmessage.value.messagesenderid,
      check: check
    });
    console.log(res);
    console.log("同意或拒绝成功");
    for (let i = 0; i < messageForm.value.length; i++) {
      if (messageForm.value[i].messagesenderid === currentmessage.value.messagesenderid) {
        messageForm.value.splice(i, 1); // 删除已处理的消息
        console.log("已删除"+ messageForm.value[i].messagesenderid)
      }
    }
  } catch (error) {
    console.error(error);
  }
};


const currentPage = ref('messages'); // 当前显示的页面
onMounted(() => {
  currentPage.value = 'messages';
  // loadFriends();
  loadmyApplyList();
  showfriendData();
  showgroupData();
  showRequest();
  
});

const loadmyApplyList = async () => {
  try {
    const res = await getMyApplyList();
    console.log("res",res);
    message.value = res.data;
    console.log("message",message.value);
    
  } catch (error) {
    console.error(error);
  }
};

const pendingRequest = ref(false); // 是否有待处理的请求

// 加载好友列表
// const loadFriends = async () => {
//   try {
//     const res = await getAllFriends();
//     console.log(res);
    
//     console.log("friends",friends.value);
//   } catch (error) {
//     console.error(error);
//   }
// };

// 删除好友
// 删除好友
const deleteFriend = async (id) => {
  try {
    console.log('删除好友请求参数：', id);
    await deleteMyFriend({
      friendId: id
    });
    
    // 删除成功后更新 localStorage
    const friendsData = localStorage.getItem('friends') ? JSON.parse(localStorage.getItem('friends')) : [];
    const updatedFriendsData = friendsData.filter(friend => friend.id !== id); // 过滤掉被删除的好友
    localStorage.setItem('friends', JSON.stringify(updatedFriendsData)); // 更新 localStorage
    
    console.log('删除好友成功');
  } catch (error) {
    console.error('删除好友失败:', error);
  }
};


// 创建群聊表单数据
const groupForm = ref({
  groupName: '',
  avatar: null,
  requireVerification: '否'
});

// 显示我的消息
const showMessages = () => {
  currentPage.value = 'messages';
};

const goToChat = () => {
  router.push('/main/chat');
};
// 显示创建群聊
const showCreateGroup = () => {
  currentPage.value = 'createGroup';
};

// 处理头像上传变化
const handleAvatarChange = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file.raw);
    reader.onload = () => {
        console.log('文件读取成功，赋值前的groupForm.avatar：', groupForm.value.avatar);
        groupForm.value.avatar = file.raw; 
        console.log('文件读取成功，赋值后的groupForm.avatar：', groupForm.value.avatar);
    };
    reader.onerror = (error) => {
        console.error('文件读取出错：', error);
    };
};

const handleFileChange = (fileList) => {
    console.log('进入handleFileChange函数，fileList：', fileList);
    if (fileList && fileList.raw) {
        const file = fileList.raw; 
        console.log('获取到的文件对象：', file);
        groupForm.value.avatar = file; 
        console.log('赋值后的groupForm.avatar：', groupForm.value.avatar);
    } else {
        console.warn('没有选择文件或fileList为undefined');
    }
};



function handleAvatarUpload(file) {
  console.log("file",file);
}
// 创建群聊的确认操作
const createGroup = async () => {
    const formData = new FormData();
    formData.append('groupName', groupForm.value.groupName);
    formData.append('groupAvatar', groupForm.value.avatar); // 更改为groupAvatar
    formData.append('needCheck', groupForm.value.requireVerification === '是' ? 1 : 0); // 将字符串转换为整数
    console.log("formData", formData);
    try {
        const res = await createMyGroup(formData);
        console.log("创建群聊成功", res);
    } catch (error) {
        console.error(error);
        console.error('创建群聊失败:', error.response ? error.response.data : error.message);
    }
};

 
const showFriendOrGroupDetails = (item) => {
  selectedFriend.value = item;
  console.log("selectedFriend", selectedFriend.value);
  if (item.groupId) {
    currentPage.value = 'groupDetail'; // 设置当前页面为群组详细信息
  } else {
    currentPage.value = 'friendDetail'; // 设置当前页面为好友详细信息
  }
};
           




</script>

<style scoped>
.friend-container {
  display: flex;
}

.friend-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.friend-avatar {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-right: 10px;
}

.friend-name {
  font-size: 12px;
  font-weight: bold;
  margin-top: 10px;
}

.friend-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-left: auto;
  margin-right: 10px;
}

.friend-actions button {
  width: 60px;
}

.message-box {
  margin-top: 20px;
}

.create-group-box {
  margin-top: 20px;
}

.create-group-form {
  margin-top: 100px;
  align-items: center;
}

.avatar-uploader {
  display: flex;
  align-items: center;
}

.avatar-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-left: 10px;
}

.circle-plus-btn {
  position: relative;
  top: 10px;
  margin-right: 10px;

}

.circle-plus-btn-actions {
  display: flex;
  flex-direction: column;
  position: absolute; /* 修改为绝对定位 */
  left: 0; /* 使其相对于按钮左侧对齐 */
  top: 100%; /* 确保在按钮正下方 */
  width: 100%; /* 适应宽度 */
  background-color: #f4f0f0; /* 自定义背景色 */
  z-index: 1000;
}

.circle-plus-btn-actions .action-button {
  width: 100%; /* 按钮宽度100% */
  margin-bottom: 10px;
  margin-left: 0; /* 左对齐 */
}

.el-icon-plus {
  font-size: 22px;
  color: #f4f6f8;
}

.friendgroup-detail-box {
  background-color: #f5f5f5;
  flex: 1;
  padding: 10px;
  margin-left: 300px;
}
</style>
