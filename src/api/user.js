import request from '../utils/request';
import { ref } from 'vue';
const wschat = ref(null); // 聊天websocket实例

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
    console.log('websocket连接成功');
  };
  wschat.value.onmessage = (event) => {
    console.log('websocket接收到消息:', event.data);
  };
  wschat.value.onclose = () => {
    console.log('websocket连接关闭');
  };
  wschat.value.onerror = (error) => {
    console.error('websocket发生错误:', error);
  };
};
export const getWschat = () => wschat.value; // 导出 wschat 让其他模块也能使用
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
//获取在会用户信息
export const getInMeetingUsers = (meetingNumber) => {
    return request.get('/meeting/userlist', {
        params: {
            meetingNumber: meetingNumber // 作为查询参数传递
        }
    });
};
//修改与会者权限
export const updatePermissionAPI = ({id,meetingNumber,Permission}) => 
    request.put('/meeting/permissionchange', {id,meetingNumber,Permission})
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
//退出会议界面
export const exitMeetingService = () =>
    request.delete('/exit')
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
export const getChatRecord = ({friendId}) => 
    request.get('/friend/record', {
        params: {
            friendId: friendId // 作为查询参数传递
        }
    })
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
//加入群聊
export const joinGroup = ({groupId,groupPassword}) => 
    request.post('/group/join', {groupId,groupPassword})
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
//获取所有群聊信息

