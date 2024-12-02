<template>
  <el-dialog :visible.sync="visible" title="修改个人信息">
    <el-form :model="form">
      <el-form-item label="用户名" :label-width="formItemLabelWidth">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="个性签名" :label-width="formItemLabelWidth">
        <el-input v-model="form.signature" type="textarea" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const props = defineProps(['visible']);
const emits = defineEmits(['close', 'confirm']);

const form = ref({
  username: '',
  signature: ''
});

const handleConfirm = () => {
  emits('confirm', form.value);
  form.value = { username: '', signature: '' }; // 重置表单
};

const handleCancel = () => {
  emits('close');
  form.value = { username: '', signature: '' }; // 重置表单
};
</script>

<style scoped>
.form-item {
  margin-bottom: 20px;
}
</style>
