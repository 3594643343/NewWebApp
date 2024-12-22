<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import { createMyGroup, getMyApplyList, getAllFriends, getUserGroups, deleteMyFriend, handleAddFriend, getOneFriend,getOneGroup,handleJoinGroup,dissolveGroup,exitGroup } from '@/api/user';
import emitter from '@/main.js'; // 根据实际路径调整引入
import { ElMessage } from 'element-plus';

//接收websocket消息
emitter.on('messageReceived', async (receivedMessage) => {
  console.log('接收到消息', receivedMessage);
  if (receivedMessage.code === 3) {
    console.log("好友验证消息");
    // 处理好友验证消息，添加到消息列表
    handleMessage(receivedMessage.data, true);
  } else if (receivedMessage.code === 4) {
    console.log("群聊验证消息");
    // 处理群聊验证消息，添加到消息列表
    handleMessage(receivedMessage.data, false);
    console.log("处理群聊验证消息");
  }else if (receivedMessage === 'NEW_FRIEND') {
     await loadFriends();
   }else if (receivedMessage === 'PASS_ADD_GROUP') {
     await loadUserGroups();
   };
});

//重新获取好友消息和群聊信息
const friends = ref([]);
const usergroups= ref([]);
const groupid= ref('');

const loadFriends = async () => {
  // 先清空friends数组
  friends.value = [];
  try {
    const res = await getAllFriends();
    console.log(res);
    friends.value = res.data;
    localStorage.setItem('friends', JSON.stringify(friends.value));
    friendsAndGroups.value = [];
    showfriendData();
    showgroupData();
    console.log("获取好友列表成功:friends",friends.value);
  } catch (error) {
    console.error(error);
  }
};

const loadUserGroups = async () => {
  // 先清空usergroups数组
  usergroups.value = [];
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
    friendsAndGroups.value = [];
    showfriendData();
    showgroupData();
  } catch (error) {
    console.error(error);
  }
};


// 用于存储好友列表和群聊列表
const friendsAndGroups = ref([]);
const showfriendData = () => {
    // 先清空friendsAndGroups数组
    // friendsAndGroups.value = [];
    const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];
    console.log("friendsData", friendsData);
    friendsData.forEach((friend) => {
        let avatarFormat = 'png'; // 先默认设置为png格式，后续根据实际情况修改
        let avatarData = friend.avatar;
        if (avatarData) {
            try {
                // 尝试解析Base64数据看是否能成功（简单验证方式，可优化）
                atob(avatarData);
                // 判断是否以jpg格式标识开头（更严谨的格式判断可优化）
                if (avatarData.startsWith('/9j/')) {
                    avatarFormat = 'jpg';
                }
            } catch (error) {
                console.error('头像数据Base64解析失败：', error);
            }
            const newAvatar = `data:image/${avatarFormat};base64,${avatarData}`;
            const newFriend = {
                avatar: newAvatar,
                friendName: ref(friend.username),
                signature: ref(friend.signature && friend.signature.trim()!== ''? friend.signature : '尚未设置个性签名'),
                friendId: ref(friend.id)
            };
            friendsAndGroups.value.push(newFriend);
        } else {
            const newFriend = {
                avatar: '',
                friendName: ref(friend.username),
                signature: ref(friend.signature && friend.signature.trim()!== ''? friend.signature : '尚未设置个性签名'),
                friendId: ref(friend.id)
            };
            friendsAndGroups.value.push(newFriend);
        }
    });
};

const cleanBase64Data = (base64Data) => {
    // 去除首尾空格
    let cleanedData = base64Data.trim();
    // 更精准地去除类似 "dataimage/jpegbase64"、"dataimage/pngbase64" 等多余前缀干扰，使用非贪婪匹配
    cleanedData = cleanedData.replace(/dataimage\/[a-z]+base64?/gi, '');
    // 去除其他可能存在的非Base64规范字符（除了大小写字母、数字、加号、斜杠、等号之外的字符）
    cleanedData = cleanedData.replace(/[^A-Za-z0-9+/=]/g, '');
    // 检查Base64数据长度是否符合基本要求（这里只是简单校验，Base64编码后的数据长度应该是4的倍数，可根据实际情况调整更合理的长度判断逻辑）
    while (cleanedData.length % 4!== 0) {
        cleanedData += '=';
    }
    return cleanedData;
};

