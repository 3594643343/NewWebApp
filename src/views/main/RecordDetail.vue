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
      <p><strong>会议记录:</strong> {{ meetingDetails.meetingRecord || '暂无记录' }}</p>
      <p><strong>会议纪要:</strong> {{ meetingDetails.meetingMinutes || '暂无纪要' }}</p>
      <p><strong>会议翻译:</strong> {{ meetingDetails.meetingTranslation || '暂无翻译' }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import { getMeetingDetailService } from '@/api/user';

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
  // const meetingData = JSON.parse(localStorage.getItem('currentMeetingDetails'))
  // if (meetingData.meetingRecord) {
  //   meetingDetails.value.meetingRecord = meetingData.meetingRecord;
  // }
  // if (meetingData.meetingMinutes) {
  //   meetingDetails.value.meetingMinutes = meetingData.meetingMinutes;
  // }
  // if (meetingData.meetingTranslation) {
  //   meetingDetails.value.meetingTranslation = meetingData.meetingTranslation;
  // }
  // if (meetingData.meetingAudio) {
  //   meetingDetails.value.meetingAudio = meetingData.meetingAudio;
  // }

  // if (meetingDetails.value.meetingName) {
  //   console.log('从 localStorage 获取会议详情成功：', meetingDetails.value);
  // } else {
  //   console.error('未能从 localStorage 获取会议详情');
  //   // 如果没有获取到会议详情，可以重定向回会议列表页面
  //   router.push({ name: 'record' });
  // }
  // if (audioPlayer.value) {
  //   audioPlayer.value.addEventListener('timeupdate', () => {
  //     if (audioPlayer.value.duration) {
  //       const progress = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100;
  //       audioProgress.value.textContent = `播放进度: ${progress.toFixed(2)}%`;
  //     }
  //   });
  // }
  // console.log('会议详情：', meetingDetails.value)
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
