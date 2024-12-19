<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateUserProfileApi, updateUserPasswordApi, updateUserAvatarApi,updateUserNeedCheckApi  } from '@/api/user';
// import ProfileChange from '@/components/usersetting/ProfileChange.vue';

const errorHandler = () => true;
const avatarSrc = ref(''); // 初始头像链接
const username = ref(''); // 用于存储用户名
const signature = ref(''); // 用于存储签名
const needCheck = ref(1);
const radio = ref();
const userId = ref(localStorage.getItem('userId') || ''); // 用于存储用户 ID

const dialogChangeProfileVisible = ref(false); // 控制修改个人信息弹窗的显示
const dialogChangePasswordVisible = ref(false);
const showEditText = ref(false); // 用于控制是否显示“修改头像”
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
    needCheck.value = userProfile.needCheck !== undefined ? userProfile.needCheck : 0;
    radio.value = userProfile.needCheck !== undefined ? userProfile.needCheck : 0;
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
    return;
  }
  
  if (!profileForm.newSignature.trim()) {
    ElMessage.error('签名不能为空');
    return;
  }

  // 验证个性签名不得超过50个字符
  if (profileForm.newSignature.trim().length > 50) {
    ElMessage.error('个性签名不得超过50个字符');
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
        // 更新本地状态
        username.value = profileForm.newUsername.trim();
        signature.value = profileForm.newSignature.trim();
        ElMessage.success('个人信息修改成功');
        // 更新 localStorage 中的 userProfile
        const userProfileData = localStorage.getItem('userProfile');
        if (userProfileData) {
          const userProfile = JSON.parse(userProfileData);
          userProfile.username = username.value; // 更新用户名
          userProfile.signature = signature.value; // 更新签名
          localStorage.setItem('userProfile', JSON.stringify(userProfile)); // 保存更新后的数据
        }
        dialogChangeProfileVisible.value = false;
        location.reload(); // 页面刷新
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

// 上传头像的函数
const uploadAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg'; // 限制选择的文件类型为jpg图片
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const response = await updateUserAvatarApi(formData);
                if (response && response.code === 1) {
                  console.log('头像修改成功:', response);
                  ElMessage.success('头像修改成功');
                  // 将文件转换为 Base64 字符串
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const base64String = reader.result;
                    // 更新 avatarSrc 以显示新头像
                    avatarSrc.value = base64String;

                    // 更新 localStorage 中的 userProfile
                    const userProfileData = localStorage.getItem('userProfile');
                    if (userProfileData) {
                      const userProfile = JSON.parse(userProfileData);
                      userProfile.avatar = base64String.split(',')[1]; // 仅保留 Base64 字符串部分
                      localStorage.setItem('userProfile', JSON.stringify(userProfile));
                    }

                    // 改变 avatarSrc 变量以便界面立即显示新头像
                    avatarSrc.value = base64String;
                    location.reload(); // 页面刷新
                  };
                } else {
                    ElMessage.error('头像修改失败1');
                }
            } catch (error) {
              console.error('头像修改失败:', error.response ? error.response.data : error.message);
              ElMessage.error('头像修改失败');
            }
        }
    };
    input.click(); // 模拟点击，打开文件选择对话框
};

// 修改密码操作
const changePassword = async () => {
    console.log('修改密码:', {
      oldPassword: form.oldPassword.trim(),
      newPassword: form.newPassword.trim(),
      confirmPassword: form.confirmPassword.trim(),
    });
  if (!form.oldPassword.trim()) {
    ElMessage.error('旧密码不能为空');
    return; // 防止继续执行
  }
  
  if (!form.newPassword.trim()) {
    ElMessage.error('新密码不能为空');
    return; // 防止继续执行
  }
  // 确保新密码和旧密码密码不同
  if (form.newPassword.trim() == form.oldPassword.trim()) {
    ElMessage.error('新密码不能与旧密码相同');
    return;
  }
  // 确保新密码和确认密码匹配
  if (form.newPassword.trim() !== form.confirmPassword.trim()) {
    ElMessage.error('新密码和确认密码不匹配');
    return;
  }


  try {
    console.log('修改密码2:', {
      oldPassword: form.oldPassword.trim(),
      newPassword: form.newPassword.trim(),
      confirmPassword: form.confirmPassword.trim(),
    });
    const response = await updateUserPasswordApi({
      oldPassword: form.oldPassword,// 旧密码
      newPassword: form.newPassword,// 新密码
      confirmPassword: form.confirmPassword // 确认密码
    });

    if (response) {
      if (response.code === 1) { // 修改成功
        console.log('密码修改成功', response.data);
        ElMessage.success('密码修改成功');
        dialogChangePasswordVisible.value = false; // 关闭修改密码的弹窗
      } else {
        const msg = response.msg || '修改密码失败';
        ElMessage.error(msg); // 显示返回的错误信息
      }
    } else {
      ElMessage.error('修改密码失败，未获得有效响应');
    }
  } catch (error) {
    const errorMsg = error.response ? error.response.msg || error.message : '修改密码失败';
    ElMessage.error(errorMsg); // 显示错误信息
  }
};

// 修改是否需要验证
const changeNeedCheck = async (value) => {
  try {
    const response = await updateUserNeedCheckApi({ needCheck: value });
    if (response && response.code === 1) {
      console.log('好友验证设置更新成功', response.data);
      ElMessage.success('好友验证设置更新成功');
      // 更新本地状态
      needCheck.value = value;
      radio.value = value;
      // 更新 localStorage 中的 userProfile
      const userProfileData = localStorage.getItem('userProfile');
      if (userProfileData) {
        const userProfile = JSON.parse(userProfileData);
        userProfile.needCheck = value;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
    } else {
      const msg = response.msg || '好友验证设置更新失败';
      console.error('好友验证设置更新失败:', msg);
      ElMessage.error(msg); // 显示返回的错误信息
    }
  } catch (error) {
    const errorMsg = error.response ? error.response.msg || error.message : '更新好友验证设置失败';
    console.error('更新好友验证设置失败:', errorMsg);
    ElMessage.error(errorMsg); // 显示错误信息
  }
};
</script>

<template>
    <div class="user">
      <br>
        <h2>个人资料</h2>
        <br>
        <el-card>
            <template #header>
            <div class="card-header">
                <span>基本信息</span>
            </div>
            </template>
            <div class="info">
            <el-avatar :size="60" @error="errorHandler" 
              @mouseover="showEditText = true" 
              @mouseleave="showEditText = false"
              @click="showEditText ? uploadAvatar() : null">
              <template v-if="showEditText">
                  <span class="avatar-text">修改头像</span>
              </template>
              <template v-else>
                  <img :src="avatarSrc" />
              </template>
            </el-avatar>
            <div class="details">
                <div class="username">{{ username }}</div>
                <div class="signature">{{ signature }}</div>
            </div>
            </div>
            <br>
            <div>ID: {{ userId }}</div><br>
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
            <div class="security-info-part">
                <p class="security-section-title">好友验证</p>
                <el-radio-group v-model="radio" @change="changeNeedCheck">
                  <el-radio :value="0">无需验证</el-radio>
                  <el-radio :value="1">需要验证</el-radio>
                </el-radio-group>
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

.avatar-text {
    font-size: 18px; /* 根据需要调整字体大小 */
    color: #ffffff; /* 文字颜色 */
    background-color: rgba(0, 0, 0, 0.7); /* 半透明背景 */
    padding: 5px; /* 内边距 */
    border-radius: 4px; /* 圆角 */
}

</style>