const showgroupData = () => {
    // 先清空friendsAndGroups数组
    // friendsAndGroups.value = [];
    const groupsData = localStorage.getItem('usergroups')? JSON.parse(localStorage.getItem('usergroups')) : [];
    console.log("groupsData", groupsData);
    groupsData.forEach((group) => {
        let avatarFormat = 'png';
        let avatarData = group.groupAvatar;
        if (avatarData) {
            avatarData = cleanBase64Data(avatarData);
            try {
                const decodedData = atob(avatarData);  // 先进行Base64解码
                console.log('解码后的原始数据:', decodedData);  // 打印解码后的数据
                const arrayBuffer = new ArrayBuffer(decodedData.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < decodedData.length; i++) {
                    uint8Array[i] = decodedData.charCodeAt(i);
                }
                const blob = new Blob([uint8Array], { type: `image/${avatarFormat}` });
                const objectURL = URL.createObjectURL(blob);
                // console.log('生成的Object URL:', objectURL);  // 打印生成的可用于显示的URL
                if (avatarData.startsWith('/9j/')) {
                    avatarFormat = 'jpg';
                }
            } catch (error) {
                console.error('头像数据Base64解析失败：', error);
            }
            const newAvatar = `data:image/${avatarFormat};base64,${avatarData}`;
            const newGroup = {
                avatar: newAvatar,
                groupName: group.groupName,
                creatorName: group.creatorName,
                groupId: group.groupId,
                creatorId: group.creatorId
            };
            friendsAndGroups.value.push(newGroup);
            console.log("newGroup", newGroup);
        } else {
            // 处理头像数据为空的情况，代码省略（和之前类似）
        }
    });
};
// 用于存储消息列表（包含好友申请和群聊申请消息）
const messageList = ref([]);
//得到消息发送者的信息
const getsenderInfo = async (id) => {
  try {
    const senderInfo = await getOneFriend({ 
      friendId: id
     });
     if (senderInfo.code) {
       return senderInfo.data;
     }
  }
  catch (error) {
    console.error(error);
    }
};
//获取我的id
const myUserId = localStorage.getItem('userId');
//处理收到的消息
const handleMessage = async(data,isFriendRequest) => {
  try {
    if (data.receiverId === myUserId) {
    const senderInfo = await getsenderInfo(data.senderId);
    console.log("data", data);
    console.log("senderInfo", senderInfo);
    const newMessage = {
      senderId: data.senderId,
      senderName: senderInfo.username,
      senderAvatar: senderInfo.avatar ? `data:image/png;base64,${senderInfo.avatar}` : '',
      messageContent: data.message,
      // time: new Date().toLocaleString(),
      recordId: data.recordId,
      groupId: data.groupId,
    // isFriendRequest: item.groupId ? false : true // 判断是否是自己发出的申请
      isFriendRequest: isFriendRequest, // 判断是否是自己发出的申请
      status: 0 // 0表示未读，1表示已读
    };
  console.log("newMessage", newMessage);
  messageList.value.push(newMessage);
}
  } catch (error) {
    console.error(error);
  }
};
// 加载申请列表消息，从后端获取
const loadmyApplyList = async () => {
  try {
    const res = await getMyApplyList();
    console.log("res", res);
    for (const item of res.data ) {
      console.log("item", item);
      console.log("item.receiverId", item.receiverId);
      console.log("myUserId", myUserId);
      if(parseInt(item.receiverId) === parseInt(myUserId)){
        const senderInfo = await getsenderInfo(item.senderId);
        const newMessage = {
          senderId: item.senderId,
          senderName: senderInfo.username,
          senderAvatar: senderInfo.avatar ? `data:image/png;base64,${senderInfo.avatar}` : '',
          messageContent: item.message,
          // time: new Date().toLocaleString(),
          recordId: item.recordId,
          groupId: item.groupId,
          isFriendRequest: item.groupId ? false : true, // 判断是否是自己发出的申请
          status: item.result // 0表示未读，1表示已读
      };
    // 处理获取到的消息数据，添加到消息列表
        messageList.value.push(newMessage);
        }
    
      }
    console.log("messageList", messageList.value);
  } catch (error) {
    console.error(error);
  }
  };

