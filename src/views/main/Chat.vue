<script setup>
import { ref, onMounted,onBeforeUnmount,nextTick } from 'vue';
import router from '@/router';
import { searchFriends, applyAddFriend, searchGroup, getChatRecord,getGroupChatRecord,getGroupMembers,applyJoinGroup,handleJoinGroup } from '@/api/user';
import { initWschat,getWschat,closewschat } from '@/api/user';
import emitter from '@/main.js'; // 根据实际路径调整引入
import { debounce } from 'lodash';




// emitter.emit('messageReceived', {}); // 初始化时先触发一次，可用于加载历史消息等情况（可选）
const wschatifFriendOrGroup = ref(true); //发消息的是好友还是群聊,true为好友，false为群聊

emitter.on('messageReceived', async (receivedMessage) => {
  console.log('接收到消息', receivedMessage);
   // 判断是好友还是群聊
   if(receivedMessage.code === 1){
    wschatifFriendOrGroup.value = true; //发消息的是好友
   }else if(receivedMessage.code === 2){
    wschatifFriendOrGroup.value = false; //发消息的是群聊
   }
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

// 好友列表数据（示例数据，可替换为真实数据获取）
const friendsAndGroups = ref([]);
const myUserInfo = localStorage.getItem('userProfile')? JSON.parse(localStorage.getItem('userProfile')) : {};
const myUserAvatar = myUserInfo.avatar ? `data:image/png;base64,${myUserInfo.avatar}` : '';

// 友信息示例
// const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];

const showfriendData = () => {
  const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];
  console.log("friendsData", friendsData);
  friendsData.forEach((friend) => {
    const newFriend = {
      friendId: friend.id,
      avatar: ref(friend.avatar? 'data:image/png;base64,' + friend.avatar : ''),
      name: ref(friend.username),
      signature: ref(friend.signature && friend.signature.trim()!== ''? friend.signature : '尚未设置个性签名')
    };
    friendsAndGroups.value.push(newFriend);
  });
  return friendsData;
};

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

onMounted(() => {
  startCacheClearTimer(); // 启动缓存清理定时器
  showfriendData();
  showgroupData();
  initWschat(); // 初始化 WebSocket
  if (friendsAndGroups.value.length > 0) {
    selectedFriend.value = friendsAndGroups.value[0]; // 设置默认选择的好友
  }
  initMessageList();
});



const selectedFriend = ref({}); // 选中的好友
const searchFriendId = ref('');
const searchedFriend = ref(friendsAndGroups.value); // 初始显示所有好友信息
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
  initMessageList();
  foruserProfileDetailsVisible.value = false; // 隐藏搜索中空白页
  newMessage.value = ''; // 清空输入消息
  console.log('2:', userProfileDetailsVisible.value, foruserProfileDetailsVisible.value,ifFriendOrGroup.value);
};



