<template>
    <div class="meeting-footer">
      <el-button type="primary" @click="InviteVisible = true">邀请</el-button>
      <el-button type="primary" @click="manageMembers">成员管理</el-button>
      <el-button type="primary" @click="convertSpeech">语音转文字</el-button>
      <el-button type="primary" @click="translate">翻译</el-button>
      <!-- 添加文件输入 -->
      <input type="file" @change="handleFileUpload" style="display:none" ref="fileInput" />
      <el-button type="primary" @click="triggerFileInput">文件上传</el-button>
      <el-button type="primary" @click="settings">设置</el-button>
      <el-button type="danger" @click="exitMeeting">退出会议</el-button>
  
      <el-dialog v-model="InviteVisible" title="邀请" width="300" center>
        <div>
          <p><strong>会议号:</strong> {{ meetingNumber }}</p>
          <p><strong>会议密码:</strong> {{ meetingPassword }}</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="InviteVisible = false">取消</el-button>
            <el-button type="primary" @click="copyToClipboard">复制</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { uploadFile } from '@/api/user'; // 导入上传文件的接口
  
  const InviteVisible = ref(false);
  const meetingNumber = localStorage.getItem('meetingNumber');
  const meetingPassword = localStorage.getItem('meetingPassword');
  const fileInput = ref(null); // 声明和初始化 fileInput 引用
  
  const copyToClipboard = () => {
    const textToCopy = `会议号: ${meetingNumber}, 会议密码: ${meetingPassword}`; // 要复制的文本
    navigator.clipboard.writeText(textToCopy).then(() => {
      ElMessage.success('会议号与密码已复制到剪贴板！'); // 复制成功的反馈
    }).catch(err => {
      ElMessage.error('复制失败，请重试。'); // 复制失败的反馈
    });
  };
  
  // 选择文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // 获取选择的文件
    if (file) {
      try {
        const response = await uploadFile(meetingNumber, file); // 调用上传文件的接口
        console.log('上传成功:', response);
        ElMessage.success('文件上传成功'); // 上传成功的反馈
      } catch (error) {
        console.error('上传文件失败:', error.response ? error.response.data : error.message);
        ElMessage.error('文件上传失败'); // 上传失败的反馈
      }
    }
  };
  
  // 触发文件输入框
  const triggerFileInput = () => {
    fileInput.value.click(); // 触发点击事件
  };
  
  const manageMembers = () => {
    console.log("成员管理功能");
  };
  
  const convertSpeech = () => {
    console.log("语音转文字功能");
  };
  
  const translate = () => {
    console.log("翻译功能");
  };
  
  const settings = () => {
    console.log("设置功能");
  };
  
  const exitMeeting = () => {
    console.log("退出会议功能");
  };
  </script>
  
  <style scoped>
  .meeting-footer {
    background-color: #f5f7fa;
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }
  </style>
  