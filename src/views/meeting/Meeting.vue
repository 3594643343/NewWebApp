<script setup>
import MeetingHeader from '@/components/layouts/MeetingHeader.vue';
import MeetingSider from '@/components/layouts/MeetingSider.vue';
</script>

<template>
    <div class="common-layout">
      <el-container>
        <el-header>
            <MeetingHeader />
        </el-header>
        <el-container>
          <el-aside width="200px" hegiht="100%">
            <MeetingSider />
          </el-aside>
          <el-container>
            <el-main>Main</el-main>
            <el-footer>Footer</el-footer>
          </el-container>
        </el-container>
      </el-container>
    </div>
</template>