<template>
  <el-row class="tac">
    <el-col :span="12">
      <h5 class="mb-2">我的会议</h5>
      <el-menu
        active-text-color="#0B0B0C"
        active-bg-color="#F5F5F5"
        background-color="#fff"
        class="el-menu-vertical-demo"
        default-active="2"
        text-color="#0B0B0C"
        router
      >
        <el-menu-item index="/main/user" >
          <el-icon><user /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="/main/record">
          <el-icon><document /></el-icon>
          <span>会议记录</span>
        </el-menu-item>
        <el-menu-item index="/main/friend" >
          <el-icon><ChatDotRound /></el-icon>
          <span>好友</span>
        </el-menu-item>
        <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
        <el-menu-item index="/main/setting">
          <el-icon><setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
        <el-menu-item index="/main/register">
          <el-icon><DArrowLeft /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Orange,
  Setting,
} from '@element-plus/icons-vue'

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
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
  &:hover {
    background-color: #2581EA; /* 鼠标悬停时的背景颜色 */
    color: #fff; /* 鼠标悬停时的字体颜色 */
    }
}

</style>