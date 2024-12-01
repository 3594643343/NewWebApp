<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MainHeader from '@/components/layouts/MainHeader.vue';
import MainSider from '@/components/layouts/MainSider.vue';

const router = useRouter();
const form = ref({
  meetingName: '',
  meetingStartTime: '',
  meetingEndTime: '',
  meetingPassword: ''
});

const rules = {
  meetingName: [
    { required: true, message: '请输入会议名称', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  meetingStartTime: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  meetingEndTime: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
  ],
  meetingPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== form.value.meetingEndTime) {
          callback(new Error('两次密码不一致'));
        } else {
          callback(); // 校验通过
        }
      }, trigger: 'blur' }
  ]
};
</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-header>
            <MainHeader />
        </el-header>
        <el-container>
          <el-aside width="200px" class="main-sider">
            <MainSider />
          </el-aside>
        <el-main>
            <h2 class="header-title">预定会议</h2>
            <el-card class="page-container">
                
                <div class="register-container">
                <el-form :model="form" :rules="rules" label-position="left" label-width="90px" class="register-form">
                    <el-form-item label="用户名" prop="meetingName">
                    <el-input type="text" v-model="form.meetingName" placeholder="请输入用户名" />
                    </el-form-item>

                    <el-form-item label="邮箱" prop="meetingStartTime">
                    <el-input type="email" v-model="form.meetingStartTime" placeholder="请输入邮箱" />
                    </el-form-item>

                    <el-form-item label="密码" prop="meetingEndTime">
                    <el-input type="password" v-model="form.meetingEndTime" placeholder="请输入密码" />
                    </el-form-item>

                    <el-form-item label="确认密码" prop="meetingPassword">
                    <el-input type="password" v-model="form.meetingPassword" placeholder="请确认密码" />
                    </el-form-item>

                    <el-button type="primary" class="register-button" @click="handleRegister">注册</el-button>
                </el-form>

                <p class="text-center login-link">
                    已有账户？<router-link to="/emaillogin">登录</router-link>
                </p>
                </div>
            </el-card>
        </el-main>
        </el-container>
        
      </el-container>
    </div>
  </template>

<style scoped>
.common-layout {
  height: 100%;
}
.el-container {
    height: 100%;
}
.el-header {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  offset: 10;
  position: top;
}
.el-aside {
  background-color: #fff;
  overflow: auto;
}

.main-sider {
  background-color: #eef0f4;
}
</style>
