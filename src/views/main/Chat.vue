<script setup>
import { ref, onMounted,onBeforeUnmount,nextTick } from 'vue';
import router from '@/router';
import { searchFriends,getAllFriends,getUserGroups,getOneGroup, applyAddFriend, searchGroup, getChatRecord,getGroupChatRecord,getGroupMembers,applyJoinGroup,handleJoinGroup,getOneFriend } from '@/api/user';
import { initWschat,getWschat,closewschat } from '@/api/user';
import emitter from '@/main.js'; // 根据实际路径调整引入
import { debounce } from 'lodash';
import { ElMessage } from 'element-plus';


onMounted(async () => {
  startCacheClearTimer(); // 启动缓存清理定时器
  await loadFriends(); // 加载好友列表
  await loadUserGroups(); // 加载群聊列表
  initWschat(); // 初始化 WebSocket
  console.log("Chat页面加载完成",friendsAndGroups.value);
  console.log("Chat页面加载完成2",friendsAndGroups.value.length);
  if (friendsAndGroups.value.length > 0) {
    selectedFriend.value = friendsAndGroups.value[0]; // 设置默认选择的好友
    console.log("默认选择的好友",selectedFriend.value);
  }
  initMessageList();
});


//处理websocket消息
const wschatifFriendOrGroup = ref(true); //发消息的是好友还是群聊,true为好友，false为群聊

emitter.on('messageReceived', async (receivedMessage) => {
  console.log('接收到消息', receivedMessage);
   // 判断是好友还是群聊
   if(receivedMessage.code === 1){
    wschatifFriendOrGroup.value = true; //发消息的是好友
   }else if(receivedMessage.code === 2){
    wschatifFriendOrGroup.value = false; //发消息的是群聊
   }else if (receivedMessage.code === 0) {
    NotFriend();
   }else if (receivedMessage === 'NEW_FRIEND') {
     await loadFriends();
   }else if (receivedMessage === 'PASS_ADD_GROUP') {
     await loadUserGroups();
   };
  if (wschatifFriendOrGroup.value) {
    const newMessageItem = {
        id: receivedMessage.data.senderId,
        speaker: receivedMessage.data.senderId === parseInt(myUserId)? 'me' : 'friend',
        text: receivedMessage.data.content,
        time: receivedMessage.data.time
    };
    messageList.value.push(newMessageItem);
    scrollToBottom();
  } else {
    console.log("接收到群聊消息", receivedMessage.data.groupId)
    const memberInfo = await getGroupmemberInfo(receivedMessage.data.groupId);
    console.log("memberInfo", memberInfo);
    // console.log("memberInfo.value", memberInfo.value)
    console.log("memberInfo.find(member => member.value.userId === receivedMessage.data.senderId).userName", memberInfo.find(member => member.userId === receivedMessage.data.senderId).userName)
    console.log("memberInfo.find(member => member.value.userId === receivedMessage.data.senderId).userAvatar", memberInfo.find(member => member.userId === receivedMessage.data.senderId).userAvatar)
    const newMessageItem = {
      id: receivedMessage.data.senderId,
      text: receivedMessage.data.content,
      time: receivedMessage.data.time,
      speaker: receivedMessage.data.speakerId === parseInt(myUserId)? 'me' : 'friend',
      speakername: memberInfo.find(member => member.userId === receivedMessage.data.senderId).userName,
      speakerAvatar: memberInfo.find(member => member.userId === receivedMessage.data.senderId).userAvatar ? `data:image/png;base64,${memberInfo.find(member => member.userId === receivedMessage.data.senderId).userAvatar}` : ''
    };
    console.log("newMessageItem", newMessageItem);
    groupMessageList.value.push(newMessageItem);
    scrollToBottom();
  }
});

//加载好友群聊列表
const friends = ref([]);
const usergroups= ref([]);
const groupid= ref('');

const loadFriends = async () => {
  try {
    const res = await getAllFriends();
    console.log(res);
    friends.value = res.data;
    localStorage.setItem('friends', JSON.stringify(friends.value));
    showfriendData();
    console.log("获取好友列表成功:friends",friends.value);
  } catch (error) {
    console.error(error);
  }
};
  
