

<script setup>


import 'element-plus/dist/index.css'

// import {ElMenu,ElMenuItem,ElSubMenu} from 'element-plus';
import {ElRadioGroup,ElTabs,ElTabPane,ElRadioButton} from 'element-plus';


import { ref } from 'vue'

// const tabPosition = ref('top')
const tabPosition = ref('left')
</script>

<template>
  <!-- <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
    <el-radio-button label="top">top</el-radio-button>
    <el-radio-button label="right">right</el-radio-button>
    <el-radio-button label="bottom">bottom</el-radio-button>
    <el-radio-button label="left">left</el-radio-button>
  </el-radio-group> -->

  <el-tabs :tab-position="tabPosition" style="height: 400px" class="demo-tabs">
    <button>???</button>
    <el-tab-pane label="User">
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>


    </el-tab-pane>
    <el-tab-pane label="Config">Config</el-tab-pane>
    <el-tab-pane label="Role">Role</el-tab-pane>
    <el-tab-pane label="Task">Task</el-tab-pane>
  </el-tabs>
</template>





<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>
