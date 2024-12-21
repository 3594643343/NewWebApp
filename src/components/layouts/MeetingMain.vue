<template>
  <div class="demo-image__lazy">
    <template v-if="urls.length > 0">
      <el-image v-for="(url, index) in urls" :key="index" :src="url" lazy />
    </template>
    <template v-else>
      <el-empty description="暂无文件" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const urls = ref([]);

const handleDownloadFile = async (fileId) => {
  console.log('下载文件id:', fileId);
  const config = {
    method: 'get',
    url: 'http://121.37.24.76:8079/meeting/download?fileId=' + fileId,
    headers: { 
      "token" : localStorage.getItem('token')
    },
    responseType: 'json'
  };
  axios(config)
    .then(function (response) {
      // console.log(JSON.stringify(response.data));
      const base64data = response.data.data.filePics; // 获取 Base64 编码的图片列表
      console.log('Base64 数据:', base64data);
      
      // 将 Base64 编码转换为图片URL
      const imgUrls = base64data.map(base64 => 'data:image/jpeg;base64,' + base64);
      
      // 将图片URL赋值给urls数组
      urls.value = imgUrls;
    })
    .catch(function (error) {
      console.error('下载文件失败:', error.response ? error.response.data : error.message);
      ElMessage.error('下载文件失败: ' + error.message);
    });
};

onMounted(() => {
  const fileId = localStorage.getItem('fileId');
  if (fileId) {
    handleDownloadFile(fileId);
  }else {
    urls.value = [];
  }
});
</script>

<style scoped>
.demo-image__lazy {
  height: 600px;
  overflow-y: auto;
}
.demo-image__lazy .el-image {
  display: block;
  min-height: 200px;
  margin-bottom: 10px;
}
.demo-image__lazy .el-image:last-child {
  margin-bottom: 0;
}
</style>