const loadUserGroups = async () => {
  try {
    const res = await getUserGroups();
    console.log(res);
    groupid.value = res.data;
    console.log("获取用户群号成功:usergroups",groupid.value);
    for(let i=0;i<groupid.value.length;i++){
      const res1 = await getOneGroup(groupid.value[i]);
      console.log(res1);
      usergroups.value.push(res1.data);
      console.log("获取用户群信息成功:usergroups",usergroups.value);
    }
    localStorage.setItem('usergroups', JSON.stringify(usergroups.value));
    showgroupData();
  } catch (error) {
    console.error(error);
  }
};
const NotFriend = () => {
  ElMessage({
    message: '发送消息失败，对方不是好友',
    type: 'warning',
  })
}

// 获取群成员信息
const cachedGroupMembers = {};
const getGroupmemberInfo = async (id) => {
    if (typeof id!== 'number' || isNaN(id)) {
        console.error('groupId参数不合法，必须是有效的数字');
        return [];
    }
    if (cachedGroupMembers[id]) {
        return cachedGroupMembers[id];
    }
    console.log('getGroupmemberInfo', id);
    const response = await getGroupMembers({
        groupId: id
    });
    if (response && response.data) {
        cachedGroupMembers[id] = response.data;
        return response.data;
    } else {
        console.error('获取群成员信息失败，返回数据格式不正确');
        return [];
    }
};

//好友群聊列表信息
const friendsAndGroups = ref([]);
const myUserInfo = localStorage.getItem('userProfile')? JSON.parse(localStorage.getItem('userProfile')) : {};
const myUserAvatar = myUserInfo.avatar ? `data:image/png;base64,${myUserInfo.avatar}` : '';

// 友信息示例
// const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];

const showfriendData = () => {
  // 先清空friendsAndGroups数组
  // friendsAndGroups.value = [];
  const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];
  console.log("friendsData", friendsData);
  friendsData.forEach((friend) => {
    const newFriend = {
      friendId: friend.id,
      avatar: ref(friend.avatar? 'data:image/png;base64,' + friend.avatar : ''),
      name: ref(friend.username),
      signature: ref(friend.signature && friend.signature.trim()!== ''? friend.signature : '尚未设置个性签名')
    };
    // 检查好友是否已存在
    const exists = friendsAndGroups.value.some(existingFriend => existingFriend.friendId === friend.id);
    
    if (exists) {
      console.log("存在相同群聊，不添加");
    } else {
      friendsAndGroups.value.push(newFriend); // 将群聊信息添加到群聊列表
    }
  });
  return friendsData;
};

const showgroupData = () => {
  // 先清空friendsAndGroups数组
  // friendsAndGroups.value = [];
  const groupsData = localStorage.getItem('usergroups') ? JSON.parse(localStorage.getItem('usergroups')) : [];
  console.log("groupsData", groupsData);
  groupsData.forEach((group) => {
    const newGroup = {
      avatar: group.groupAvatar ? `data:image/png;base64,${group.groupAvatar}` : '',
      groupName: group.groupName,
      creatorName: group.creatorName,
      groupId: group.groupId // 确保每个群组都有唯一的ID
    };
    // 检查群聊是否已存在
    const exists = friendsAndGroups.value.some(existingGroup => existingGroup.groupId === group.groupId);
    
    if (exists) {
      console.log("存在相同群聊，不添加");
    } else {
      friendsAndGroups.value.push(newGroup); // 将群聊信息添加到群聊列表
    }
  });
};





const selectedFriend = ref({}); // 选中的好友
const searchFriendId = ref('');
const searchedFriend = ref(friendsAndGroups.value); // 初始显示所有好友信息
const userProfileDetailsVisible = ref(false); // 控制用户详情的显示
const foruserProfileDetailsVisible = ref(false); // 控制搜索中空白页的显示
const verificationMessage = ref(''); // 验证消息
const addFriendDialogVisible = ref(false); // 控制添加好友弹窗的显示
const addGroupDialogVisible = ref(false); // 控制加入群聊弹窗的显示
const ifFriendOrGroup = ref(true); // 判断是否是好友或群聊,false默认为搜索用户

// onMounted(() => {
//   initWschat();
// });

let ifsearchfriend = ref(false); // 判断搜索的好友是不是我的好友
let ifsearchgroup = ref(false); // 判断搜索的群聊是不是我的群聊

