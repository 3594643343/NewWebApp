<script lang="ts" setup>
  import { ref} from 'vue'
  import { useUserStore } from '@/stores/useUserStore';
  import { ElMessage } from 'element-plus';
  import { useRouter } from 'vue-router';
  import { userLoginService, fetchUserProfile,getAllFriends,getUserGroups,getOneGroup,initWschat } from '@/api/user';

  const router = useRouter();
  const userStore = useUserStore();

  const form = ref({
  username: '',
  password: '',
  })
  
  const friends = ref([]);
  const useremail= ref('');
  const usergroups= ref([]);
  const groupid= ref('');

  const userProfile = ref({
  avatar: '', // 初始头像为空字符串，稍后将更新
  username: '', // 初始昵称为空字符串
  signature: '', // 初始签名为空字符串  
  needCheck:1, // 初始需要验证为0
  });
  
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
  
  const handleAccountLogin = async () => {
  try {
    const result = await userLoginService({
      userEmail: useremail.value,
      userName: form.value.username,
      userPassword: form.value.password,
    });
    
    console.log(result);
    
    if (result) {
      // 登录成功，存储 token
      localStorage.setItem('token', result.data.token); // 存储 token
      localStorage.setItem('userId',result.data.userId);
      console.log("Login:", result.data.token);
      console.log('Login successful');

      initWschat();

      userStore.login();  // 更新登录状态为 true

      // 假设用户信息在返回中包含其他数据，你可以将其存储在 localStorage
      await showUserProfile();
      await loadFriends();
      await loadUserGroups();
       if(result.data.isAdmin===false){
        console.log("普通用户：" + result.data.isAdmin)
        router.push('/main/user');
       }
       else{
         console.log("管理员：" + result.data.isAdmin)
         router.push('/admin');
       }
      
    } else {
      console.log("error:", result); // 输出错误信息
    }
  } catch (error) {
    console.error('登录失败:', error); // 捕获并处理错误
    ElMessage.error('账号或密码错误，请重新登录。');
  }
}

const showUserProfile = async () => {
  try {
    const response = await fetchUserProfile();
    if (response && response.data) {
      // userProfile.value = response.data; 
      userProfile.value.avatar = response.data.avatar; // 这里假设 avatar 是 Base64 字符串
      userProfile.value.username = response.data.username; // 设置昵称
      userProfile.value.signature = response.data.signature; // 设置签名
      userProfile.value.needCheck = response.data.needCheck; // 设置是否需要验证
      localStorage.setItem('userProfile', JSON.stringify(userProfile.value));
      console.log('获取用户信息成功:', userProfile.value);
    } else {
      console.error('未能获取用户信息');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 500) {
        ElMessage.error('服务器内部错误，请稍后再试。');
    }
  }
};

const loadFriends = async () => {
  try {
    const res = await getAllFriends();
    console.log(res);
    friends.value = res.data;
    localStorage.setItem('friends', JSON.stringify(friends.value));
    console.log("获取好友列表成功:friends",friends.value);
  } catch (error) {
    console.error(error);
  }
};

const loadUserGroups = async () => {
  try {
    const res = await getUserGroups();
    console.log(res);
    groupid.value = res.data;
    console.log("获取用户群号成功:usergroups",groupid.value);
    for(let i=0;i<groupid.value.length;i++){
      const res1 = await getOneGroup(groupid.value[i]);
      console.log(res1);
      usergroups.value.push(res1.data);
      console.log("获取用户群信息成功:usergroups",usergroups.value);
    }
    localStorage.setItem('usergroups', JSON.stringify(usergroups.value));
  } catch (error) {
    console.error(error);
  }
};

</script>
  
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