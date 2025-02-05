<template>
  <div class="p-6 space-y-6">
    <!-- Clock In Section -->
    <el-card class="shadow-md p-6 rounded-lg">
      <div class="flex items-center space-x-4">
        <el-input v-model="employeeId" placeholder="Enter Employee ID" clearable class="w-1/3" />
        <el-button type="primary" @click="clockIn" class="px-6">Clock In</el-button>
      </div>
    </el-card>

    <!-- Time Logs Table -->
    <el-card class="shadow-md p-6 rounded-lg">
      <div class="flex justify-between items-center mb-4">
        <el-input
          v-model="search"
          placeholder="Search by Employee Name"
          @input="debouncedSearch"
          clearable
          class="w-1/3"
        />
      </div>

      <el-table :data="filteredTimeLogs" stripe class="rounded-lg shadow-md">
        <el-table-column prop="EmployeeName" label="Employee Name" sortable width="250" />
        <el-table-column prop="DateTimeInUtc" label="Clock In Time" sortable width="250" />
        <el-table-column prop="DateTimeOutUtc" label="Clock Out Time" width="250">
          <template v-slot="{ row }">
            <span v-if="row?.DateTimeOutUtc">{{ row.DateTimeOutUtc }}</span>
            <el-button v-else type="danger" @click="clockOut(row.EmployeeTimeLogId)">
              Clock Out
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination Controls -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="filteredTimeLogs.length"
          @current-change="fetchTimeLogs"
          @size-change="handleSizeChange"
          layout="sizes, prev, pager, next, total"
          :page-sizes="[5, 10, 20, 50]"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import debounce from 'lodash/debounce'

export default {
  data() {
    return {
      employeeId: '',
      timeLogs: [],
      search: '',
      pagination: { page: 1, size: 10, total: 0 },
    }
  },
  computed: {
    filteredTimeLogs() {
      let filtered = this.timeLogs
      if (this.search) {
        const searchTerm = this.search.toLowerCase()
        filtered = this.timeLogs.filter((log) =>
          log.EmployeeName.toLowerCase().includes(searchTerm),
        )
      }
      return filtered.slice(
        (this.pagination.page - 1) * this.pagination.size,
        this.pagination.page * this.pagination.size,
      )
    },
  },
  methods: {
    async clockIn() {
      if (!this.employeeId) {
        return ElMessage.warning('Please enter Employee ID')
      }
      try {
        const response = await axios.post('/EmployeeTimeLogs', { EmployeeId: this.employeeId })
        if (response.data.status) {
          ElMessage.success('Clocked in successfully')
          this.fetchTimeLogs()
          this.employeeId = ''
        } else {
          ElMessage.error(response.data.message)
        }
      } catch {
        ElMessage.error('Error clocking in')
      }
    },

    async clockOut(timeLogId) {
      try {
        const response = await axios.put(`/EmployeeTimeLogs/${timeLogId}`)
        if (response.data.status) {
          ElMessage.success('Clocked out successfully')
          this.fetchTimeLogs()
        } else {
          ElMessage.error(response.data.message)
        }
      } catch {
        ElMessage.error('Error clocking out')
      }
    },

    async fetchTimeLogs() {
      try {
        const response = await axios.get('/EmployeeTimeLogs', { params: { search: this.search } })
        this.timeLogs = response.data.data.items || []
        this.pagination.total = this.timeLogs.length
      } catch {
        ElMessage.error('Error fetching time logs')
      }
    },

    handleSizeChange(newSize) {
      this.pagination.size = newSize
      this.pagination.page = 1
    },

    debouncedSearch: debounce(function () {
      this.pagination.page = 1
      this.fetchTimeLogs()
    }, 500),
  },
  mounted() {
    this.fetchTimeLogs()
  },
}
</script>

<style scoped>
.p-6 {
  padding: 1.5rem;
}
.space-y-6 > * + * {
  margin-top: 1.5rem;
}
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.rounded-lg {
  border-radius: 0.75rem;
}
.w-1\/3 {
  width: 33%;
}
</style>
