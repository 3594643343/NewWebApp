import request from '../utils/request';
import { ref } from 'vue';
import emitter from '@/main.js'; // 根据实际路径调整引入
import exp from 'constants';
import { head } from 'lodash';


let wschat = ref(null); // 聊天websocket实例

export const closewschat = () => {
  if (wschat.value) {
    wschat.value.close();
  }
};
// 页面加载完成后，初始化聊天websocket
export const initWschat = () => {
    if (wschat.value) {
      wschat.value.close();
    }
  wschat.value = new WebSocket('ws://121.37.24.76:8079/chat/'+localStorage.getItem('userId'));
    wschat.value.onopen = () => {
      console.log('websocketChat连接成功');
    };
    wschat.value.onmessage = (event) => {
        console.log('websocketChat接收到消息:', event.data);
        try {
            const receivedMessage = JSON.parse(event.data);
            // 触发事件总线的消息更新事件，传递接收到的消息数据
            emitter.emit('messageReceived', receivedMessage);
        } catch (error) {
            console.error('解析WebSocket接收的消息出现错误:', error);
            console.error('接收到的原始消息内容为:', event.data);
        }
    };
    wschat.value.onclose = () => {
      console.log('websocketChat连接关闭');
    };
    wschat.value.onerror = () => {
      console.error('websocketChat发生错误:', error);
    };
  };
  
  
  export const getWschat = () => wschat.value;
//用户注册
export const userRegisterService = ({userName, userEmail, userPassword,checkPassword}) => 
    request.post('/register', {userName, userEmail, userPassword,checkPassword})
//用户登录
export const userLoginService = ({userName, userEmail, userPassword}) => 
    request.post('/login', {userName, userEmail, userPassword})
//加载用户信息
export const fetchUserProfile = () => 
    request.get('/userinfo/get')
//修改头像
export const updateUserAvatarApi = (avatar) => 
    request.put('/userinfo/change/avatar', avatar, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
//修改用户信息（昵称、签名）
export const updateUserProfileApi = ({ userName, signature}) => 
request.put('/userinfo/change/info', { userName, signature})
//修改密码
export const updateUserPasswordApi = ({ oldPassword, newPassword, confirmPassword }) => {
    const queryParams = new URLSearchParams({
        oldPassword,
        newPassword,
        confirmPassword
    });
    return request.put(`/userinfo/change/password?${queryParams.toString()}`);
}

//修改是否需要验证
export const updateUserNeedCheckApi = ({ needCheck }) => {
    const queryParams = new URLSearchParams({
      needCheck: needCheck // 作为查询参数传递
    });
    return request.post(`/userinfo/change/needCheck?${queryParams.toString()}`);
  };

//获取会议记录列表
export const getMeetingRecordService = () =>
    request.get('/record/list')
//获取会议详情
export const getMeetingDetailService = (recordId) =>
    request.get('/record/detail', {
        params: {
            recordId: recordId // 作为查询参数传递
        }
    })
//会议记录中获取文件列表
export const getMeetingFileListService = (recordId) =>
    request.get('/record/get/fileList', {
        params: {
            recordId: recordId // 作为查询参数传递
        }
    })
//下载会议记录文件
export const downloadMeetingFileService = (fileId) =>
    request.get('/record/download', {
        params: {
            fileId: fileId // 作为查询参数传递
        },
        responseType: 'blob' // 下载文件需设置 responseType 为 blob
    })
//删除会议记录
export const deleteMeetingRecordService = (recordId) =>
    request.delete('/record/delete', {
        params: {
            recordId: recordId // 作为查询参数传递
        }
    })
//创建会议
export const bookMeetingService = ({meetingName,meetingStartTime,meetingEndTime,meetingPassword,defaultPermission}) =>
    request.post('/menu/book', {meetingName,meetingStartTime,meetingEndTime,meetingPassword,defaultPermission})
//加入会议
export const joinMeetingService = ({meetingNumber,meetingPassword}) =>
    request.post('/menu/join', {meetingNumber,meetingPassword})
//快速会议
export const quickMeetingService = () =>
    request.get('/menu/quick')
// 获取会议名称
export const getMeetingName = (meetingNumber) => {
    if (!meetingNumber) {
        console.error('meetingNumber 不能为空');
        return Promise.reject(new Error('meetingNumber 不能为空'));
    }
    return request.get('/meeting/get/meetingName', {
        params: {
            meetingNumber: meetingNumber // 作为查询参数传递
        }
    });
};

//获取在会用户信息
export const getInMeetingUsers = (meetingNumber) => {
    return request.get('/meeting/userlist', {
        params: {
            meetingNumber: meetingNumber // 作为查询参数传递
        }
    });
};
//修改与会者权限
export const updatePermissionAPI = (id,meetingNumber,Permission) => {
    return request.put('/meeting/permissionchange', {id,meetingNumber,permission:Permission})
};

    
    
//禁言
export const muteUser = ({userId,meetingNumber}) => 
    request.put('/meeting/mute', {userId,meetingNumber})
//解除禁言
export const disMuteUser = ({userId,meetingNumber}) => 
    request.put('/meeting/dismute', {userId,meetingNumber})
//上传文件
export const uploadFile = (meetingNumber, file) => {
    // 创建一个 FormData 对象以便上传文件
    const formData = new FormData();
    formData.append('file', file); // 将文件附加到 FormData 对象中

    // 发起请求
    return request.post('/meeting/uploadfile', formData, {
        params: {
            meetingNumber: meetingNumber // 作为查询参数传递
        },
        headers: {
            'Content-Type': 'multipart/form-data' // 指定内容类型为表单数据
        }
    });
};
//获取当前会议中文件列表
export const getCurrentMeetingFileList = () => 
    request.get('/meeting/get/fileList')
//下载当前会议文件
export const downloadCurrentMeetingFile = (fileId) =>
    request.get('/meeting/download', {
        params: {
            fileId: fileId // 作为查询参数传递
        },
        responseType: 'blob' // 下载文件需设置 responseType 为 blob
    })
//退出系统
export const exitSystem = () =>
    request.delete('/exit')
//会议中踢人
export const kickUserService = ( id, meetingNumber ) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    return request.delete('/meeting/kick',myHeaders, {id, meetingNumber });
}
//离开会议
export const leaveMeetingService = () =>
    request.get('/meeting/leave')
