<script lang="ts" setup>
import { ref , onMounted } from 'vue'
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { quickMeetingService  } from '@/api/user'; 

const router = useRouter();
const activeIndex = ref('');
const errorHandler = () => true;
const avatarSrc = ref(''); // 初始头像链接
const username = ref(''); // 用于存储用户名
const signature = ref(''); // 用于存储签名
const popoverVisible = ref(false); 
const activeItem = ref('/main/user');
const logoutDialogVisible = ref(false); // 退出登录弹窗

const retrieveUserProfile = () => {
  const userProfileData = localStorage.getItem('userProfile');
  if (userProfileData) {
    const userProfile = JSON.parse(userProfileData);
    console.log('用户信息:', userProfile);
    avatarSrc.value = userProfile.avatar ? 'data:image/png;base64,' + userProfile.avatar : '';
    username.value = userProfile.username;
    signature.value = userProfile.signature && userProfile.signature.trim() !== '' 
      ? userProfile.signature 
      : '尚未设置个性签名';
} else {
    console.log('没有找到用户信息');
  }
};


// 在组件的 mounted 钩子中调用
onMounted(() => {
  retrieveUserProfile();
});


const goToProfile = () => {
  popoverVisible.value = false;
  activeItem.value = '/main/user'; 
  router.push('/main/user'); // 替换为个人资料的实际路由
};

const logout = () => {
  localStorage.removeItem('userProfile'); // 清除用户数据
  popoverVisible.value = false;
  router.push('/accountlogin'); // 跳转到登录页面
};

const quickMeeting = async() => {
  try {
    const response = await quickMeetingService();
    console.log('快速会议结果:', response);
    if (response && response.data) {
      console.log('快速会议成功：');
      localStorage.setItem('meetingNumber', response.data.meetingNumber);
      localStorage.setItem('meetingPassword', response.data.meetingPassword);
      console.log('会议号:', localStorage.getItem('meetingNumber'));
      console.log('会议密码:', localStorage.getItem('meetingPassword'));
      router.push('/meeting')
      // joinMeeting();

    } else {
      console.error('快速会议失败');
    }
  } catch (error) {
    console.log('快速会议失败:', error);
  }

}

</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="main-header"
    mode="horizontal"
    :ellipsis="false"
    router
  >
    <el-menu-item>
      <img
        style="width: 100px"
        src="@/assets/logo/icon_wemeet.svg"
        alt="Element logo"
      />
    </el-menu-item>
    <el-menu-item index="/main/joinmeeting" style="font-weight: bold;">加入会议</el-menu-item>
    <el-menu-item index="/main/bookmeeting" style="font-weight: bold;">预定会议</el-menu-item>
    <el-menu-item @click="quickMeeting" style="font-weight: bold;">快速会议</el-menu-item>
    
    <el-popover
      placement="top-start"
      trigger="hover"
      width="300px"
      v-model:visible="popoverVisible"
    >
      <template #reference>
        <!-- <el-button class="m-2">Hover to activate</el-button> -->
        <el-avatar :size="40" :src="avatarSrc" @error="errorHandler">
            <img
                src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
            />
        </el-avatar>
      </template>
      <div class="info">
            <el-avatar :size="60" :src="avatarSrc" @error="errorHandler">
                <img
                    src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
                />
            </el-avatar>
            <div class="details">
                <div class="username">{{ username }}</div>
                <div class="signature">{{ signature }}</div>
            </div>
            </div>
            <!-- <el-button  @click="goToProfile"><el-icon><User /></el-icon></el-button>
            <el-button @click="logout"><el-icon><SwitchButton /></el-icon></el-button> -->
            <div class="button-group">
              <el-button type="text" @click="goToProfile" class="icon-button">
                <el-icon><User /></el-icon>
                个人资料
              </el-button>
              
              <el-button type="text" plain @click="logoutDialogVisible = true" class="icon-button">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </div>
    </el-popover>
  </el-menu>
  <el-dialog
    v-model="logoutDialogVisible"
    title="确认退出"
    width="400"
    align-center
  >
    <span>您确定要退出登录吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="logoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="logout">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}

.button-group {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-top: 15px;
}
.icon-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #666;
    font-size: 14px;
}

.icon-button .el-icon {
    margin-bottom: 5px;
    font-size: 20px;
}
</style>