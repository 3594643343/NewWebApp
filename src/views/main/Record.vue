<template>
  <div>
    <h2>会议列表</h2>
    
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getMeetingRecordService } from '@/api/user';

const activeName = ref('first');
const meetinglist = ref([]);


// 加载会议记录并进行分类
const loadRecordMeetings = async () => {
  try {
    const response = await getMeetingRecordService();
    if (response && response.data) {
      meetinglist.value = response.data;
      // 根据会议状态分类
      console.log('获取会议记录列表成功：', meetinglist.value);
    } else {
      console.error('未能获取会议记录');
    }
  } catch (error) {
    console.error('获取会议记录列表失败:', error);
  }
};

onMounted(() => {
  loadRecordMeetings();
});
</script>

<style>

</style>