//显示日程
export const mainMeetingsShow = () => 
    request.get('/schedule/show')
//添加日程
export const mainMeetingsAdd = ({meetingNumber,meetingPassword}) => 
    request.post('/schedule/add', {meetingNumber,meetingPassword})
// 删除日程
export const mainMeetingsDelete = ({meetingNumber}) => 
    request.delete(`/schedule/cancle?meetingNumber=${meetingNumber}`)
//加入日程会议
export const joinScheduleMeeting = ({meetingnumber}) => 
    request.get('/schedule/join', {
        params: {
            meetingnumber: meetingnumber // 作为查询参数传递
        }
    })
// 管理员获取用户信息
export const adminGetUserList = () => 
    request.get('/admin/getall')
//管理员重置密码
export const adminResetPassword = ({userId}) => 
    request.get('/admin/reset', {
        params: {
            userId: userId // 作为查询参数传递
        }
    })
//获取用户所有好友id
export const getUserFriends = () => 
    request.get('/friend/get/allFriendId')
//获取一个好友信息
export const getOneFriend = ({friendId}) => {
    console.log("传入friendId", friendId)
    const intFriendId = parseInt(friendId, 10);
    console.log("intFriendId", intFriendId)

    if (isNaN(intFriendId)) {
        throw new Error('friendId 必须是一个有效的整数');
    }

    const queryParams = new URLSearchParams({
        friendId: intFriendId // 使用转换后的整数
    });
    
    return request.get(`/friend/get/friendInfo?${queryParams.toString()}`);

}
//获取所有好友信息
export const getAllFriends = () => 
    request.get('/friend/get/allFriendInfo')
//搜索好友
export const searchFriends = ({ friendId }) => {
    // 将 friendId 转换为整数
    const intFriendId = parseInt(friendId, 10);

    if (isNaN(intFriendId)) {
        throw new Error('friendId 必须是一个有效的整数');
    }

    const queryParams = new URLSearchParams({
        friendId: intFriendId // 使用转换后的整数
    });
    
    return request.post(`/friend/search?${queryParams.toString()}`);
}
//申请添加好友
export const applyAddFriend = ({friendId,checkWords}) => 
    request.post('/friend/add', {friendId,checkWords})
//获取一个人所有的验证消息
export const getMyApplyList = () => 
    request.get('/friend/checkmessage')
