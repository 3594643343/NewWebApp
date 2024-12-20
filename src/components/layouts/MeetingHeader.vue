<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { getMeetingName } from '@/api/user';

const router = useRouter();
const meetingNumber = localStorage.getItem('meetingNumber');
const activeIndex = ref('');
const meetingTitle = ref('会议标题');


const getMeetingTitle = async () => {
  try {
    const response = await getMeetingName(meetingNumber);
    if (response && response.data) {
      console.log('获取会议名称成功:', response.data);
      meetingTitle.value = response.data; // 更新会议标题
    } else {
      console.error('未能获取会议名称');
    }
  } catch (error) {
    console.error('获取会议名称失败:', error);
  }
};

const handleClick = (index: string) => {
  activeIndex.value = index;
  router.push(index);
}

onMounted(() => {
  getMeetingTitle();
  activeIndex.value = router.currentRoute.value.path;
})
</script>

<template>
    <el-menu
      :default-active="activeIndex"
      class="meeting-header"
      mode="horizontal"
      :ellipsis="false"
      router
    >
      <el-menu-item>
        <img
          style="width: 100px"
          src="@/assets/logo/icon_wemeet.svg"
          alt="Element logo"
        />
      </el-menu-item>
      
      <div class="title-container">
        <h1>{{ meetingTitle }}</h1>
      </div>
      
    </el-menu>
</template>
  
<style>
  .meeting-header {
    background-color: #fff;
    height: 60px;
    line-height: 60px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }
  
  .title-container {
    flex: 1;  /* 使容器占满剩余空间 */
    display: flex;
    justify-content: center;  /* 水平居中 */
  }
  
  .meeting-header h1 {
    font-size: 18px;
    font-weight: 500;
    color: #303133;
    margin: 0;  /* 去掉默认的外边距 */
  }
</style>
  