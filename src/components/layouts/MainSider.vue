<template>
  <el-row class="tac">
    <el-col :span="12">
      <h5 class="mb-2">我的会议</h5>
      <el-menu
        active-text-color="#0B0B0C"
        background-color="#fff"
        class="el-menu-vertical-demo"
        :default-active="activeItem"
        text-color="#0B0B0C"
        router
      >
        <el-menu-item index="/main/user" :class="{ 'active-item': activeItem === '/main/user' }" >
          <el-icon><user /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="/main/schedule" :class="{ 'active-item': activeItem === '/main/schedule' }" >
          <el-icon><Memo /></el-icon>
          <span>我的日程</span>
        </el-menu-item>
        <el-menu-item index="/main/record" :class="{ 'active-item': activeItem === '/main/record' }">
          <el-icon><document /></el-icon>
          <span>会议记录</span>
        </el-menu-item>
        <el-menu-item index="/main/friend" :class="{ 'active-item': activeItem === '/main/friend' }" >
          <el-icon><Message /></el-icon>
          <span>好友</span>
        </el-menu-item>
        <br><br><br><br><br><br><br><br><br><br><br><br><br>
        <el-menu-item index="/main/chat" :class="{ 'active-item': activeItem === '/main/chat' }" >
          <el-icon><ChatDotRound /></el-icon>
          <span>消息</span>
        </el-menu-item>
        <br><br><br><br><br><br><br><br>
        <el-menu-item index="/main/setting" :class="{ 'active-item': activeItem === '/main/setting' }" >
          <el-icon><setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
        <el-menu-item plain @click="logoutDialogVisible = true">
          <el-icon><DArrowLeft /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
  <el-dialog
    v-model="logoutDialogVisible"
    title="确认退出"
    width="400"
    align-center
  >
    <span>您确定要退出登录吗？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="logoutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="logout">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const activeItem = ref('/main/user'); // 初始化为当前路由路径
const logoutDialogVisible = ref(false); // 退出登录弹窗可见性

// 当路由变化时更新 activeItem
watch(
  () => route.path,
  (newPath) => {
    // 你可以根据需要调整路径以匹配你的菜单项 index
    // 例如，如果你的菜单项 index 是 '/main/user' 而不是简单的 '/user'
    // 你可能需要在这里做一些字符串处理来匹配它们
    activeItem.value = newPath.startsWith('/main') ? newPath : '/main/user'; // 默认回到个人资料
  },
  { immediate: true } // 立即执行一次以设置初始值
);

const logout = () => {
  localStorage.removeItem('userProfile'); // 清除用户数据
  router.push('/accountlogin'); // 跳转到登录页面
  // 注意：这里你可能需要重置 activeItem 到一个默认值，比如 '/main/user' 或 '/accountlogin'（取决于你的设计）
  // activeItem.value = '/accountlogin'; // 如果你想在登出后显示登录页面的菜单项作为激活状态（如果有的话）
  // 但是，由于登出后用户可能会看到登录页面，而没有侧边栏菜单，所以这可能不是必要的
};
</script>

<style lang="scss" scoped>
.tac {
  text-align: center;
  margin-top: 20px;
}

.mb-2 {
  margin-bottom: 20px;
  margin-top: 2px;
}

.mb-5 {
  margin-bottom: 5px;
  position: fixed;
  left: 0;
}

.el-menu-item-group {
  margin-top: 10px;
}

.el-menu-vertical-demo {
  width: 200px;
}

.el-menu-item {
  padding: 10px 20px;
  transition: background-color 0.1s;
  cursor: pointer;
  position: relative;
  border-radius: 8px;
  &.active-item {
    background-color: #2581EA; /* 当前激活的背景颜色 */
    color: #fff; /* 当前激活的字体颜色 */
  }
}
</style>
