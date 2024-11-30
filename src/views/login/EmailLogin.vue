<template>
    <BaseHeader/>
    <!-- <el-container class="page-container"> -->
      <el-card class="page-container">
        <h2 class="header-title">登 录</h2>
        <div class="email-login-container">
          <el-form :model="form" :rules="rules" :label-position="'left'" label-width="90px" class="email-login-form">
  
            <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
  
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="form.password" placeholder="请输入密码" />
            </el-form-item>
  
            <!-- <el-form-item> -->
              <el-button type="primary" class="email-login-button" @click="handleEmailLogin">登录</el-button>
            <!-- </el-form-item> -->
          </el-form>
          <p class="text-center login-link">
            没有账户？<router-link to="/register">注册</router-link>
          </p>
        </div>
      </el-card>
    <!-- </el-container> -->
  </template>
  
  <script lang="ts" setup>
  import { ref} from 'vue'
  
  
  
  
  const form = ref({
  email: '',
  password: '',
  })
  
  const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  }
  
  const handleEmailLogin = () => {
  console.log('email-login')
  }
  
  </script>
  
  
  
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
  .email-login-form {
    margin-bottom: 20px;
  }
  .email-login-button {
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
  
  .email-login-button:hover {
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