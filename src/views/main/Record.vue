<template>
  <div>
    <div class="fixed-search-bar">
      <h2>会议记录</h2>
      <el-row>
        <el-select v-model="searchType" placeholder="选择搜索类型" style="width: 150px; margin-right: 10px;">
          <el-option label="会议主题" value="subject"></el-option>
          <el-option label="会议创建者" value="host"></el-option>
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="请输入搜索内容"
          style="width: 250px; margin-bottom: 20px;"
        />
        <el-button type="primary" @click="resetSearch" style="margin-left: 10px;">重置</el-button>
      </el-row>
    </div>
    <div class="content">
      <el-table :data="filteredMeetings" style="width: 100%;" height="520" class="custom-table">
        <el-table-column prop="meetingName" label="会议主题" width="200" />
        <el-table-column prop="meetingHost" label="会议创建者" width="150" />
        <el-table-column label="会议时间" width="350">
          <template #default="scope">
            {{ scope.row.meetingStartTime }} - {{ scope.row.meetingEndTime }}
          </template>
        </el-table-column>
        <el-table-column label="参与者" width="120">
            <template #default="scope">
              <el-button type="text" @click="handleCommand(scope.row)">{{ scope.row.participants.length }} 名参与者</el-button>
            </template>
          </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button type="primary" @click="viewDetails(scope.row)">详细信息</el-button>
            <el-button type="danger" @click="confirmDelete(scope.row)">删除会议记录</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog :title="`${currentMeeting.meetingName} - 参会人员`" v-model="dialogVisible" width="30%">
        <el-table :data="currentMeeting.participants" style="width: 100%;">
          <el-table-column label="用户名">
            <template #default="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
      <!-- <router-view></router-view> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { getMeetingRecordService,getMeetingDetailService, deleteMeetingRecordService } from '@/api/user';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter(); // 获取 router 实例
const meetingRecord = ref([]); // 会议记录列表
const searchType = ref('subject'); // 默认搜索类型
const searchQuery = ref('');

const dialogVisible = ref(false);
const currentMeeting = ref({ meetingName: '', participants: [] });

// 计算属性，动态过滤会议列表
const filteredMeetings = computed(() => {
  if (!searchQuery.value) {
    return meetingRecord.value;
  }
  const query = searchQuery.value.toLowerCase();
  return meetingRecord.value.filter(meeting => {
    // 根据搜索类型进行过滤
    if (searchType.value === 'subject') {
      return meeting.meetingName?.toLowerCase().includes(query) || false;
    } else if (searchType.value === 'host') {
      return meeting.meetingHost?.toLowerCase().includes(query) || false;
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
      meetingRecord.value.sort((a, b) => new Date(b.meetingStartTime).getTime() - new Date(a.meetingStartTime).getTime());
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

// 重置搜索功能
function resetSearch() {
  searchType.value = 'subject'; // 默认搜索类型
  searchQuery.value = ''; // 清空搜索内容
  console.log('重置搜索条件');
}

// 详细信息
// const viewDetails = async (meeting) => {
//   try {
//     const response = await getMeetingDetailService(meeting.recordId);
//     if (response && response.data) {
//       console.log('获取会议详情成功：', response.data);
//       localStorage.setItem('currentMeeting', JSON.stringify(meeting));
//       console.log('当前会议信息：', meeting);
//       localStorage.setItem('currentMeetingDetails', JSON.stringify(response.data));
//       // console.log('跳转到会议详情页');
//       router.push('/main/detail');
//     } else {
//       console.error('未能获取会议详情');
//     }
//   } catch (error) {
//     console.error('获取会议详情失败:', error);
//   }
// };

const viewDetails = (meeting) => {
      localStorage.setItem('currentMeeting', JSON.stringify(meeting));
      console.log('当前会议信息：', meeting);
      // console.log('跳转到会议详情页');
      router.push('/main/detail');
};

const deleteMeeting = async (meeting) => {
  try {
    const response = await deleteMeetingRecordService(meeting.recordId);
    if (response) {
      console.log('删除会议记录成功：', response.data);
      ElMessage.success('删除会议记录成功');
      loadRecordMeetings(); // 刷新会议列表
    } else {
      console.error('未能删除会议记录');
    }
  } catch (error) {
    console.error('删除会议记录失败:', error); // 错误处理
  }
};

// 确认删除对话框
const confirmDelete = (meeting) => {
  ElMessageBox.confirm(`是否删除“${meeting.meetingName}”会议记录？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    deleteMeeting(meeting);
  })
  .catch(() => {
    console.log('取消删除');
  });
};

//参会人员列表弹窗
const handleCommand = (meeting) => {
  currentMeeting.value = meeting;
  dialogVisible.value = true;
};

</script>

<style>
.fixed-search-bar {
  position: fixed;
  top: 65px;
  left: 225px;
  height: 110px;
  width: 100%;
  background-color: #F6F7F9;
  padding: 10px;
  z-index: 999;  
}

.content {
  margin-top: 125px;
}

.custom-table .el-table__row .el-button {
  margin-top: 10px; /* 调整按钮的垂直位置 */
}

.custom-table .el-table__row .el-row {
  display: flex;
  align-items: center; /* 垂直居中对齐按钮 */
}
</style>