// 处理好友申请请求（同意或拒绝）
const handleFriendRequest = async (action, data) => {
  console.log("action", action);
  console.log("data", data);
  try {
    const res = await handleAddFriend({
      recordId: data.recordId,
      friendId: data.senderId,
      check: action === 'accept' ? 1 : 0
    });
    console.log("res: ", res);

    if (res.code === 1) {
      //改变status
      messageList.value.forEach((item) => {
        if (item.recordId === data.recordId) {
          item.status = 1;
        }
      });
      if (action === 'accept') {
        handleFriendRequestSuccessT();
      } else {
        handleFriendRequestSuccessF();
      }
      loadFriends(); // 刷新好友列表
    } else {
      console.error('处理好友申请失败:', res.message);
      handleFriendRequestFailure();
    }
  } catch (error) {
    console.error(error);
    handleFriendRequestFailure();
  }
};
const handleFriendRequestSuccessT = () => {
  ElMessage({
    message: '处理好友申请成功,已同意',
    type: 'success',
  })
}
const handleFriendRequestSuccessF = () => {
  ElMessage({
    message: '处理好友申请成功,已拒绝',
    type: 'success',
  })
}
const handleFriendRequestFailure = () => {
  ElMessage({
    message: '处理好友申请失败',
    type: 'error',
  })
}
// 处理群聊申请请求（同意入群或拒绝）
const handleGroupRequest = async (action, data) => {
  console.log("action", action);
  console.log("data", data);
  try {
    const res = await handleJoinGroup({
      recordId: data.recordId,
      groupId: data.groupId,
      userId: data.senderId,
      check: action === 'join' ? 1 : 0
    });

    if (res.code === 1) {
      //改变stauts状态
      console.log("改变stauts状态")
      messageList.value.forEach((item) => {
        if (item.recordId === data.recordId) {
          item.status = 1;
        }
      });
      console.log("改变stauts状态成功")
      if (action === 'join') {
        handleGroupRequestSuccessT();
      } else {
        handleGroupRequestSuccessF();
      }
      loadUserGroups(); // 刷新群组列表
    } else {
      console.error('处理群聊申请失败:', res.message);
      handleGroupRequestFailure();
    }
  } catch (error) {
    console.error(error);
    handleGroupRequestFailure();
  }
};
const handleGroupRequestSuccessT = () => {
  ElMessage({
    message: '处理群聊申请成功，已同意',
    type: 'success',
  })
}
const handleGroupRequestSuccessF = () => {
  ElMessage({
    message: '处理群聊申请成功，已拒绝',
    type: 'success',
  })
}
const handleGroupRequestFailure = () => {
  ElMessage({
    message: '处理群聊申请失败',
    type: 'error',
  })
}

// 初始化当前显示的页面
const currentPage = ref('messages'); 

onMounted(() => {
  currentPage.value ='messages';
  // 加载申请列表消息
  loadmyApplyList();
  showfriendData();
  showgroupData();
});



// 删除好友
const deleteFriend = async (id) => {
  try {
    console.log('删除好友请求参数：', id);
    await deleteMyFriend({
      friendId: id
    });

    // // 删除成功后更新 localStorage
    // const friendsData = localStorage.getItem('friends')? JSON.parse(localStorage.getItem('friends')) : [];
    // const updatedFriendsData = friendsData.filter(friend => friend.id!== id); // 过滤掉被删除的好友
    // localStorage.setItem('friends', JSON.stringify(updatedFriendsData)); // 更新 localStorage
    loadFriends(); // 刷新好友列表
    console.log('删除好友成功');
    deleteFriendSuccess();
  } catch (error) {
    console.error('删除好友失败:', error);
  }
};
const deleteFriendSuccess = () => {
  ElMessage({
    message: '删除好友成功',
    type: 'success',
  })
}

