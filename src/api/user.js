import request from '../utils/request';

//用户注册
export const userRegisterService = ({userName, userEmail, userPassword,checkPassword}) => 
    request.post('/register', {userName, userEmail, userPassword,checkPassword})

//用户登录
export const userLoginService = ({userName, userEmail, userPassword}) => 
    request.post('/login', {userName, userEmail, userPassword})

//加载用户信息
export const fetchUserProfile = () => 
    request.get('/userinfo/get')

//修改用户信息（昵称、签名）
export const updateUserProfileApi = ({ userName, signature}) => 
request.put('/userinfo/change/info', { userName, signature})

//获取会议列表
export const getMeetingRecordService = () =>
    request.get('/record/list')

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

//禁言
export const muteUser = ({userId,meetingNumber}) => 
    request.post('/meeting/mute', {userId,meetingNumber})

//解除禁言
export const disMuteUser = ({userId,meetingNumber}) => 
    request.post('/meeting/dismute', {userId,meetingNumber})

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


//显示日程
export const mainMeetingsShow = () => 
    request.get('/schedule/show')

//添加日程
export const mainMeetingsAdd = ({meetingNumber,meetingPassword}) => 
    request.post('/schedule/add', {meetingNumber,meetingPassword})

// 删除日程
export const mainMeetingsDelete = ({meetingNumber}) => 
    request.delete(`/schedule/cancle?meetingNumber=${meetingNumber}`)