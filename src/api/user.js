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

//显示日程
export const mainMeetingsShow = () => 
    request.get('/schedule/show')

//添加日程
export const mainMeetingsAdd = ({meetingNumber,meetingPassword}) => 
    request.post('/schedule/add', {meetingNumber,meetingPassword})

// 删除日程
export const mainMeetingsDelete = ({meetingNumber}) => 
    request.delete(`/schedule/cancle?meetingNumber=${meetingNumber}`)