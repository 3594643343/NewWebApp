<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateUserProfileApi } from '@/api/user';
// import ProfileChange from '@/components/usersetting/ProfileChange.vue';

const errorHandler = () => true;
const avatarSrc = ref(''); // 初始头像链接
const username = ref(''); // 用于存储用户名
const signature = ref(''); // 用于存储签名

const dialogChangeProfileVisible = ref(false); // 控制修改个人信息弹窗的显示
const dialogChangePasswordVisible = ref(false)
const formLabelWidth = '140px'
const profileForm = reactive({
    newUsername: '',
    newSignature: '',
});
const form = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
})

const editProfile = () => {
    profileForm.newUsername = username.value; // 设置当前用户名
    profileForm.newSignature = signature.value; // 设置当前签名
    dialogChangeProfileVisible.value = true;
};

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

const changeProfile = async () => {
  // 验证用户名不能为空
  if (!profileForm.newUsername.trim()) {
    ElMessage.error('昵称不能为空');
    return; // 防止继续执行
  }
  
  if (!profileForm.newSignature.trim()) {
    ElMessage.error('签名不能为空');
    return; // 防止继续执行
  }
  
  console.log('更新用户信息:', {
    userName: profileForm.newUsername.trim(),
    signature: profileForm.newSignature.trim(),
  });

  try {
    const response = await updateUserProfileApi({
      userName: profileForm.newUsername.trim(),
      signature: profileForm.newSignature.trim(),
    });

    console.log('API 响应:', response); // 打印完整 API 响应
    
    if (response) {
      if (response.code === 1) { // 修改成功
        console.log('用户信息更新成功', response.data);
    //     // 更新本地状态
        username.value = profileForm.newUsername.trim();
        signature.value = profileForm.newSignature.trim();
        ElMessage.success('个人信息修改成功');
        dialogChangeProfileVisible.value = false;
      } else {
        const msg = response.msg || '用户信息更新失败';
        console.error('用户信息更新失败:', msg);
        ElMessage.error(msg); // 显示返回的错误信息
      }
    } else {
        console.error('用户信息更新失败，未获得有效响应');
        ElMessage.error('用户信息更新失败，未获得有效响应'); 
    }
  } catch (error) {
    const errorMsg = error.response ? error.response.msg || error.message : '更新用户信息失败';
    console.error('更新用户信息失败:', errorMsg);
    ElMessage.error(errorMsg); // 显示错误信息
  }
};



// 修改密码操作
const changePassword = async () => {
  // 确保新密码和确认密码匹配
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.error('新密码和确认密码不匹配');
    return;
  }

  // 此处可以集成 API 调用进行密码更改
  // 例如: await updateUserPasswordApi(form.oldPassword, form.newPassword);

  ElMessage.success('密码修改成功');
  form.oldPassword = '';
  form.newPassword = '';
  form.confirmPassword = '';
  dialogChangePasswordVisible.value = false; // 关闭修改密码的弹窗
};

</script>

<template>
    <div class="user">
        <h2>个人资料</h2>
        <el-card>
            <template #header>
            <div class="card-header">
                <span>基本信息</span>
            </div>
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
            <br>
            <div class="edit-button-container">
                <el-button plain type="text" class="edit-button" @click="editProfile">
                    <ElIcon>
                        <Edit />
                    </ElIcon>
                    修改个人信息
                </el-button>
            </div>
        </el-card>
        <br />
        <el-card>
            <template #header>
            <div class="card-header">
                <span>账号安全</span>
            </div>
            </template>
            <div class="security-info-part">
                <p class="security-section-title">账号密码</p>
                <span class="security-section-text">已设置</span>
                <div class="edit-button-container">
                <el-button plain type="text" class="change-password-button" @click="dialogChangePasswordVisible = true">
                    <ElIcon>
                        <Edit />
                    </ElIcon>
                    修改密码
                </el-button>
            </div>
            </div>
        </el-card>
        <!-- 修改个人信息弹窗 -->
        <el-dialog v-model="dialogChangeProfileVisible" title="修改个人信息" width="500">
            <el-form :model="profileForm" :label-position="'left'" style="margin: 50px;">
                <el-form-item label="用户名" :label-width="formLabelWidth">
                    <el-input v-model="profileForm.newUsername" placeholder="请输入新用户名" />
                </el-form-item>
                <el-form-item label="签名" :label-width="formLabelWidth">
                    <el-input v-model="profileForm.newSignature" placeholder="请输入新签名" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogChangeProfileVisible = false">取消</el-button>
                <el-button type="primary" @click="changeProfile">
                    确认
                </el-button>
            </template>
        </el-dialog>

        <!-- 修改密码弹窗 -->
        <el-dialog v-model="dialogChangePasswordVisible" title="修改密码" width="500">
            <el-form :model="form" :label-position="'left'" style="margin: 50px;">
                <el-form-item label="旧密码" :label-width="formLabelWidth">
                    <el-input type="password" v-model="form.oldPassword" placeholder="请输入旧密码" autocomplete="off" />
                </el-form-item>
                <el-form-item label="新密码" :label-width="formLabelWidth">
                    <el-input type="password" v-model="form.newPassword" placeholder="请输入新密码" autocomplete="off" />
                </el-form-item>
                <el-form-item label="确认新密码" :label-width="formLabelWidth">
                    <el-input type="password" v-model="form.confirmPassword" placeholder="请再次输入新密码" autocomplete="off" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogChangePasswordVisible = false">取消</el-button>
                <el-button type="primary" @click="changePassword">
                    确认
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style>
.info {
    display: flex;
    align-items: center; /* 垂直居中对齐 */
}

.details {
    margin-left: 16px; /* 名字与头像之间的间距 */
}

.username {
    font-size: 1.2rem; /* 字体大小 */
    font-weight: bold; /* 加粗 */
}

.signature {
    margin-top: 4px; /* 系统会议号的上图间距 */
    color: #666; /* 颜色 */
}

.security-info-part {
    display: flex; /* 使用 Flexbox 布局 */
    align-items: center; /* 垂直居中对齐 */
}

.security-section-title {
    margin-right: 20px; /* 标题的右边距 */
    color: #666; /* 颜色 */
}

.security-section-text {
    margin-right: 16px; /* 状态文本的右边距 */
    
}

.tea-btn--link {
    background: none; /* 去掉按钮背景 */
    border: none; /* 去掉按钮边框 */
    color: #007bff; /* 设置文本颜色 */
    cursor: pointer; /* 鼠标悬停时变为手形光标 */
    text-decoration: underline; /* 下划线样式 */
}

/* 鼠标悬停时按钮样式变化 */
.tea-btn--link:hover {
    color: #0056b3; /* 鼠标悬停时的颜色 */
}

</style>