const selectFriend = (friend) => {
  selectedFriend.value = friend;
  for(let i=0;i<friendsAndGroups.value.length;i++){
    if(friendsAndGroups.value[i].friendId){
      if(friendsAndGroups.value[i].friendId === friend.friendId){
      ifsearchfriend = true; // 判断是否是好友
      console.log("friendsAndGroups.value[i].friendId", friendsAndGroups.value[i].friendId);
      console.log("friend.friendId", friend.friendId);
      }
    }else{
      if(friendsAndGroups.value[i].groupId === friend.groupId){
      ifsearchgroup = true; // 判断是否是群聊
      console.log("friendsAndGroups.value[i].groupId", friendsAndGroups.value[i].groupId);
      console.log("friend.groupId", friend.groupId);
      }
    }
  }
  console.log("ifsearchfriend", ifsearchfriend);
  console.log("ifsearchgroup", ifsearchgroup);
  initMessageList();
  foruserProfileDetailsVisible.value = false; // 隐藏搜索中空白页
  newMessage.value = ''; // 清空输入消息
  console.log('2:', userProfileDetailsVisible.value, foruserProfileDetailsVisible.value,ifFriendOrGroup.value);
};

let ifmyself = false; // 判断是否是自己

const searchFriend = async () => {
  if (!searchFriendId.value.trim()) {
    // 如果搜索框为空，显示所有好友
    console.log('搜索框为空，显示所有好友', friendsAndGroups.value);  
    searchedFriend.value = friendsAndGroups.value;
    selectedFriend.value = friendsAndGroups.value[0];
    userProfileDetailsVisible.value = false; // 隐藏用户详情
    ifFriendOrGroup.value = true; // 判断是否是群聊
    return;
  }
  const inputValue = searchFriendId.value.trim();
  console.log('1:', userProfileDetailsVisible.value);
  foruserProfileDetailsVisible.value = true; // 隐藏用户详情
  if (parseInt(inputValue) === parseInt(myUserId)) {
        // 如果搜索框内容为自己的 ID，显示我的信息
        ifmyself = true;
        console.log('搜索框内容为自己的 ID，显示我的信息', myUserInfo);
        searchedFriend.value = [{
          ...myUserInfo,
          avatar: myUserInfo.avatar ? `data:image/png;base64,${myUserInfo.avatar}` : '',
          signature: myUserInfo.signature && myUserInfo.signature.trim() !== ''? myUserInfo.signature : '尚未设置个性签名',
          friendName: myUserInfo.username,
          name: myUserInfo.username,
          friendId: myUserId
        }];
        console.log('搜索框内容为自己的 ID，显示我的信息2', searchedFriend.value);
        userProfileDetailsVisible.value = true; // 显示用户详情
        return;
    }
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
          name: response.data.friendName,
          friendId: response.data.friendId
        }]; // 更新搜索结果为单个好友
        console.log('搜索框内容为好友 ID，显示该好友信息', searchedFriend.value);
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

//添加好友
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
      loadFriends(); // 刷新好友列表
    } else {
      console.error('发送添加好友请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送添加好友请求失败:', error);
  }
  
};

