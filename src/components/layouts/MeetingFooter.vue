<script setup>
  import { ref, onMounted  } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElDialog, ElMessageBox } from 'element-plus';
  import { getInMeetingUsers } from '@/api/user'; 
  import { uploadFile, leaveMeetingService, updatePermissionAPI, getCurrentMeetingFileList, downloadCurrentMeetingFile, kickUserService } from '@/api/user'; // 导入上传文件的接口
  import axios from 'axios';
  
  const users = ref(JSON.parse(localStorage.getItem('users')) || []); // 存储当前会议中的用户列表
  const router = useRouter();
  const InviteVisible = ref(false);
  const confirmLeaveVisible = ref(false); // 确认离开会议弹窗显示状态
  const manageMembersVisible = ref(false); // 成员管理弹窗显示状态
  const micStatus = ref(''); // 全局麦克风状态
  const meetingNumber = localStorage.getItem('meetingNumber');
  const meetingPassword = localStorage.getItem('meetingPassword');
  const userProfileData = JSON.parse(localStorage.getItem('userProfile')); // 用户信息，假设存储的是JSON字符串
  const userId = localStorage.getItem('userId')
  // const userId = userProfileData && userProfileData.id ? parseInt(userProfileData.id, 10) : null; // 用户id，确保其为Integer类型
  const username = userProfileData.username; // 用户名
  // const signature = userProfileData.signature; // 用户签名

  const fileInput = ref(null); // 声明和初始化 fileInput 引用
  const fileListVisible = ref(false); // 文件列表弹窗显示状态
  const files = ref([]); // 存储当前会议的文件列表

  onMounted(()=>{
    micStatus.value = true;
    localStorage.setItem('micStatus', JSON.stringify(micStatus.value));
  }); 
// 切换麦克风状态
  const toggleMicStatus = () => {
    if (!micStatus.value) {
        micStatus.value = true; // 更新麦克风状态为开启
        localStorage.setItem('micStatus', JSON.stringify(micStatus.value));
    } else {
        micStatus.value = false; // 更新麦克风状态为关闭
        localStorage.setItem('micStatus', JSON.stringify(micStatus.value));
    }
  };

  //复制会议号与密码到剪贴板
  const copyToClipboard = () => {
    const textToCopy = `会议号: ${meetingNumber}, 会议密码: ${meetingPassword}`; // 要复制的文本
    navigator.clipboard.writeText(textToCopy).then(() => {
      ElMessage.success('会议号与密码已复制到剪贴板！'); // 复制成功的反馈
    }).catch(err => {
      ElMessage.error('复制失败，请重试。'); // 复制失败的反馈
    });
  };
  
  // 选择文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // 获取选择的文件
    if (file) {
      try {
        const response = await uploadFile(meetingNumber, file); // 调用上传文件的接口
        if (response && response.code === 1) {
          console.log('文件上传成功:', response);
          ElMessage.success('文件上传成功');
          fetchFiles();
        } else {
            ElMessage.error('文件上传失败');
        }
      } catch (error) {
        console.error('上传文件失败:', error.response ? error.response.data : error.message);
        ElMessage.error('文件上传失败'); // 上传失败的反馈
      }
    }
  };
  
  // 触发文件输入框
  const triggerFileInput = () => {
    fileInput.value.click(); // 触发点击事件
  };
  
  const manageMembers = () => {
    // console.log("成员管理功能");
    const storedUsers = localStorage.getItem('users');
    users.value = storedUsers ? JSON.parse(storedUsers) : [];
    manageMembersVisible.value = true; // 显示成员管理弹窗
  };
  
  // const convertSpeech = () => {
  //   console.log("语音转文字功能");
  // };
  
  // const translate = () => {
  //   console.log("翻译功能");
  // };
  
  // const settings = () => {
  //   console.log("设置功能");
  // };
  
  // 触发离开会议确认对话框
  const confirmLeaveMeeting = () => {
    confirmLeaveVisible.value = true; // 显示确认对话框
  };

  const handleLeaveMeeting  = async () => {
    try {
    const response = await leaveMeetingService();
    setTimeout(1000);
    console.log('退出会议结果:', response);
    if (response && response.code === 1) {
      console.log('退出会议成功：');
      localStorage.removeItem('fileId');
      router.push('/main/user')

    } else {
      console.error('退出会议失败');
    }
  } catch (error) {
    console.log('退出会议失败:', error);
  } finally {
    confirmLeaveVisible.value = false; // 关闭确认对话框
  }

  };

  // 更新用户权限
  const updatePermission = async (userId, newPermission) => {
    try {
      const response = await updatePermissionAPI(userId,meetingNumber, newPermission);
      console.log('会议号：' + meetingNumber + '，用户id：' + userId + '，新权限：' + newPermission);
      if (response && response.code === 1) {
        console.log('更新权限成功:', response);
        // 更新本地用户权限信息
        const user = users.value.find(user => user.id === userId);
        if (user) {
          user.permission = newPermission;
        }
        ElMessage.success('用户权限更新成功');
      } else {
        ElMessage.error('更新权限失败');
        console.error('更新权限失败:', response);
      }
    } catch (error) {
      console.error('更新权限失败:', error.message);
      ElMessage.error('更新权限失败，请重试。');
    }
  };

  // 获取当前用户的权限
  const getPermission = () => {
    const user = users.value.find(user => user.username === username);
    if (user) {
      // console.log('当前用户权限:', user.permission);
      // console.log('当前用户:', user.username);
      return user.permission;
    } else {
      console.error('当前用户未找到');
      return null;
    }
  };

  const showFileList = () => {
    fetchFiles();
    fileListVisible.value = true; // 显示文件列表弹窗
  };

  // 获取文件列表
  const fetchFiles = async () => {
    try {
      const response = await getCurrentMeetingFileList();
      if (response && response.code === 1) {
        console.log('获取的文件列表:', response.data);
        files.value = response.data;
      } else {
        console.error('获取文件列表失败:', response);
        ElMessage.error('获取文件列表失败: ' + response.msg);
      }
    } catch (error) {
      console.error('获取文件列表失败:', error.response ? error.response.data : error.message);
      ElMessage.error('获取文件列表失败: ' + error.message);
    }
  };

