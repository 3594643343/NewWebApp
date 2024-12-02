<template>
    <div>
      <h2>我的日程</h2>
      <el-tabs v-model="activeName" class="demo-tabs">
        <el-tab-pane label="进行中的会议" name="first">
          <ul v-if="ongoingMeetings.length">
            <li v-for="meeting in ongoingMeetings" :key="meeting.id">
              <div class="meeting-info">
                  <h3>{{ meeting.meetingName }}</h3>
                  <p>{{ meeting.meetingStartTime }}</p>
                  <p>{{ meeting.meetingEndTime }}</p>
                  <p>{{ meeting.meetingHost }}</p>
              </div>
            </li>
          </ul>
          <p v-else>
            <el-empty description="没有进行中的会议" />
          </p>
        </el-tab-pane>
        <el-tab-pane label="已结束的会议" name="second">
          <ul v-if="endedMeetings.length">
            <li v-for="meeting in endedMeetings" :key="meeting.id">
              <div class="meeting-info">
                  <h3>{{ meeting.meetingName }}</h3>
                  <p>{{ meeting.meetingStartTime }}</p>
                  <p>{{ meeting.meetingEndTime }}</p>
                  <p>{{ meeting.meetingHost }}</p>
                </div>
            </li>
          </ul>
          <p v-else>
            <el-empty description="没有已结束的会议" />
          </p>
        </el-tab-pane>
        <el-tab-pane label="未开始的会议" name="third">
          <ul v-if="upcomingMeetings.length">
            <li v-for="meeting in upcomingMeetings" :key="meeting.id">
              <div class="meeting-info">
                  <h3>{{ meeting.meetingName }}</h3>
                  <p>{{ meeting.meetingStartTime }}</p>
                  <p>{{ meeting.meetingEndTime }}</p>
                  <p>{{ meeting.meetingHost }}</p>
                </div>
            </li>
          </ul>
          <p v-else>
            <el-empty description="没有未开始的会议" />
          </p>
        </el-tab-pane>
      </el-tabs>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { mainMeetingsShow } from '@/api/user';
  
  const activeName = ref('first');
  const meetinglist = ref([]);
  
  // 分类存储会议状态
  const ongoingMeetings = ref([]);
  const endedMeetings = ref([]);
  const upcomingMeetings = ref([]);
  
  // 加载会议记录并进行分类
  const loadRecordMeetings = async () => {
    try {
      const response = await mainMeetingsShow();
      if (response && response.data) {
        meetinglist.value = response.data;
        console.log('会议记录列表：', meetinglist.value);
        // 根据会议状态分类
        ongoingMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'on');
        endedMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'end');
        upcomingMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'off');
        console.log('进行中的会议：', ongoingMeetings.value);
        console.log('已结束的会议：', endedMeetings.value);
        console.log('未开始的会议：', upcomingMeetings.value);
  
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
  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }
  .el-tabs__nav {
    background-color: #f2f2f2;
  }
  .el-tabs__item {
    color: #111112;
    font-size: 20px;
    font-weight: 500;
  }
  .el-tabs__item.is-active {
    color: #409eff;
    font-weight: 600;
  }
  </style>
  