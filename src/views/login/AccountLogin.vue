<template>
    <BaseHeader/>
    <!-- <el-container class="page-container"> -->
      <el-card class="page-container">
        <h2 class="header-title">登 录</h2>
        <div class="account-login-container">
          <el-form :model="form" :rules="rules" :label-position="'left'" label-width="90px" class="account-login-form">
            <el-form-item label="用户名" prop="username">
              <el-input type="text" v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="form.password" placeholder="请输入密码" />
            </el-form-item>

            <!-- <el-form-item> -->
              <el-button type="primary" class="account-login-button" @click="handleAccountLogin">登录</el-button>
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
  import { useRouter } from 'vue-router';
  import { userLoginService } from '@/api/user';

  const router = useRouter();

  const form = ref({
  username: '',
  password: '',
  })

  const useremail= ref('');
  
  const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  }
  
  const handleAccountLogin = async() => {
    try {
    const result = await userLoginService({
      userEmail: useremail.value,
      userName: form.value.username,
      userPassword: form.value.password,
    });
    console.log(result);
    if (result) {
      // 登录成功，跳转到主页
      localStorage.setItem('token', result.data.token);

      console.log("Login:", result.data.token);
      console.log('Login successful');
      router.push('/main');
    } else {
      console.log("error:", result); // 输出错误信息
    }
  } catch (error) {
    console.error('登录失败:', error); // 捕获并处理错误
  }
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
  .account-login-form {
    margin-bottom: 20px;
  }
  .account-login-button {
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
  
  .account-login-button:hover {
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