//处理添加好友验证
export const handleAddFriend = ({recordId,friendId,check}) => {
    const intFriendId = parseInt(friendId, 10);
    const intRecordId = parseInt(recordId, 10);
    const intCheck = parseInt(check, 10);

    if (isNaN(intFriendId) || isNaN(intRecordId)|| isNaN(intCheck)) {
        throw new Error('参数必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        recordId,
        friendId,
        check,  
    });
    
    return request.post(`/friend/deal?${queryParams.toString()}`);
}
//删除好友
export const deleteMyFriend = ({friendId}) => {
    const intFriendId = parseInt(friendId, 10);

    if (isNaN(intFriendId)) {
        throw new Error('friendId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        friendId: intFriendId,
    });
    console.log("queryParams", queryParams.toString())
    return request.delete(`/friend/delete?${queryParams.toString()}`);
}
//获取与一个好友的聊天记录
export const getChatRecord = ({friendId}) => {
    const intFriendId = parseInt(friendId, 10);
    console.log("intFriendId", intFriendId)
    console.log("friendId", friendId)
    if (isNaN(intFriendId)) {
        throw new Error('friendId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        friendId: intFriendId,
    });
    return request.get(`/friend/record?${queryParams.toString()}`);
}

    
//搜索群来聊天
export const searchGroup = ({ groupId }) => {
    // 将 groupId 转换为整数
    const intGroupId = parseInt(groupId, 10);

    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }

    const queryParams = new URLSearchParams({
        groupId: intGroupId // 使用转换后的整数
    });
    
    return request.post(`/group/search?${queryParams.toString()}`);
}
//获取是否在该群聊中
export const getIsInChat = ({groupId}) => 
    request.get('/group/get/isin', {
        params: {
            groupId: groupId // 作为查询参数传递
        }
    })
//创建群聊
export const createMyGroup = (formData) => {
    // console.log("userData", formData)
    return request.post('/group/create', formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
}
//申请加入群聊
export const applyJoinGroup = ({groupId,checkWords}) => {
    console.log("groupId", groupId)
    const intGroupId = parseInt(groupId, 10);
    console.log("intGroupId", intGroupId)
    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }
    return request.post('/group/add', {
        groupId: intGroupId,
        checkWords,
    });
}
    
//处理加入群聊验证
export const handleJoinGroup = ({recordId,groupId,userId,check}) => {
    const intGroupId = parseInt(groupId, 10);
    const intRecordId = parseInt(recordId, 10);
    const intuserId = parseInt(userId, 10);
    const intCheck = parseInt(check, 10);


    if (isNaN(intGroupId) || isNaN(intRecordId)|| isNaN(intCheck)|| isNaN(intuserId)) {
        throw new Error('参数必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        recordId,
        groupId,
        userId,
        check,  
    });
    
    return request.post(`/group/deal?${queryParams.toString()}`);
}
//获取用户所有群聊id
export const getUserGroups = () => 
    request.get('/group/get/allGroupId')
//获取一个群聊信息
export const getOneGroup = (groupId) => 
    request.get('/group/showGroupInfo', {
        params: {
            groupId: groupId // 作为查询参数传递
        }
    })

//获取群聊成员信息
export const getGroupMembers = ({groupId}) => {
    console.log("groupId", groupId)
    const intGroupId = parseInt(groupId, 10);
    console.log("intGroupId", intGroupId)
    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        groupId: intGroupId,
    });
    return request.get(`/group/getGroupMembers?${queryParams.toString()}`);
}
//获取一个群的聊天记录
export const getGroupChatRecord = ({groupId}) => {
    const intGroupId = parseInt(groupId, 10);

    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        groupId: intGroupId,
    });
    return request.get(`/group/record?${queryParams.toString()}`);
}

//解散群聊
export const dissolveGroup = ({groupId}) => {
    const intGroupId = parseInt(groupId, 10);

    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        groupId: intGroupId,
    });
    return request.post(`/group/disband?${queryParams.toString()}`);
}
//退出群聊
export const exitGroup = ({groupId}) => {
    const intGroupId = parseInt(groupId, 10);

    if (isNaN(intGroupId)) {
        throw new Error('groupId 必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        groupId: intGroupId,
    });
    return request.delete(`/group/delete?${queryParams.toString()}`);
}
//踢人
export const kickUser = ({groupId,userId}) => {
    const intGroupId = parseInt(groupId, 10);
    const intuserId = parseInt(userId, 10);

    if (isNaN(intGroupId) || isNaN(intuserId)) {
        throw new Error('参数必须是一个有效的整数');
    }
    const queryParams = new URLSearchParams({
        groupId,
        userId,
    });
    return request.post(`/group/kick?${queryParams.toString()}`);
}



