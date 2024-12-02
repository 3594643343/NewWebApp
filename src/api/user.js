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