<template>
  <div class="back-button-container">
    <div class="back-button">
      <el-icon @click="goBack"><ArrowLeftBold /></el-icon>
    </div>
    <h2 class="meeting-title">会议记录</h2>
  </div>
  <div class="meeting-detail">
      
      <h2>{{ meetingDetails.meetingName }}</h2>
      <div>
      <p><strong>会议时间:</strong> {{ meetingDetails.meetingStartTime }} - {{ meetingDetails.meetingEndTime }}</p>
      <p><strong>会议创建者:</strong> {{ meetingDetails.meetingHost }}</p>
      <div class="participants-container">
        <p><strong>参与者:</strong></p>
        <ul class="participants-list">
          <li v-for="participant in meetingDetails.participants" :key="participant">{{ participant }}</li>
        </ul>
      </div>
      <p><strong>会议音频:</strong></p>
      <div class="audio-container">
        <audio
          v-if="meetingDetails.meetingAudio"
          :src="`data:audio/wav;base64,${meetingDetails.meetingAudio}`"
          ref="audioPlayer"
          controls
          class="custom-audio"
        ></audio>
        <p v-else>暂无音频</p>
      </div>
      <!-- <p v-else>暂无音频</p> -->
      <!-- <p><strong>会议记录:</strong> {{ meetingDetails.meetingRecord || '暂无记录' }}</p>
      <p><strong>会议纪要:</strong> {{ meetingDetails.meetingMinutes || '暂无纪要' }}</p>
      <p><strong>会议翻译:</strong> {{ meetingDetails.meetingTranslation || '暂无翻译' }}</p> -->
      <p><strong>会议文件:</strong></p>
        <el-table :data="meetingFiles" style="width: 100%;" class="file-table">
          <el-table-column prop="fileName" label="文件名" width="600" />
          <el-table-column prop="fileType" label="文件类型" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="primary" icon="Download" @click="downloadFile(scope.row.fileId, scope.row.fileName)" circle></el-button>
            </template>
          </el-table-column>
        </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { getMeetingDetailService, getMeetingFileListService, downloadMeetingFileService  } from '@/api/user';
import { ArrowLeftBold, Download } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter(); // 获取 router 实例
const audioPlayer = ref(null);
const audioProgress = ref(null);

const meetingDetails = ref({
  meetingName: '',
  meetingStartTime: '',
  meetingEndTime: '',
  meetingHost: '',
  participants: [],
  meetingRecord: '',
  meetingMinutes: '',
  meetingTranslation: '',
  meetingAudio: '',
});

const meetingFiles = ref([]);

onMounted(() => {
  const meeting = JSON.parse(localStorage.getItem('currentMeeting'))
  if (meeting) {
    meetingDetails.value = {
      meetingName: meeting.meetingName,
      meetingStartTime: meeting.meetingStartTime,
      meetingEndTime: meeting.meetingEndTime,
      meetingHost: meeting.meetingHost,
      participants: meeting.participants,
      meetingRecord: '',
      meetingMinutes: '',
      meetingTranslation: '',
      meetingAudio: '',
    };
    console.log('获取会议详情成功：', meetingDetails.value);
  } else {
    console.error('未能获取会议详情')
    router.push({ name:'record' })
  }
  getDetails(meeting);
  getFileList(meeting);
});

const goBack = () => {
  router.back(); // 返回上一页
};

const getDetails = async (meeting) => {
  try {
    const response = await getMeetingDetailService(meeting.recordId);
    if (response && response.data) {
      console.log('获取会议详情成功：', response.data);
      // console.log('当前会议信息：', meeting);
      // localStorage.setItem('currentMeetingDetails', JSON.stringify(response.data));
      meetingDetails.value = {
        meetingName: meetingDetails.value.meetingName,
        meetingStartTime: meetingDetails.value.meetingStartTime,
        meetingEndTime: meetingDetails.value.meetingEndTime,
        meetingHost: meetingDetails.value.meetingHost,
        participants: meetingDetails.value.participants,
        meetingRecord: response.data.meetingRecord || '',
        meetingMinutes: response.data.meetingMinutes || '',
        meetingTranslation: response.data.meetingTranslation || '',
        meetingAudio: response.data.meetingAudio || '',
      };
      console.log('更新后的会议详情：', meetingDetails.value);
    } else {
      console.error('未能获取会议详情');
    }
  } catch (error) {
    console.error('获取会议详情失败:', error);
  }
};

//获取文件列表
const getFileList = async (meeting) => {
  try {
    const response = await getMeetingFileListService(meeting.recordId);
    if (response && response.data) {
      meetingFiles.value = response.data.map(file => ({
        ...file,
        meetingName: meetingDetails.value.meetingName, // 将会议名添加到每个文件对象中
      }));
      console.log('获取会议文件列表成功：', meetingFiles.value);
    } else {
      console.error('未能获取会议文件列表');
    }
  } catch (error) {
    console.error('获取会议文件列表失败:', error);
  }
};

const downloadFile = async (fileId: string, fileName: string) => {
  try {
    const response = await downloadMeetingFileService(fileId);
    if (response && response.data) {
      // const blob = new Blob([response.data], { type: `application/${fileName.split('.').pop()}` });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = fileName;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      // window.URL.revokeObjectURL(url);
      ElMessage.success('文件下载成功');
      // console.log('文件下载:', response.data);
    } else {
      console.error('未能获取文件数据');
      ElMessage.error('未能获取文件数据');
    }
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};


</script>

<style>
.back-button-container {
  margin-top: 25px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.back-button {
  margin-right: 10px;
}

.meeting-title {
  margin: 0;
}

.meeting-detail {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #ebebeb;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meeting-detail h2 {
  margin-bottom: 20px;
}

.meeting-detail p {
  margin-bottom: 10px;
}

.meeting-detail ul {
  list-style-type: none;
  padding: 0;
}

.meeting-detail li {
  margin-bottom: 5px;
}

.meeting-detail audio {
  margin-top: 10px;
}

.back-button .el-icon {
  font-size: 20px;
  cursor: pointer;
}

.participants-container {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 0;
}

.participants-list li {
  margin: 0;
  padding: 5px 4px;
  /* background-color: #ebebeb; */
  border-radius: 4px;
  font-size: 16px;
}

</style>