//解散群聊
const deleteGroup = async (id) => {
  try {
    console.log('解散群聊请求参数：', id);
    await dissolveGroup({
      groupId: id
    });

    // 删除成功后更新 localStorage
    const groupsData = localStorage.getItem('usergroups')? JSON.parse(localStorage.getItem('usergroups')) : [];
    const updatedGroupsData = groupsData.filter(group => group.groupId !== id); // 过滤掉被删除的群组
    localStorage.setItem('usergroups', JSON.stringify(updatedGroupsData)); // 更新 localStorag
    console.log('解散群聊成功');
    deleteGroupSuccess();
    loadUserGroups();
  } catch (error) {
    console.error('解散群聊失败:', error);
  }
};
const deleteGroupSuccess = () => {
  ElMessage({
    message: '解散群聊成功',
    type: 'success',
  })
}

//退出群聊
const quitGroup = async (id) => {
  try {
    const res = await exitGroup({
      groupId: id,
    });
    console.log("退出群聊成功", res);
    quitGroupSuccess();
    loadUserGroups();
  } catch (error) {
    console.error("退出群聊失败", error);
  }
  };
  const quitGroupSuccess = () => {
  ElMessage({
    message: '退出群聊成功',
    type: 'success',
  })
}
// 创建群聊表单数据
const groupForm = ref({
  groupName: '',
  avatar: null,
  requireVerification: '否'
});

// 显示我的消息
const showMessages = () => {
  currentPage.value ='messages';
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
  console.log("file", file);
}
const createGroupSuccess = () => {
  ElMessage({
    message: '创建群聊成功',
    type: 'success',
  })
}
// 创建群聊的确认操作
const createGroup = async () => {
  if (!groupForm.value.groupName) {
    ElMessage({
      message: '请填写群名称',
      type: 'warning',
    });
    return;
  }

  // 检查是否上传头像
  if (!groupForm.value.avatar) {
    ElMessage({
      message: '请上传群聊头像',
      type: 'warning',
    });
    return;
  }
  const formData = new FormData();
  formData.append('groupName', groupForm.value.groupName);
  formData.append('groupAvatar', groupForm.value.avatar); // 更改为groupAvatar
  formData.append('needCheck', groupForm.value.requireVerification === '是' ? 1 : 0); // 将字符串转换为整数
  console.log("formData", formData);
  
  try {
    const res = await createMyGroup(formData);
    console.log("创建群聊成功", res);
    createGroupSuccess();
    
    // 读取头像文件并转换为base64
    const avatarFile = groupForm.value.avatar;
    const reader = new FileReader();
    reader.readAsDataURL(avatarFile);
    reader.onload = () => {
    const base64Avatar = reader.result; 
    if (base64Avatar && base64Avatar.startsWith('data:image/')) {
        // 更新localStorage
        const groupsData = localStorage.getItem('usergroups')? JSON.parse(localStorage.getItem('usergroups')) : [];
        const myUserInfo = localStorage.getItem('userProfile')? JSON.parse(localStorage.getItem('userProfile')) : {};
        const newGroup = {
            groupId: res.data.groupId, 
            groupName: groupForm.value.groupName,
            groupAvatar: base64Avatar, 
            creatorName: myUserInfo.username,
        };
        groupsData.push(newGroup);
        // localStorage.setItem('usergroups', JSON.stringify(groupsData)); 
        loadUserGroups(); // 刷新群组列表
        currentPage.value = 'messages'; // 回到消息页面
        resetGroupForm(); // 重置表单数据
        console.log('更新localStorage成功');
    } else {
        console.error('转换得到的Base64头像数据格式不正确');
    }
};
    
  } catch (error) {
    console.error(error);
    console.error('创建群聊失败:', error.response ? error.response.data : error.message);
  }
};

const resetGroupForm = () => {
  groupForm.value = {
    groupName: '',
    avatar: null,
    requireVerification: '否'
  };
};

const selectedFriend = ref({}); // 选中的好友或群聊
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

