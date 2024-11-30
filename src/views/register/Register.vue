<template>
  <BaseHeader/>
  <el-container class="page-container">
    <el-main>
      <h2 class="header-title">注册</h2>
      <div class="register-container">
        <el-form :model="form" ref="form" :rules="rules" label-width="100px" class="register-form">
          <el-form-item label="用户名" prop="username">
            <el-input type="text" v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input type="email" v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="form.password" placeholder="请输入密码" />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="form.confirmPassword" placeholder="请确认密码" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleRegister">注册</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <p class="text-center mt-3">
          已有账户？<router-link to="/login">登录</router-link>
        </p>
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const form = ref({
username: '',
email: '',
password: '',
confirmPassword: ''
})

const rules = {
username: [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
],
email: [
  { required: true, message: '请输入邮箱', trigger: 'blur' },
  { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
],
password: [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
],
confirmPassword: [
  { required: true, message: '请确认密码', trigger: 'blur' },
  { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
]
}

const handleRegister = () => {
console.log('register')
}

const resetForm = () => {
console.log('reset form')
}

</script>



<style scoped>
.page-header {
  background-color: #f2f2f2;
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 500px;
}
.page-container {
max-width: 400px;
margin: 50px auto;
padding: 20px;
border: 2px solid #ccc;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
background-color: #f9f3f3;
height: 80%;
}

.header-title {
margin-bottom: 20px;
margin-top: 100px;
font-size: 24px;
color: #333;
text-align: center;
}
.register-form {

    margin-bottom: 20px;
    .el-input {
      width: 100%;
      color: aqua;
      border-color: #c90fad;
    }
 
}

</style>