// const handleDownloadFile = async (fileId) => {
//   console.log('下载文件id:', fileId);
//   const config = {
//     method: 'get',
//     url: 'http://121.37.24.76:8079/meeting/download?fileId=' + fileId,
//     headers: { 
//       "token" : localStorage.getItem('token')
//     },
//     responseType: 'json'
//   };
//   axios(config)
//     .then(function (response) {
//       console.log(JSON.stringify(response.data));
//       const base64data = response.data; // 获取 Base64 编码的图片列表
//       console.log('Base64 数据:', base64data);
//     })
//     .catch(function (error) {
//       console.error('下载文件失败:', error.response ? error.response.data : error.message);
//       ElMessage.error('下载文件失败: ' + error.message);
//     });
// };
const handleDownloadFile = (fileId) => {
  localStorage.setItem('fileId', fileId);
  console.log('下载文件id:', fileId);
  fileListVisible.value = false; // 关闭文件列表弹窗
  //刷新页面
  window.location.reload();
};
  // 初始化文件列表
  // onMounted(() => {
  //   fetchFiles();
  // });

  // 获取当前会议中的用户列表
  const fetchUsers = async () => {
    try {
      console.log('获取用户列表...',meetingNumber);
      const response = await getInMeetingUsers(meetingNumber);
      if (response && response.data) {
        console.log('获取的用户数据:', response.data);
        users.value = response.data.map(user => {
          // const newUsers = response.data.map(user => {
          // 对每个用户的头像进行格式转换
          return {
            ...user,
            avatar: user.avatar ? 'data:image/png;base64,' + user.avatar : '',// 格式转换
          };
        });
        localStorage.setItem('users', JSON.stringify(users.value)); // 缓存用户列表到本地
      }
    } catch (error) {
      console.error('获取用户列表失败:', error.response ? error.response.data : error.message);
    }
  };
    //更新用户列表
  const updateMembers = () => {
    const storedUsers = localStorage.getItem('users');
    users.value = storedUsers ? JSON.parse(storedUsers) : [];
  };
  // 踢除用户
  // const kickUser = async (userId) => {
  //   if (!meetingNumber) {
  //     ElMessage.error('会议号未找到');
  //     return;
  //   }
  //   const userIdInt = parseInt(userId, 10); // 确保 userId 为整数
  //   console.log('踢除用户:', { id: userIdInt, meetingNumber: meetingNumber });
  //   try {
  //     var data = JSON.stringify({
  //       "id": userIdInt,
  //       "meetingNumber": meetingNumber
  //     });

  //     var config = {
  //       method: 'delete',
  //       url: 'http://121.37.24.76:8079/meeting/kick',
  //       headers: { 
  //           'token': localStorage.getItem('token'), 
  //           'Content-Type': 'application/json'
  //       },
  //       data : data
  //     };

  //     axios(config)
  //     .then(function (response) {
  //       console.log(response.data);
  //       if(response.data.code === 1){
  //         ElMessage.success('踢除用户成功');
  //         fetchUsers();
  //         updateMembers();
          
  //       }else {
  //         ElMessage.error('踢除用户失败');
  //       }
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  //   } catch (error) {
  //     console.error('踢除用户失败:', error.response ? error.response.data : error.message);
  //     ElMessage.error('踢除用户失败: ' + error.message);
  //   } 

  //   // 实现踢除用户的逻辑
  // };
  const kickUser = async (userId) => {
  if (!meetingNumber) {
    ElMessage.error('会议号未找到');
    return;
  }

  const user = users.value.find(user => user.id === userId);
  if (!user) {
    ElMessage.error('用户未找到');
    return;
  }

  ElMessageBox.confirm(`确认踢除用户 ${user.username} 吗？`, '踢除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const userIdInt = parseInt(userId, 10); // 确保 userId 为整数
      console.log('踢除用户:', { id: userIdInt, meetingNumber: meetingNumber });
      const data = JSON.stringify({
        "id": userIdInt,
        "meetingNumber": meetingNumber
      });

      const config = {
        method: 'delete',
        url: 'http://121.37.24.76:8079/meeting/kick',
        headers: { 
          'token': localStorage.getItem('token'), 
          'Content-Type': 'application/json'
        },
        data: data
      };

      const response = await axios(config);
      console.log(response.data);
      if (response.data.code === 1) {
        ElMessage.success('踢除用户成功');
        fetchUsers();
        updateMembers();
      } else {
        ElMessage.error('踢除用户失败');
        console.error('踢除用户失败:', response);
      }
    } catch (error) {
      console.error('踢除用户失败:', error.response ? error.response.data : error.message);
      ElMessage.error('踢除用户失败: ' + error.message);
    }
  }).catch(() => {
    // 用户点击取消
    ElMessage.info('已取消踢除用户');
  });
};
  </script>
  
  <template>
    <div class="meeting-footer">
      <el-button type="primary" @click="toggleMicStatus" style="min-width: 110px">
        <el-icon>
          <!-- <Microphone v-if="micStatus" /> -->
          <Mute v-if="micStatus" />
          <!-- <Mute v-else /> -->
          <Microphone v-else />
        </el-icon>
        {{ micStatus ? '取消静音' : '静音' }}
      </el-button>
      <el-button type="primary" @click="InviteVisible = true">邀请</el-button>
      <el-button type="primary" @click="manageMembers">成员管理</el-button>
      <!-- <el-button type="primary" @click="convertSpeech">语音转文字</el-button>
      <el-button type="primary" @click="translate">翻译</el-button> -->
      <!-- 添加文件输入 -->
      <input type="file" @change="handleFileUpload" style="display:none" ref="fileInput" />
      <!-- <el-button type="primary" @click="triggerFileInput">会议文件</el-button> -->
      <!-- <el-button type="primary" @click="fileListVisible = true">会议文件</el-button> -->
      <el-button type="primary" @click="showFileList">会议文件</el-button>

      <!-- <el-button type="primary" @click="settings">设置</el-button> -->
      <el-button type="danger" @click="confirmLeaveMeeting">退出会议</el-button>
  
      <el-dialog v-model="InviteVisible" title="邀请" width="300" center>
        <div>
          <p><strong>会议号:</strong> {{ meetingNumber }}</p>
          <p><strong>会议密码:</strong> {{ meetingPassword }}</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="InviteVisible = false">取消</el-button>
            <el-button type="primary" @click="copyToClipboard">复制</el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog v-model="confirmLeaveVisible" title="确认退出" width="300" center>
        <div>
          <p>您确定要退出会议吗？</p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="confirmLeaveVisible = false">取消</el-button>
            <el-button type="primary" @click="handleLeaveMeeting">确认</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="manageMembersVisible" title="成员管理" width="400" center>
        <div class="dialog-content" style="min-height: 350px; max-height: 350px; overflow-y: auto;">
          <div v-if="users.length === 0">
            <p>当前没有成员在会。</p>
          </div>
          <div v-else>
            <div v-for="user in users" :key="user.id" class="member-item">
              <el-avatar :src="user.avatar" class="member-avatar" />
              <!-- <span class="member-name">{{ user.id }}</span> -->
              <span class="member-name">{{ user.username }}</span>
              <div class="permission-and-kick" style="display: flex; justify-content: flex-end; align-items: center;">
                <div v-if="user.permission === 2">
                <el-button type="primary" disabled style="width: 90px;">创建者</el-button>
              </div>
              <div v-else>
                <el-select 
                  v-model="user.permission" 
                  @change="updatePermission(user.id, user.permission)" 
                  placeholder="选择权限" 
                  style="width: 90px; margin-right: 10px;"
                  :disabled="getPermission() === 0"
                >
                  <el-option :value="0" label="与会者" />
                  <el-option :value="1" label="管理员" />
                </el-select>
              </div>
                <el-button 
                  type="danger" 
                  class="kick-button" 
                  @click="kickUser(user.id)" 
                  :disabled="user.permission === 2 || getPermission() === 0"
                >
                  踢除
                </el-button>  
              </div>
            </div>
            <!-- <span>{{ getPermission() }}</span> -->
          </div>
        </div>
      </el-dialog>
      <el-dialog v-model="fileListVisible" title="会议文件列表" width="600px" center>
        <div>
          <el-button type="primary" @click="triggerFileInput">上传文件</el-button>
          <el-table :data="files" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" width="400" />
            <el-table-column prop="fileType" label="文件类型" width="100" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="handleDownloadFile(scope.row.fileId)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="fileListVisible = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>

  <style scoped>
  .meeting-footer {
    background-color: #f5f7fa;
    display: flex;
    justify-content: space-between;
    padding: 10px;
  }
  .member-item {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 将内容和按钮放在两端 */
  margin-bottom: 10px;
}

.member-avatar {
  margin-right: 10px;
}

.member-name {
  font-size: 16px; /* 增大用户名字体 */
  font-weight: bold; /* 加粗用户名字体 */
  margin-right: 90px;
}

.permission-and-kick {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.kick-button {
  margin-left: 10px; /* 将踢除按钮放在最右侧 */
}
  </style>
  