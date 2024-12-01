import request from '../utils/request';

//用户注册
export const userRegisterService = ({userName, userEmail, userPassword,checkPassword}) => 
    request.post('/register', {userName, userEmail, userPassword,checkPassword})

//用户登录
export const userLoginService = ({userName, userEmail, userPassword}) => 
    request.post('/login', {userName, userEmail, userPassword})