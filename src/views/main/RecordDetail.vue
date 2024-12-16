<template>
    <div>
        <p>会议详细信息未找到</p>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const meetingDetails = ref(null);
  const route = useRoute();
  
  const getMeetingDetailsFromLocalStorage = (recordId: string) => {
    try {
      const details = localStorage.getItem(`meetingDetails-${recordId}`);
      if (details) {
        return JSON.parse(details);
      } else {
        console.error('会议详细信息未找到');
        return null;
      }
    } catch (error) {
      console.error('解析会议详细信息失败:', error);
      return null;
    }
  };
  
  onMounted(() => {
    const recordId = route.params.recordId as string;
    meetingDetails.value = getMeetingDetailsFromLocalStorage(recordId);
  });
  </script>
  
  <style>
  /* Add any necessary CSS styling here */
  </style>
  