<template>
  <el-container class="friend-container">
    <el-aside width="25%" class="friend-aside">
      <el-header class="friend-header">
        <h3>好友和群聊</h3>
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
      <el-scrollbar style="height: 550px; padding: 10px;">
        <el-list>
          <el-list-item
            v-for="item in friendsAndGroups"
            :key="item.id"
            class="friend-item"
            @dblclick="showFriendOrGroupDetails(item)"
          >
            <el-avatar :src="item.avatar" style="width: 40px; height: 40px ;" class="avatar" />
            <!-- 根据数据结构判断是用户还是群聊来展示不同内容 -->
            <span v-if="item.friendName">{{ item.friendName }}</span>
            <span v-else-if="item.groupName">{{ item.groupName }}</span>
            <span v-else>{{ '未知名称' }}</span>

            <div v-if="item.friendName" class="friend-actions">
              <el-button type="primary" @click="goToChat">聊天</el-button>
              <el-button type="danger" @click="deleteFriend(item.friendId)">删除好友</el-button>
            </div>
            <div v-else-if="item.groupName" class="friend-actions">
              <el-button type="primary" @click="goToChat">聊天</el-button>
              <div>
                <el-button v-if="parseInt(item.creatorId) === parseInt(myUserId)" type="danger" @click="deleteGroup(item.groupId)">
                    解散群聊
                </el-button>
                <el-button v-else type="danger" @click="quitGroup(item.groupId)">
                    退出群聊
                </el-button>
              </div>
            </div>
          </el-list-item>
        </el-list>
      </el-scrollbar>
    </el-aside>

    <el-main width="70%">
      <div v-if="currentPage ==='messages'" class="message-box">
        <h1 style="font-size: large;">我的消息</h1>
        <el-scrollbar style="height: 400px;"> <!-- 添加滚动条 -->
      <el-list>
        <el-card v-for="msgItem in messageList" :key="msgItem.recordId" style="margin-bottom: 10px;">
          <!-- 根据消息类型（好友或群聊）展示不同内容 -->
          <div v-if="msgItem.isFriendRequest">
            <el-avatar :src="msgItem.senderAvatar" size="large" style="width: 50px;height: 50px;margin-right: 10px;" />
            <br>
            <span class="message-from">发送人：{{ msgItem.senderName + ':' }}</span>
            <br>
            <span class="message-content">验证消息：{{ msgItem.messageContent }}</span>
            <br>
            <div v-if="msgItem.status === 0">
              <el-button @click="handleFriendRequest('accept', msgItem)" type="primary">接受</el-button>
              <el-button @click="handleFriendRequest('reject', msgItem)" type="primary">拒绝</el-button>
            </div>
            <div v-else-if="msgItem.status === 1">
              <span class="message-status" >已同意请求</span>
            </div>
            <div v-else>
              <span class="message-status">已拒绝请求</span>
            </div>
          </div>
          <div v-else>
            <el-avatar :src="msgItem.senderAvatar" size="large" style="width: 50px;height: 50px;margin-right: 10px;" />
            <br>
            <span class="message-from">发送人：{{ msgItem.senderName + ':' }}</span>
            <br>
            <span class="message-content">申请入群：{{ msgItem.groupId }}</span>
            <span class="message-content">群聊验证消息：{{ msgItem.messageContent }}</span>
            <br>
            <div v-if="msgItem.status === 0">
              <el-button @click="handleGroupRequest('join', msgItem)" type="primary">同意入群</el-button>
              <el-button @click="handleGroupRequest('reject', msgItem)" type="primary">拒绝</el-button>
            </div>
            <div v-else-if="msgItem.status === 1">
              <span class="message-status">已同意请求</span>
            </div>
            <div v-else>
              <span class="message-status">已拒绝请求</span>
            </div>
          </div>
        </el-card>
      </el-list>
    </el-scrollbar>
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
            <el-button type="primary" style="width: 20%;" @click="createGroup">确认创建</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="friendgroup-detail-box">
        <div v-if="currentPage === 'friendDetail'">
          <h5 style="margin-bottom: 10px;font-size: large; align-items: center;">用户信息：</h5>
          <el-avatar :src="selectedFriend.avatar" size="large" style="width: 100px;height: 100px;margin-bottom: 10px;" />
          <h4>用户名：{{ selectedFriend.friendName }}</h4>
          <p>ID: {{ selectedFriend.friendId }}</p>
          <p>个性签名: {{ selectedFriend.signature }}</p>
        </div>
        <div v-if="currentPage === 'groupDetail'">
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

<style scoped>
.friend-container {
  display: flex;
}

.friend-aside {
  background-color: #fff;
  margin-top: 30px;
  height: 600px;
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
  margin-left: auto;
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