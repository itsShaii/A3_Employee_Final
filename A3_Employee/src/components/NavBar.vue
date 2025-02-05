<!-- src/components/NavBar.vue -->
<template>
  <el-menu mode="horizontal" router>
    <el-menu-item index="/">Companies</el-menu-item>
    <el-menu-item index="/employees">Employees</el-menu-item>
    <el-menu-item index="/time-logs">Time Logs</el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: 'NavBar',
}
</script>
