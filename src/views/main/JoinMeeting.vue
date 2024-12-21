<script lang="ts" setup>
  import { ref} from 'vue'
  import { ElMessage } from 'element-plus';
  import { useRouter } from 'vue-router';
  import { joinMeetingService } from '@/api/user';

  const router = useRouter();

  const joinMeetingForm = ref({
  meetingNumber: '',
  meetingPassword: '',
  })
  
  const rules = {
  meetingNumber: [
    { required: true, message: '请输入会议号', trigger: 'blur' },
    { trigger: 'blur' }
  ],
  meetingPassword: [
    // { required: true, message: '请输入会议密码', trigger: 'blur' },
    // { trigger: 'blur' }
  ],
  }
  
  const handleJoinMeeting = async () => {
  if (!joinMeetingForm.value.meetingNumber.trim()) {
    ElMessage.error('会议号不能为空');
    return; // 防止继续执行
  }
  
  if (!joinMeetingForm.value.meetingPassword.trim()) {
    // ElMessage.error('会议密码不能为空');
    // return; // 防止继续执行
    joinMeetingForm.value.meetingPassword = '0';
  }
  try {
    const response = await joinMeetingService({
      meetingNumber: joinMeetingForm.value.meetingNumber.trim(),
      meetingPassword: joinMeetingForm.value.meetingPassword.trim(),
    });
    console.log('API 响应:', response); // 打印完整 API 响应
    if (response) {
      if (response.code === 1) { // 成功
        console.log('加入会议成功', response.data);
        ElMessage.success('加入会议成功');
        localStorage.setItem('meetingNumber', joinMeetingForm.value.meetingNumber.trim());
        localStorage.setItem('meetingPassword', joinMeetingForm.value.meetingPassword.trim()); // 保存会议号、密码到 localStorage
        router.push('/meeting'); // 跳转到会议页面
      } else {
        const msg = response.msg || '加入会议失败';
        console.error('加入会议失败:', msg);
        ElMessage.error(msg); // 显示返回的错误信息
      }
    } else {
        console.error('加入会议失败，未获得有效响应');
        ElMessage.error('加入会议失败，未获得有效响应'); 
    }
  } catch (error) {
    console.error('加入会议失败:', error); // 捕获并处理错误
    ElMessage.error('会议号或会议密码错误，请重新登录。');
  }
}

</script>
  
<template>
  <!-- <el-container class="page-container"> -->
    <el-card class="page-container">
      <h2 class="header-title">加入会议</h2>
      <div class="join-meeting-container">
        <el-form :model="joinMeetingForm" :rules="rules" :label-position="'left'" label-width="90px" class="join-meeting-form">
          <el-form-item label="会议号" prop="meetingNumber">
            <el-input type="text" v-model="joinMeetingForm.meetingNumber" placeholder="请输入会议号" />
          </el-form-item>

          <el-form-item label="会议密码" prop="meetingPassword">
            <el-input type="meetingPassword" v-model="joinMeetingForm.meetingPassword" placeholder="请输入会议密码" />
          </el-form-item>

            <!-- <el-form-item> -->
              <el-button type="primary" class="join-meeting-button" @click="handleJoinMeeting">加入</el-button>
            <!-- </el-form-item> -->
          </el-form>
        </div>
      </el-card>
    <!-- </el-container> -->
</template>
  
  
<style scoped>
  .page-container {
    max-width: 400px; /* 设置最大宽度 */
    width: 90%; /* 设置宽度自适应 */
    margin: 50px auto; /* 上下间距并居中 */
    padding: 20px;
    border: 2px solid #ccc;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #FFFFFF; /* 卡片背景颜色 */
  }
  
  .header-title {
    margin-bottom: 20px;
    margin-top: 20px;
    font-size: 24px;
    color: #333;
    text-align: center;
  }
  .join-meeting-form {
    margin-bottom: 20px;
  }
  .join-meeting-button {
    display: block;
    width: 80%;
    height: 40px;
    margin: 30px auto 0;
    background-color: #007bff;
    border-color: #007bff;
    color: #fff;
    font-size: 16px;
    padding: 10px;
    border-radius: 5px;
  }
  
  .join-meeting-button:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }
  
  .login-link {
    margin-top: auto;
    text-align: right;
    font-size: 14px;
    color: #333;
  }
  
  
</style>