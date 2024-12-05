<template>
  <div>
    <h2>我的日程</h2>
    <el-button type="primary" @click="openAddScheduleDialog">添加日程</el-button>

    <el-dialog
      title="添加日程"
      v-model="addScheduleDialog"
      width="30%"
    >
      <el-form label-width="80px">
        <el-form-item label="会议号">
          <el-input v-model="addSchedulemeetingId" />
        </el-form-item>
        <el-form-item label="会议密码">
          <el-input v-model="addSchedulemeetingPassword" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addSchedule">添加</el-button>
        <el-button @click="addScheduleDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const addSchedulemeetingId = ref('');
const addSchedulemeetingPassword = ref('');
const addScheduleDialog = ref(false); // 默认关闭

// 打开添加日程弹窗
const openAddScheduleDialog = () => {
  addSchedulemeetingId.value = '';
  addSchedulemeetingPassword.value = '';
  addScheduleDialog.value = true; // 打开弹窗
};

// 添加日程的处理逻辑
const addSchedule = () => {
  console.log('添加日程:', addSchedulemeetingId.value, addSchedulemeetingPassword.value);
  addScheduleDialog.value = false; // 关闭弹窗
};
</script>

<style>
/* 自定义样式 */
.dialog-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
