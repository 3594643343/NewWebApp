<template>
  <div>
    <br>
    <h2>我的日程</h2>
    <br>
    <el-button type="primary" @click="openAddScheduleDialog">添加日程</el-button>
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="进行中的会议" name="first">
        <el-table :data="ongoingMeetings" style="width: 100%">
          <el-table-column prop="meetingName" label="会议名称" width="180" />
          <el-table-column prop="meetingStartTime" label="开始时间" width="180" />
          <el-table-column prop="meetingEndTime" label="结束时间" width="180" />
          <el-table-column prop="meetingHost" label="会议主持" width="140" />
          <el-table-column prop="meetingNumber" label="会议号" width="180" />
          <el-table-column label="操作" width="200">
            <template v-slot="scope">
              <div style="display: flex; align-items: center">
                <el-button @click="joinMeeting(scope.row)" type="success" size="mini" style="margin-right: 5px;">加入会议</el-button>
                <el-button @click="deleteMeeting(scope.row)" type="danger" size="mini">删除日程</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!ongoingMeetings.length">
          <el-empty description="没有进行中的会议" />
        </p>
      </el-tab-pane>
      <!-- <el-tab-pane label="已结束的会议" name="second">
        <el-table :data="endedMeetings" style="width: 100%">
          <el-table-column prop="meetingName" label="会议名称" width="180" />
          <el-table-column prop="meetingStartTime" label="开始时间" width="180" />
          <el-table-column prop="meetingHost" label="会议主持" width="180" />
          <el-table-column prop="meetingNumber" label="会议号" width="180" />
          <el-table-column prop="meetingHost" label="会议主持" />
          <el-table-column label="操作" width="200">
            <template v-slot="scope">
              <div style="display: flex; align-items: center">
                <el-button @click="deleteMeeting(scope.row)" type="danger" size="mini">删除日程</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!endedMeetings.length">
          <el-empty description="没有已结束的会议" />
        </p>
      </el-tab-pane> -->
      <el-tab-pane label="未开始的会议" name="third">
        <el-table :data="upcomingMeetings" style="width: 100%">
          <el-table-column prop="meetingName" label="会议名称" width="180" />
          <el-table-column prop="meetingStartTime" label="开始时间" width="180" />
          <el-table-column prop="meetingEndTime" label="结束时间" width="180" />
          <el-table-column prop="meetingHost" label="会议主持" width="180" />
          <el-table-column prop="meetingNumber" label="会议号" width="180" />
          <el-table-column label="操作" width="200">
            <template v-slot="scope">
              <div style="display: flex; align-items: center">
                <el-button @click="deleteMeeting(scope.row)" type="danger" size="mini">删除日程</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!upcomingMeetings.length">
          <el-empty description="没有未开始的会议" />
        </p>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加日程弹窗 -->
    <el-dialog
      title="添加日程"
      v-model="addScheduleDialog"
      class="dialog-container"
    >
      <el-form ref="form" label-width="80px">
        <el-form-item label="会议号">
          <el-input v-model="addSchedulemeetingId" />
        </el-form-item>
        <el-form-item label="会议密码">
          <el-input v-model="addSchedulemeetingPassword" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addSchedule">添加</el-button>
        <el-button @click="addScheduleDialog = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { mainMeetingsShow, mainMeetingsAdd,joinScheduleMeeting,mainMeetingsDelete } from '@/api/user';
import router from '@/router';



const activeName = ref('first');
const meetinglist = ref([]);
const addSchedulemeetingId = ref('');
const addSchedulemeetingPassword = ref('');
const addScheduleDialog = ref(false); // 默认关闭

// 分类存储会议状态
const ongoingMeetings = ref([]);
const endedMeetings = ref([]);
const upcomingMeetings = ref([]);

//加载会议记录并进行分类
const loadRecordMeetings = async () => {
  try {
    const response = await mainMeetingsShow();
    if (response && response.data) {
      meetinglist.value = response.data;
      ongoingMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'on');
      endedMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'end');
      upcomingMeetings.value = meetinglist.value.filter(meeting => meeting.meetingState === 'off');
    } else {
      console.error('未能获取会议记录');
    }
  } catch (error) {
    console.error('获取会议记录列表失败:', error);
  }
};

// 打开添加日程弹窗
const openAddScheduleDialog = () => {
  addSchedulemeetingId.value = '';
  addSchedulemeetingPassword.value = '';
  addScheduleDialog.value = true; // 打开弹窗
  console.log('打开添加日程弹窗:' + addScheduleDialog.value);
};

// 添加日程
const addSchedule = async () => {
  try {
    const response = await mainMeetingsAdd({
      meetingNumber: addSchedulemeetingId.value,
      meetingPassword: addSchedulemeetingPassword.value,
    });
    if (response) {
      console.log('添加日程成功', response.data);
      loadRecordMeetings(); // 刷新会议列表
      addScheduleDialog.value = false; // 关闭弹窗
    } else {
      console.error('添加日程失败');
    }
  } catch (error) {
    console.error('添加日程失败:', error); // 错误处理
  }
};

// 加入日程会议
const joinMeeting = async (meeting) => {
  try {
    const response = await joinScheduleMeeting({
      meetingnumber: meeting.meetingNumber,
    });
    if (response) {
      console.log('加入会议成功', response.data);
      router.push('/meeting')
    } else {
      console.error('加入会议失败');
    }
  } catch (error) {
    console.error('加入会议失败:', error); // 错误处理
    console.log('加入会议失败会议号:', meeting.meetingNumber);
  }
  
};


// 删除日程
const deleteMeeting = async (meeting) => {
  try {
    const response = await mainMeetingsDelete({
      meetingNumber: meeting.meetingNumber,
    });
    if (response) {
      console.log('删除日程成功', response.data);
      loadRecordMeetings(); // 刷新会议列表
    } else {
      console.error('删除日程失败');
    }
  } catch (error) {
    console.error('删除日程失败:', error); // 错误处理
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
  font-size: 36px; /* 增大字体 */
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
.el-button {
  margin-right: 10px;
}
.dialog-container {
  width: 400px;
  top: 200px;
  
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
