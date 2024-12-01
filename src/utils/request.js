import axios from 'axios';
import { ElMessage } from 'element-plus';
const baseURL = 'http://localhost:8079';

const instance = axios.create({
  baseURL,
  timeout: 10000,
});

instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    console.log("token:",token)
    if (token) {
        config.headers['token'] = token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

instance.interceptors.response.use(response => {
    const { data, status } = response;
    if (status === 200) {
        return data;
    } else {
        ElMessage.error(data.message);
        return Promise.reject(data);
    }
}, error => {
    ElMessage.error(error.message);
    return Promise.reject(error);
});

export default instance;
export { baseURL };
