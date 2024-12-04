<script setup>
import MeetingHeader from '@/components/layouts/MeetingHeader.vue';
import MeetingSider from '@/components/layouts/MeetingSider.vue';
import MeetingFooter from '@/components/layouts/MeetingFooter.vue';
</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-header>
            <MeetingHeader />
        </el-header>
        <el-container>
          <el-aside width="250px" hegiht="100%">
            <MeetingSider />
          </el-aside>
          <el-container>
            <el-main>Main</el-main>
            <el-footer class="footer">
              <MeetingFooter />
            </el-footer>
          </el-container>
        </el-container>
      </el-container>
    </div>
</template>


<style lang="scss" scoped>
  .footer {
    font-size: 14px;
    color: #666;
  }

</style>
