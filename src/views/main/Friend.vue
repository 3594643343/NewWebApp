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
            v-for="friend in friends" 
            :key="friend.id" 
            class="friend-item"
          >
            <el-avatar :src="friend.avatar" class="friend-avatar" size="large" />
            <span class="friend-name">{{ friend.name }}</span>
            <div class="friend-actions">
              <el-button type="primary" @click="goToChat">聊天</el-button>
              <el-button type="primary" @click="deleteFriend(friend.id)">删除好友</el-button>
            </div>
          </el-list-item>
        </el-list>
      </el-scrollbar>
    </el-aside>

    <el-main width="70%">
      <div v-if="currentPage === 'messages'" class="message-box">
        <h1 style="font-size: large;">我的消息</h1>
        <el-list>
          <el-card v-for="item in message" :key="item.id" style="margin-bottom: 10px;">
            <div>
              <span class="message-from">发送人：{{ item.from + ':' }}</span>
              <br>
              <span class="message-content">验证消息：{{ item.content }}</span>
              <br>
              <span class="message-time">时间：{{ item.time }}</span>
            </div>
        <el-button @click="acceptRequest" type="primary">同意</el-button>
        <el-button @click="rejectRequest" type="primary">拒绝</el-button>
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
              action=""
              :show-file-list="false"
              @change="handleAvatarChange"
            >
              <el-button size="small" type="primary">选择头像</el-button>
              <!-- <img v-if="groupForm.avatar" :src="groupForm.avatar" class="avatar-preview" /> -->
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
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import { createMyGroup,getMyApplyList,getAllFriends,handleAddFriend } from '@/api/user';

// 友信息示例
const friends = ref([
  { id: 1, name: 'Alice', avatar: 'path/to/alice.jpg', signature: 'A lovely friend' },
  { id: 2, name: 'Bob', avatar: 'path/to/bob.jpg', signature: 'Charming personality' },
  { id: 3, name: 'Charlie', avatar: 'path/to/charlie.jpg', signature: 'Always smiling' },
  { id: 4, name: 'David', avatar: 'path/to/david.jpg', signature: 'Tech enthusiast' },
]);

const message = ref([]);

const mygetmessage = ref([]);



const currentPage = ref(''); // 当前显示的页面
onMounted(() => {
  currentPage.value = 'friends';
  // loadFriends();
  loadmyApplyList();
});

const loadmyApplyList = async () => {
  try {
    const res = await getMyApplyList();
    console.log(res);
    message.value = res.data;
    console.log("message",message.value);
  } catch (error) {
    console.error(error);
  }
};

const pendingRequest = ref(false); // 是否有待处理的请求

// 加载好友列表
const loadFriends = async () => {
  try {
    const res = await getAllFriends();
    console.log(res);
    friends.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

// // 删除好友
// const deleteFriend = async (id) => {
//   try {
//     await deleteMyFriend(id);
//     console.log('删除好友成功');
//     loadFriends();
//   } catch (error) {
//     console.error('删除好友失败:', error);
//   }
// };

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
    groupForm.value.avatar = file.raw; // 保持为 File 对象以便上传
  };
};

// 创建群聊的确认操作
const createGroup = async () => {
  const formData = new FormData();
  formData.append('groupName', groupForm.value.groupName);
  formData.append('needCheck', groupForm.value.requireVerification === '是' ? 1 : 0); // 内容应为整数
  const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg'; // 限制选择的文件类型为jpg图片
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            formData.append('avatar', file);
            try {
                await createMyGroup(formData); // 确保调用时为 FormData
                 console.log('创建群聊成功');
                router.push('/main/group'); // 跳转到群聊页面
                } catch (error) {
                  console.error('创建群聊失败:', error);
                }
             }
    };
}

// 处理请求
const acceptRequest = () => {
  pendingRequest.value = false;
};

const rejectRequest = () => {
  pendingRequest.value = false;
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
</style>
