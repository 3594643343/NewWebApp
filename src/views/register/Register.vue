<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userRegisterService } from '../../api/user';
// import jwtDecode from 'jwt-decode';

const router = useRouter();
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

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
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error('两次密码不一致'));
        } else {
          callback(); // 校验通过
        }
      }, trigger: 'blur' }
  ]
};

// const dialogVisible = ref(false);
/*
const handleRegister = async () => {
  // console.log(form.value.);

  // // 验证表单
  // const isValid = await new Promise((resolve) => {
  //   // 手动触发验证
  //   form.value.$refs.form.validate((valid) => {
  //     resolve(valid);
  //   });
  // });

  // if (!isValid) {
  //   return; // 表单不合法
  // }

  console.log('Username type:', typeof form.value.username);
  console.log('Email type:', typeof form.value.email);
  console.log('Password type:', typeof form.value.password);
  console.log('Confirm Password type:', typeof form.value.confirmPassword);

  console.log(form.value);
  // 调用注册服务
  try {
    const result = await userRegisterService({
      userEmail: form.value.email,
      userName: form.value.username,
      userPassword: form.value.password,
      checkPassword: form.value.confirmPassword
    });

    console.log(result);
    if (result.success) {
      // const token = result.token; // 确保这里获取到 token，根据具体返回值修改
      // const decoded = jwtDecode(token); // 解码 token
      // console.log(decoded); // 查看解码后的内容
      // 注册成功，跳转到登录页面
      router.push('/accountlogin');
    } else {
      console.log(result.msg); // 输出错误信息
      alert(result.msg); // 提示用户
    }
  } catch (error) {
    console.error('注册失败:', error.response ? error.response.data : error);
    alert('注册失败，请检查控制台');
  }
};
*/

const handleRegister = () => {
  // console.log(form.value.);
  router.push('/accountlogin');
  // 验证表单
}

</script>

<template>
  <BaseHeader />
  <el-card class="page-container">
    <h2 class="header-title">注 册</h2>
    <div class="register-container">
      <el-form :model="form" :rules="rules" label-position="left" label-width="90px" class="register-form">
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

        <el-button type="primary" class="register-button" @click="handleRegister">注册</el-button>
      </el-form>

      <p class="text-center login-link">
        已有账户？<router-link to="/emaillogin">登录</router-link>
      </p>
    </div>
  </el-card>
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
.register-form {
  margin-bottom: 20px;
}
.register-button {
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

.register-button:hover {
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