const addGroup = async() => {
  try {
    const response = await applyJoinGroup({
      groupId: parseInt(selectedFriend.value.groupId),
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送加入群聊请求成功', response.data);
      // 发送成功后，关闭用户详情弹窗
      addGroupDialogVisible.value = false;
      loadUserGroups(); // 刷新群聊列表
    } else {
      console.error('发送加入群聊请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送加入群聊请求失败:', error);
  }
  
};

const myUserId = localStorage.getItem('userId'); // 获取当前用户 ID
const chatRecords = ref([]); // 聊天记录
// 假设这是您的用户 ID

const messageList = ref([]); // 好友聊天记录
const groupMessageList = ref([]); // 群聊聊天记录


let cachedGroupChatRecords = {};
let cacheClearTimer;

const startCacheClearTimer = () => {
    cacheClearTimer = setInterval(() => {
        cachedGroupChatRecords = {}; // 清除缓存数据
    }, 1 * 60 * 1000); // 每5分钟清除一次缓存，单位毫秒
};

const initMessageList = async () => {
    console.log('初始化聊天记录:', selectedFriend.value.friendId);
    console.log('初始化聊天记录2:', selectedFriend.value);
    if (selectedFriend.value.friendId) {
        // 好友聊天记录获取逻辑
        try {
            const response = await getChatRecord({
                friendId: selectedFriend.value.friendId,
            });
            if (response && response.data) {
                console.log('获取好友聊天记录成功', response.data);
                chatRecords.value = response.data;
                messageList.value = response.data.map((item) => {
                    const newItem = {
                        id: item.speakerId,
                        speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
                        text: item.text,
                        time: item.time,
                    };
                    return newItem;
                });
                messageList.value.sort((a, b) => new Date(a.time) - new Date(b.time));
                console.log('初始化好友聊天记录3:', messageList.value);
                scrollToBottom();
            } else {
                console.error('获取好友聊天记录失败，返回数据格式不正确');
            }
        } catch (error) {
            console.error('获取好友聊天记录失败:', error);
        }
    } else {
        const groupId = selectedFriend.value.groupId;
        console.log('初始化群聊记录:', groupId);
        console.log('是否有缓存数据:', cachedGroupChatRecords[groupId]);
        console.log('缓存数据:', cachedGroupChatRecords);

        try {
            let response;
            if (cachedGroupChatRecords[groupId]) {
                const cachedData = cachedGroupChatRecords[groupId];
                const cachedTime = cachedData[0]?.lastUpdateTime;
                response = await getGroupChatRecord({
                    groupId: groupId,
                });
                if (response && response.data) {
                    const serverTime = response.data[0].lastUpdateTime;
                    if (cachedTime < serverTime) {
                        console.log('缓存数据已过期，更新缓存并重新获取最新群聊记录');
                        chatRecords.value = response.data;
                        cachedGroupChatRecords[groupId] = response.data;
                    } else {
                        console.log('使用缓存数据，缓存仍有效');
                        chatRecords.value = cachedData;
                    }
                } else {
                    console.error('获取群聊记录失败，返回数据格式不正确');
                }
            } else {
                response = await getGroupChatRecord({
                    groupId: groupId,
                });
                if (response && response.data) {
                    console.log('获取群聊记录成功', response.data);
                    chatRecords.value = response.data;
                    cachedGroupChatRecords[groupId] = response.data;
                } else {
                    console.error('获取群聊记录失败，返回数据格式不正确');
                }
            }

            if (response && response.data) {
                const items = response.data.map(async (item) => {
                    const memberInfo = await getGroupmemberInfo(groupId);
                    const newItem = {
                        id: item.speakerId,
                        text: item.text,
                        time: item.time,
                        speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
                        speakername: memberInfo.find(member => member.userId === item.speakerId).userName,
                        speakerAvatar: memberInfo.find(member => member.userId === item.speakerId).userAvatar? `data:image/png;base64,${memberInfo.find(member => member.userId === item.speakerId).userAvatar}` : ''
                    };
                    return newItem;
                });
                groupMessageList.value = await Promise.all(items);
                groupMessageList.value.sort((a, b) => new Date(a.time) - new Date(b.time));
                console.log('初始化群聊记录3:', groupMessageList.value);
                console.log('初始化群聊记录4:', messageList.value);
                scrollToBottom();
            }
        } catch (error) {
            console.error('获取群聊记录失败:', error);
        }
    }
};
const messageListElement = ref(null); // 创建对消息列表元素的引用
const scrollToBottom = () => {
  nextTick(() => {
    const messageListElement = document.querySelector('.message-list'); // 获取消息列表 DOM 元素
    if (messageListElement) {
      messageListElement.scrollTop = messageListElement.scrollHeight; // 滚动到底部
    }
  });
};



const newMessage = ref(''); // 新消息内容
const updateChatRecords = debounce(async () => {
    await initMessageList();
    console.log('更新聊天记录成功:', messageList.value);
    console.log('清空前输入消息:', newMessage.value);
    newMessage.value = '';
    console.log('清空输入消息:', newMessage.value);
}, 100); // 这里设置节流时间间隔为1秒，即1秒内多次发送消息只会执行一次更新操作

const sendMessage = async (newmessage) => {
  console.log('发送消息:', newmessage);
  if (!newmessage.trim()) return; // 消息不能为空

  // 获取接收者的 ID 和判断是否是群聊
  const receiverId = (selectedFriend.value.friendId || selectedFriend.value.groupId).toString();
  const isGroup = selectedFriend.value.groupId ? '1' : '0';
  console.log('receiverId:', receiverId);
  console.log('isGroup:', isGroup);

  // 获取当前时间并格式化
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1，并补零
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  console.log('time:', time);

  // 构建 JSON 对象
  const message = {
    receiverId: receiverId,
    isGroup: isGroup,
    time: time,
    content: newmessage,
  };
  console.log('发送消息message:', message);
  
  const wschat = getWschat(); // 获取 WebSocket 实例
  if (wschat && wschat.readyState === WebSocket.OPEN) {
    wschat.send(JSON.stringify(message)); // 发送消息
    // messages.value.push(message); // 更新聊天记录
    await updateChatRecords(); // 更新聊天记录
  } else {
    console.error('WebSocket 未连接或处于关闭状态');
  }

};



</script>

<template>
  <div class="chat-layout">
    <el-container class="chat-container">
      <el-aside class="user-list" width="300px">
        <div class="search-container">
          <el-input
            v-model="searchFriendId"
            class="search-input"
            placeholder="搜索好友/群聊"
            @input="searchFriend"
          />
        </div>

        <div class="friend-list">
          <h3>好友/群聊列表</h3>
          <br>
          <el-menu v-if="searchedFriend.length > 0">
            <el-menu-item
              v-for="item in searchedFriend"
              :key="item.time"
              @click="selectFriend(item)"
              class="friend-menu-item"
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
          <div v-if="userProfileDetailsVisible == true && foruserProfileDetailsVisible == false && ifFriendOrGroup == true" class="user-details">
            <h5 style="margin-bottom: 10px;font-size: large;align-items: center;">用户信息：</h5>
            <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
            <h4>用户名：{{ selectedFriend.friendName }}</h4>
            <p>ID: {{ selectedFriend.friendId }}</p>
            <p>个性签名: {{ selectedFriend.signature }}</p>
            <div v-if="ifmyself==false&&ifsearchfriend==false">
              <el-button  type="primary" @click="addFriend; addFriendDialogVisible=true">添加好友</el-button>
            </div>
            <div v-else-if="ifmyself==false&&ifsearchfriend">
              <span style="margin-left: 10px;">已是好友</span>
            </div>
            <div v-else>
              <span style="margin-left: 10px;">自己</span>
            </div>
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
            <div v-if="ifsearchgroup==false">
              <el-button  type="primary" @click="addGroup;addGroupDialogVisible=true">申请入群</el-button>
            </div>
            <div v-else>
              <span style="margin-left: 10px;">已加入群聊</span>
            </div>
          </div>
          <div v-else>
            <div class="chat-header">
              <el-header class="chat-header">
                <h3 v-if="selectedFriend.name">与 {{ selectedFriend.name }} 的聊天</h3>
                <h3 v-else>在 {{ selectedFriend.groupName }} 中的聊天</h3>
              </el-header>
            </div>
            <!-- <div class="message-list-container"> -->
              <div class="message-list" ref="messageListElement">
                <div
                  v-if="selectedFriend.name"
                  v-for="msg in messageList"
                  :class="msg.speaker === 'me' ? 'my-message' : 'friend-message'"
                >
                  <div v-if="msg.speaker === 'friend'"  class="message-content">
                    <el-avatar :src="selectedFriend.avatar" size="medium" class="avatar" />
                    <div class="text-container">
                      <span class="text">{{ msg.text }}</span>
                    </div>
                  </div>
                  <div v-else  class="message-content">
                    <div class="text-container">
                      <span class="text">{{ msg.text }}</span>
                    </div>
                    <el-avatar :src="myUserAvatar" size="medium" class="avatar" />
                  </div>
                </div>
                <div
                  v-else
                  v-for="msg in groupMessageList"
                  :class="msg.speaker === 'me' ? 'my-message' : 'friend-message'"
                >
                  <div v-if="msg.speaker === 'friend'"  class="message-content">
                    <el-avatar :src="msg.speakerAvatar" size="medium" class="avatar" />
                    <div class="text-container">
                      <span class="text">{{ msg.text }}</span>
                    </div>
                  </div>
                  <div v-else  class="message-content">
                    <div class="text-container">
                      <span class="text">{{ msg.text }}</span>
                    </div>
                    <el-avatar :src="myUserAvatar" size="medium" class="avatar" />
                  </div>
              </div>
              </div>
            <!-- </div> -->
            <div class="input-wrapper">
              <el-input
                v-model="newMessage"
                class="input-message"
                placeholder="输入消息..."
                @keyup.enter="sendMessage(newMessage)"
                clearable
              />
              <el-button type="primary" @click="sendMessage(newMessage)">发送</el-button>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
    <!-- 添加好友请求对话框 -->
    <el-dialog class="add-friend-dialog" title="添加好友" v-model="addFriendDialogVisible" width="400px" center>
      <div class="dialog-content">
        <el-input
          v-model="verificationMessage"
          placeholder="输入验证消息..."
          clearable
          class="verification-input"
        />
        <el-button type="primary" @click="addFriend" class="dialog-button">发送请求</el-button>
        <el-button @click="addFriendDialogVisible = false" class="dialog-button">取消</el-button>
      </div>
    </el-dialog>
    <!-- 申请群聊请求对话框 -->
    <el-dialog class="add-friend-dialog" title="申请入群" v-model="addGroupDialogVisible"  width="400px" center>
      <div class="dialog-content">
        <el-input
          v-model="verificationMessage"
          placeholder="输入验证消息..."
          clearable
          class="verification-input"
        />
        <el-button type="primary" @click="addGroup" class="dialog-button">发送请求</el-button>
        <el-button @click="addGroupDialogVisible = false" class="dialog-button">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<style>
.search-container {
  display: flex;
  justify-content: center;
}

.chat-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.user-list {
  background-color: #f5f5f5;
  border-right: 1px solid #ccc;
  padding-top: 20px;
  height: 100%;
}

.search-input {
  width: 80%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
  margin-left: 15px;
  font-size: 16px;
}

.friend-list {
  margin-top: 20px;
  margin-left: 20px;
}


.el-menu-item {
  height: 70px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
}

.avatar {
  margin-right: 10px; /* 头像与文本之间的间距 */
}

.chat-main {
  flex: 1;
  padding: 10px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex; /* 使用 flexbox 布局 */
  justify-content: center; /* 使内容水平居中 */
  align-items: center; /* 垂直居中 */
  padding: 10px; /* 适当的内边距 */
  /* border-bottom: 1px solid #ccc; */ /* 如果需要下边框，可以取消注释这行 */
}


.message-list-container {
  width: 820px;
}

.message-content {
  display: flex;
  background-color: #fff;
  align-items: center;
  margin-bottom: 20px;
}

.friend-message {
  justify-content: flex-start;
}

.friend-message .avatar {
  margin-right: 10px;
}

.text-container {
  max-width: 600px;
  padding: 10px;
  border-radius: 10px;
  background-color: #79BBFF; /* 仅为文本内容添加背景颜色 */
  margin: 0 10px;
}

.text {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.message-list {
  height: 400px;
  width: 820px;
  overflow-y: auto;
  background-color: #fff;
}

.input-wrapper {
  display: flex;
  align-items: center; /* 添加垂直居中 */
  background-color: #fff;
  position: fixed;
  width: 820px;
  padding: 10px;
  z-index: 999;
  bottom: 100px;
  left: 530px;
  right: 30px;
}

.input-message {
  flex: 1; /* 自动扩展以填充空白空间 */
  height: 50px; /* 或者设置一个合适的固定高度 */
  border-radius: 5px;
  padding: 8px; /* 你可以调整这个值来更改内边距 */
  margin-right: 10px; /* 与发送按钮的间距 */
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

.add-friend-dialog .el-input__inner {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

/* .add-friend-dialog .el-button {
  width: 80%;
  margin-top: 10px;
  margin-left: 10%;
} */

.friend-menu-item {
  height: 80px; /* 增大每行好友的高度 */
  padding: 15px 20px; /* 调整内边距 */
  display: flex;
  align-items: left; /* 垂直居中 */
}

.friend-menu-item .avatar {
  margin-right: 20px; /* 增加头像与文本之间的间距 */
}

.friend-menu-item span {
  font-size: 18px; /* 增加文本的字体大小 */
  font-weight: bold; /* 加粗文本 */
}

.my-message {
  display: flex;
  justify-content: flex-end; /* 使自己的消息右对齐 */
  align-items: center;
  border-radius: 10px;
  margin-right: 20px;
}

.my-message .avatar {
  margin-left: 10px; /* 头像与文本之间的间距 */
}

.verification-input {
  /* width: 80%; */
  border-radius: 5px;
  padding: 10px;
  transition: border-color 0.3s;
}

.verification-input:focus {
  outline: none;
  border-color: #409eff;
  background-color: #f0f9ff;
}

.dialog-button {
  width: 40%;
  margin: 5px;
  padding: 10px;
  font-size: 16px;
}

.dialog-button.el-button--primary {
  background-color: #007bff;
  border-color: #007bff;
}
.dialog-button.el-button--primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.dialog-button.el-button--default {
  background-color: #f5f5f5;
  border-color: #dcdcdc;
}

.dialog-button.el-button--default:hover {
  background-color: #e0e0e0;
  border-color: #adadad;
}
</style>