const searchFriend = async () => {
  if (!searchFriendId.value.trim()) {
    // 如果搜索框为空，显示所有好友
    searchedFriend.value = friendsAndGroups.value;
    selectedFriend.value = friendsAndGroups.value[0];
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
          name: response.data.friendName,
          friendId: response.data.friendId
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

const addGroup = async() => {
  try {
    const response = await applyJoinGroup({
      groupId: parseInt(selectedFriend.value.groupId),
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送加入群聊请求成功', response.data);
      // 发送成功后，关闭用户详情弹窗
      addFriendDialogVisible.value = false;
    } else {
      console.error('发送加入群聊请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送加入群聊请求失败:', error);
  }
  
};

const sendAddFriendRequest = async () => {
  try {
    console.log('发送申请群聊请求:', selectedFriend.value.groupId, verificationMessage.value)
    const response = await applyJoinGroup({
      groupId: selectedFriend.value.groupId,
      checkWords: verificationMessage.value
    });

    if (response) {
      console.log('发送申请入群请求成功', response);
      // 发送成功后，关闭用户详情弹窗
      addFriendDialogVisible.value = false;
    } else {
      console.error('发送申请入群请求失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('发送申请入群请求失败:', error);
  }
};

const myUserId = localStorage.getItem('userId'); // 获取当前用户 ID
const chatRecords = ref([]); // 聊天记录
// 假设这是您的用户 ID

const messageList = ref([]); // 好友聊天记录
const groupMessageList = ref([]); // 群聊聊天记录

// const initMessageList = async () => {
//   console.log('初始化聊天记录:', selectedFriend.value.friendId);
//   console.log('初始化聊天记录2:', selectedFriend.value);
//   if (selectedFriend.value.friendId) {
//   try {
//     const response = await getChatRecord({
//       friendId: selectedFriend.value.friendId,
//     });
//     if (response && response.data) {
//       console.log('获取聊天记录成功', response.data);
//       chatRecords.value = response.data;
//       messageList.value = response.data.map((item) => {
//         const newItem = {
//           id: item.speakerId,
//           speaker: item.speakerId === parseInt(myUserId) ? 'me' : 'friend',
//           text: item.text,
//           time: item.time,
//         };
//         return newItem;
//       });
//       messageList.value.sort((a, b) => new Date(a.time) - new Date(b.time)); // 按时间排序
//       console.log('初始化聊天记录3:', messageList.value);
//       scrollToBottom(); // 滚动到底部
//     } else {
//       console.error('获取聊天记录失败，返回数据格式不正确');
//     }
//   } catch (error) {
//     console.error('获取聊天记录失败:', error);
//   }
//   } else {
//     try {
//       const response = await getGroupChatRecord({
//         groupId: selectedFriend.value.groupId,
//       });
//       if (response && response.data) {
//         console.log('获取群聊记录成功', response.data);
//         chatRecords.value = response.data;
//         const items = response.data.map(async (item) => {
//         const memberInfo = await getGroupmemberInfo(selectedFriend.value.groupId);
//         const newItem = {
//           id: item.speakerId,
//           text: item.text,
//           time: item.time,
//           speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
//           speakername: memberInfo.find(member => member.userId === item.speakerId).userName,
//           speakerAvatar: memberInfo.find(member => member.userId === item.speakerId).userAvatar ? `data:image/png;base64,${memberInfo.find(member => member.userId === item.speakerId).userAvatar}` : ''
//         };
//         return newItem;
//       });
//         groupMessageList.value = await Promise.all(items);
//         groupMessageList.value.sort((a, b) => new Date(a.time) - new Date(b.time)); // 按时间排序
//         console.log('初始化群聊记录3:', groupMessageList.value);
//         console.log('初始化群聊记录4:', messageList.value)
//         scrollToBottom(); // 滚动到底部
//       } else {
//         console.error('获取群聊记录失败，返回数据格式不正确');
//       }
//     } catch (error) {
//       console.error('获取群聊记录失败:', error);
//     }
//   }
// };

let cachedGroupChatRecords = {};
let cacheClearTimer;

const startCacheClearTimer = () => {
    cacheClearTimer = setInterval(() => {
        cachedGroupChatRecords = {}; // 清除缓存数据
    }, 1 * 60 * 1000); // 每5分钟清除一次缓存，单位毫秒
};


// const initMessageList = async () => {
//     console.log('初始化聊天记录:', selectedFriend.value.friendId);
//     console.log('初始化聊天记录2:', selectedFriend.value);
//     if (selectedFriend.value.friendId) {
//         // 好友聊天记录获取逻辑不变，省略部分代码...
//         try {
//             const response = await getChatRecord({
//                 friendId: selectedFriend.value.friendId,
//             });
//             if (response && response.data) {
//                 console.log('获取聊天记录成功', response.data);
//                 chatRecords.value = response.data;
//                 messageList.value = response.data.map((item) => {
//                     const newItem = {
//                         id: item.speakerId,
//                         speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
//                         text: item.text,
//                         time: item.time,
//                     };
//                     return newItem;
//                 });
//                 messageList.value.sort((a, b) => new Date(a.time) - new Date(b.time));
//                 console.log('初始化聊天记录3:', messageList.value);
//                 scrollToBottom(); // 滚动到底部
//             } else {
//                 console.error('获取聊天记录失败，返回数据格式不正确');
//             }
//         } catch (error) {
//             console.error('获取聊天记录失败:', error);
//         }
//     } else {
//         const groupId = selectedFriend.value.groupId;
//         console.log('初始化群聊记录:', groupId);
//         console.log('是否有缓存数据:', cachedGroupChatRecords[groupId]);
//         console.log('缓存数据:', cachedGroupChatRecords);
//         if (cachedGroupChatRecords[groupId]) {
//             chatRecords.value = cachedGroupChatRecords[groupId];
//             // 后续根据已有的记录数据构建聊天记录列表等操作，避免再次发起请求
//             console.log('使用缓存数据:', chatRecords.value);
//             const items = chatRecords.value.map(async (item) => {
//                 const memberInfo = await getGroupmemberInfo(groupId);
//                 const newItem = {
//                     id: item.speakerId,
//                     text: item.text,
//                     time: item.time,
//                     speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
//                     speakername: memberInfo.find(member => member.userId === item.speakerId).userName,
//                     speakerAvatar: memberInfo.find(member => member.userId === item.speakerId).userAvatar? `data:image/png;base64,${memberInfo.find(member => member.userId === item.speakerId).userAvatar}` : ''
//                 };
//                 return newItem;
//             });
//             groupMessageList.value = await Promise.all(items);
//             groupMessageList.value.sort((a, b) => new Date(a.time) - new Date(b.time));
//             console.log('初始化群聊记录3:', groupMessageList.value);
//             console.log('初始化群聊记录4:', messageList.value);
//             scrollToBottom();
//             return;
//         }
//         try {
//             const response = await getGroupChatRecord({
//                 groupId: groupId,
//             });
//             if (response && response.data) {
//                 console.log('获取群聊记录成功', response.data);
//                 chatRecords.value = response.data;
//                 cachedGroupChatRecords[groupId] = response.data; // 缓存记录数据
//                 console.log('缓存群聊记录:', cachedGroupChatRecords);
//                 const items = response.data.map(async (item) => {
//                     const memberInfo = await getGroupmemberInfo(groupId);
//                     const newItem = {
//                         id: item.speakerId,
//                         text: item.text,
//                         time: item.time,
//                         speaker: item.speakerId === parseInt(myUserId)? 'me' : 'friend',
//                         speakername: memberInfo.find(member => member.userId === item.speakerId).userName,
//                         speakerAvatar: memberInfo.find(member => member.userId === item.speakerId).userAvatar? `data:image/png;base64,${memberInfo.find(member => member.userId === item.speakerId).userAvatar}` : ''
//                     };
//                     return newItem;
//                 });
//                 groupMessageList.value = await Promise.all(items);
//                 groupMessageList.value.sort((a, b) => new Date(a.time) - new Date(b.time));
//                 console.log('初始化群聊记录3:', groupMessageList.value);
//                 console.log('初始化群聊记录4:', messageList.value);
//                 scrollToBottom(); // 滚动到底部
//             } else {
//                 console.error('获取群聊记录失败，返回数据格式不正确');
//             }
//         } catch (error) {
//             console.error('获取群聊记录失败:', error);
//         }
//     }
// };
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

const messages = ref([]); // 聊天记录

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
    content: newMessageContent,
  };
  console.log('发送消息message:', message);
  
  const wschat = getWschat(); // 获取 WebSocket 实例
  if (wschat && wschat.readyState === WebSocket.OPEN) {
    wschat.send(JSON.stringify(message)); // 发送消息
    // messages.value.push(message); // 更新聊天记录
    await updateChatRecords(); // 更新聊天记录
    
    newMessage.value = ''; // 清空输入框
  } else {
    console.error('WebSocket 未连接或处于关闭状态');
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
              :key="item.time"
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
            <el-button type="primary" @click="addGroup;addFriendDialogVisible=true">申请入群</el-button>
          </div>
          <div v-else class="chat-header">
            <el-header class="chat-header">
              <h3 v-if="selectedFriend.name">与 {{ selectedFriend.name }} 的聊天</h3>
              <h3 v-else>在 {{ selectedFriend.groupName }} 中的聊天</h3>
            </el-header>
            <el-main>
              <div v-if="selectedFriend.name" class="message-list" ref="messageListElement">
                <div
                  v-for="msg in messageList"
                  :class="['message', msg.speaker === 'me' ? 'my-message' : 'friend-message']"
                >
                  <div v-if="msg.speaker === 'friend'">
                    <el-avatar :src="selectedFriend.avatar" size="medium" class="avatar" />
                    <span class="text">{{ msg.text }}</span>
                  </div>
                  <div v-else>
                    <span class="text">{{ msg.text }}</span>
                    <el-avatar :src="myUserAvatar" size="medium" class="avatar" />
                  </div>
                </div>
              </div>
              <div v-else class="message-list" ref="messageListElement">
                <div
                  v-for="msg in groupMessageList"
                  :class="['message', msg.speaker === 'me' ? 'my-message' : 'friend-message']"
                >
                  <div v-if="msg.speaker === 'friend'">
                    <span class="name">{{ msg.speakername }}</span>
                    <el-avatar :src="msg.speakerAvatar" size="medium" class="avatar" />
                    <span class="text">{{ msg.text }}</span>
                    
                  </div>
                  <div v-else>
                    <span class="text">{{ msg.text }}</span>
                    <el-avatar :src="myUserAvatar" size="medium" class="avatar" />
                    <span style="margin-top: 10px;font-size: smaller;">{{ msg.speakername }}</span>
                  </div>
                </div>
              </div>
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
  /* flex: 1;
  padding: 10px; */
}

.message-list {
  height: 300px;
  overflow-y: auto;
}

.friend-list {
  margin-top: 10px;
  margin-left: 70px;
}

.my-message {
  display: flex;
  justify-content: flex-end; /* 使自己的消息右对齐 */
  align-items: center; /* 使用 center 使头像与消息垂直居中 */
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-right: 20px; /* 添加右边距，使消息距离右边框远一些 */
}

.my-message .avatar {
  margin-left: 10px; /* 头像与文本之间的间距 */
  /* margin-right: 10px; 不需要左边距和右边距 */
}

.friend-message {
  display: flex;
  justify-content: flex-start; /* 使朋友的消息左对齐 */
  align-items: center; /* 使用 center 使头像与消息垂直居中 */
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-left: 20px; /* 添加左边距，使消息距离左边框远一些 */
}

.friend-message .avatar {
  margin-right: 10px; /* 头像与文本之间的间距 */
  /* margin-left: 10px; 不需要左边距 */
}






/* .input-wrapper {
  display: flex;
  justify-content: baseline;
  align-items: center;
  background-color: #fff;
  border-radius: 1px;
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
} */

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