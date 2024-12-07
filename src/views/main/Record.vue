<template>
  <div>
    <h2>会议列表</h2>
    <el-row>
      <el-select v-model="searchType" placeholder="选择搜索类型" style="width: 150px; margin-right: 10px;">
        <el-option label="会议号" value="number"></el-option>
        <el-option label="会议主题" value="subject"></el-option>
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="请输入搜索内容"
        style="width: 250px; margin-bottom: 20px;"
      />
      <el-button @click="search" icon="el-icon-search" style="margin-left: 10px;">搜索</el-button>
    </el-row>
    
    <el-table :data="filteredMeetings" style="width: 100%;">
      <el-table-column label="会议时间" width="400">
        <template #default="scope">
          {{ scope.row.meetingStartTime }} - {{ scope.row.meetingEndTime }}
        </template>
      </el-table-column>
      <el-table-column prop="meetingName" label="会议主题" width="180" />
      <el-table-column prop="meetingHost" label="会议主持人" width="150" />
      <el-table-column label="参与者">
        <template #default="scope">
          <el-dropdown>
            <el-button type="text">{{ scope.row.participants.length }} 名参与者</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="participant in scope.row.participants" :key="participant">{{ participant }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="viewDetails(scope.row)">详细信息</el-button>
          <el-button type="danger" @click="deleteMeeting(scope.row)">删除会议记录</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { getMeetingRecordService } from '@/api/user';
import { onMounted } from 'vue';

const meetingRecord = ref([]); // 会议记录列表
const searchType = ref('number'); // 默认搜索类型
const searchQuery = ref('');


// 计算属性，动态过滤会议列表
const filteredMeetings = computed(() => {
  if (!searchQuery.value) {
    return meetingRecord.value;
  }
  const query = searchQuery.value.toLowerCase();
  return meetingRecord.value.filter(meeting => {
    // 根据搜索类型进行过滤
    if (searchType.value === 'number') {
      return meeting.number.includes(query);
    } else if (searchType.value === 'subject') {
      return meeting.subject.toLowerCase().includes(query);
    }
    return false;
  });
});

const loadRecordMeetings = async () => {
  try {
    const response = await getMeetingRecordService();
    if (response && response.data) {
      meetingRecord.value = response.data; // 更新会议列表
      //page.value += 1; // 增加页码以便加载更多数据
      console.log('获取会议记录列表成功：', meetingRecord.value);
    } else {
      console.error('未能获取会议记录');
    }
  } catch (error) {
    console.error('获取会议记录列表失败:', error); // 错误处理
  }
};
onMounted(() => {
  loadRecordMeetings();
});

function search() {
  console.log('搜索:', searchType.value, searchQuery.value);
}

function viewDetails(meeting) {
  console.log('查看会议详细信息:', meeting);
}

function deleteMeeting(meeting) {
  console.log('删除会议记录:', meeting);
  // 在这里添加删除会议记录的逻辑
}
</script>

<style>
/* Add any necessary CSS styling here */
</style>
