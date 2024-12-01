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
  meetingPassword: '',
  defaultPermission:0  // 0 表示与会者，1 表示管理员
});

const rules = {
  meetingName: [
    { required: true, message: '请输入会议名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  meetingStartTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        const currentTime = new Date();
        if (value && new Date(value) < currentTime) {
          callback(new Error('开始时间不能早于当前时间'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  meetingEndTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        const startTime = new Date(form.value.meetingStartTime);
        const currentTime = new Date();
        if (value && new Date(value) <= currentTime) {
          callback(new Error('结束时间应晚于当前时间'));
        } else if (value && new Date(value) <= startTime) {
          callback(new Error('结束时间应晚于开始时间'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  meetingPassword: [
    { required: true, message: '请输入会议密码', trigger: 'blur' },
    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' },
  ],
  defaultPermission: [
    { required: true, message: '请选择权限', trigger: 'change' }
  ]
};

const handleBookMeeting = () => {
  if (form.value.meetingName === '') {
    return;
  }
  if (form.value.meetingStartTime === '') {
    return;
  }
  if (form.value.meetingEndTime === '') {
    return;
  }
  if (form.value.meetingPassword === '') {
    return;
  }
  alert('会议预定成功');
};

</script>

<template>
    <div class="common-layout">
      <!-- <el-container>
        <el-header>
            <MainHeader />
        </el-header>
        <el-container>
          <el-aside width="200px" class="main-sider">
            <MainSider />
          </el-aside> -->
            <h2 class="header-title">预定会议</h2>
            <el-card class="page-container">
                
                <div class="book-meeting-container">
                <el-form :model="form" :rules="rules" label-position="left" label-width="90px" class="book-meeting-form">
                    <el-form-item label="会议名称" prop="meetingName">
                    <el-input type="text" v-model="form.meetingName" placeholder="请输入会议名称" style="max-width: 500px;"/>
                    </el-form-item>

                    <el-form-item label="开始时间" prop="meetingStartTime">
                    <el-date-picker v-model="form.meetingStartTime" type="datetime" placeholder="选择开始时间" />
                    </el-form-item>

                    <el-form-item label="结束时间" prop="meetingEndTime">
                        <el-date-picker v-model="form.meetingEndTime" type="datetime" placeholder="选择结束时间" />
                    </el-form-item>

                    <el-form-item label="会议密码" prop="meetingPassword">
                    <el-input type="text" v-model="form.meetingPassword" placeholder="请输入会议密码"  style="max-width: 500px;"/>
                    </el-form-item>

                    <el-form-item label="权限" prop="defaultPermission">
                    <el-radio-group v-model="form.defaultPermission">
                        <el-radio :label="0">与会者</el-radio>
                        <el-radio :label="1">管理员</el-radio>
                    </el-radio-group>
                    </el-form-item>

                    <el-button type="primary" class="book-meeting-button" @click="handleBookMeeting">预定会议</el-button>
                </el-form>
                </div>
            </el-card>
        <!-- </el-container>
        
      </el-container> -->
    </div>
  </template>

<style scoped>
/* .common-layout {
  height: 100%;
}


.main-sider {
  background-color: #eef0f4;
} */
</style>
