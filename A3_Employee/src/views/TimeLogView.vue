<template>
  <div>
    <NavBar />
    <el-input v-model="search" placeholder="Search..." @input="searchQuery" clearable />
    <el-button type="primary" @click="showAddDialog = true">Add Time Log</el-button>

    <el-table :data="timeLogs" stripe>
      <!-- Employee Name Column -->
      <el-table-column prop="employeeName" label="Employee Name">
        <template v-slot:default="{ row }">
          <span>{{ row.employeeName || 'Unknown' }}</span>
        </template>
      </el-table-column>

      <!-- Clock In Time -->
      <el-table-column prop="dateTimeInUtc" label="Clock In Time">
        <template v-slot:default="{ row }">
          <span>{{ formatDate(row.dateTimeInUtc) }}</span>
        </template>
      </el-table-column>

      <!-- Clock Out Time -->
      <el-table-column prop="dateTimeOutUtc" label="Clock Out Time">
        <template v-slot:default="{ row }">
          <span>{{ row.dateTimeOutUtc ? formatDate(row.dateTimeOutUtc) : 'Not Clocked Out' }}</span>
        </template>
      </el-table-column>

      <!-- Actions -->
      <el-table-column label="Actions">
        <template v-slot:default="{ row }">
          <el-button v-if="!row.dateTimeInUtc" @click="clockIn(row)">Clock In</el-button>
          <el-button v-if="row.dateTimeInUtc && !row.dateTimeOutUtc" @click="clockOut(row)"
            >Clock Out</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">
        Previous
      </button>
      <span>Page {{ pagination.page }} of {{ totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === totalPages">
        Next
      </button>
    </div>

    <!-- Add Time Log Dialog -->
    <el-dialog v-model="showAddDialog" title="Add Time Log" width="50%">
      <el-form :model="newTimeLog">
        <el-form-item label="Employee ID">
          <el-input v-model="newTimeLog.employeeId" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="addTimeLog">Add</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'TimeLogsPage',
  components: { NavBar },
  data() {
    return {
      timeLogs: [],
      employees: [],
      search: '',
      pagination: { page: 1, size: 10, total: 0 },
      showAddDialog: false,
      newTimeLog: { employeeId: '' },
      apiBaseUrl: 'https://localhost:5001',
      searchTimeout: null,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.size)
    },
  },
  mounted() {
    this.fetchEmployees().then(() => {
      this.fetchTimeLogs()
    })
  },
  methods: {
    // Fetch Employees from API (to match employeeId with employeeName)
    async fetchEmployees() {
      try {
        const { data } = await axios.get(`${this.apiBaseUrl}/employees`, {
          params: { search: this.search, page: this.pagination.page, size: this.pagination.size },
        })
        this.employees = data.data.results.map((emp) => ({
          id: emp.id,
          name: emp.name,
        }))
      } catch (error) {
        ElMessage.error('Failed to fetch employees.')
      }
    },

    // Fetch Time Logs and map employee names
    async fetchTimeLogs() {
      try {
        const { data } = await axios.get(`${this.apiBaseUrl}/TimeLogs`, {
          params: { search: this.search, page: this.pagination.page, size: this.pagination.size },
        })

        // Map employeeId to employeeName from the employees list
        this.timeLogs = data.data.results.map((log) => ({
          ...log,
          employeeName: this.employees.find((emp) => emp.id === log.employeeId)?.name || 'Unknown',
        }))

        this.pagination.total = data.data.totalElements || 0
      } catch (error) {
        ElMessage.error('Failed to load time logs.')
      }
    },

    // Pagination
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.pagination.page = newPage
        this.fetchEmployees().then(() => {
          this.fetchTimeLogs()
        })
      }
    },

    // Search with Debounce
    searchQuery() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.fetchEmployees().then(() => {
          this.fetchTimeLogs()
        })
      }, 500)
    },

    // Clock In Function
    async clockIn(row) {
      const currentTime = new Date().toISOString() // Get UTC time
      try {
        const payload = { employeeId: row.employeeId, dateTimeInUtc: currentTime }
        await axios.post(`${this.apiBaseUrl}/TimeLogs`, payload)
        ElMessage.success('Clocked in successfully!')
        this.fetchEmployees().then(() => {
          this.fetchTimeLogs()
        })
      } catch (error) {
        ElMessage.error('Failed to clock in.')
      }
    },

    // Clock Out Function
    async clockOut(row) {
      const currentTime = new Date().toISOString() // Get UTC time
      try {
        const payload = { dateTimeOutUtc: currentTime }
        await axios.put(`${this.apiBaseUrl}/TimeLogs/${row.employeeTimeLogId}`, payload)
        ElMessage.success('Clocked out successfully!')
        this.fetchEmployees().then(() => {
          this.fetchTimeLogs()
        })
      } catch (error) {
        ElMessage.error('Failed to clock out.')
      }
    },

    // Add Time Log (Creates Clock-In Entry)
    async addTimeLog() {
      const currentTime = new Date().toISOString() // Get UTC time
      try {
        const payload = { employeeId: this.newTimeLog.employeeId, dateTimeInUtc: currentTime }
        await axios.post(`${this.apiBaseUrl}/TimeLogs`, payload)
        ElMessage.success('Time log added successfully!')
        this.showAddDialog = false
        this.newTimeLog = { employeeId: '' }
        this.fetchEmployees().then(() => {
          this.fetchTimeLogs()
        })
      } catch (error) {
        ElMessage.error('Failed to add time log.')
      }
    },

    formatDate(utcDate) {
      if (!utcDate) return ''
      const date = new Date(utcDate)
      return date.toLocaleString()
    },
  },
}
</script>
