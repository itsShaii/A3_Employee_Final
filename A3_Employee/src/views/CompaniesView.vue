<template>
  <div>
    <NavBar />
    <el-input v-model="search" placeholder="Search..." @input="searchQuery" clearable />
    <el-button type="primary" @click="showAddDialog = true">Add Company</el-button>
    <el-table :data="companies" stripe>
      <el-table-column prop="name" label="Company Name">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableName" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="Company Code">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableCode" />
          <span v-else>{{ row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Employees">
        <template v-slot:default="{ row }">
          <el-link type="primary" @click="viewEmployees(row)">View Employees</el-link>
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template v-slot:default="{ row }">
          <el-button v-if="editingRow !== row.id" @click="startEdit(row)">Edit</el-button>
          <el-button v-if="editingRow === row.id" @click="saveEdit(row)">Save</el-button>
          <el-button v-if="editingRow === row.id" @click="cancelEdit(row)">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete(row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination Controls -->
    <div class="pagination">
      <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1">
        Previous
      </button>
      <span>Page {{ pagination.page }} of {{ totalPages }}</span>
      <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'CompaniesPage',
  components: { NavBar },
  data() {
    return {
      companies: [],
      search: '',
      pagination: { page: 1, size: 10, total: 0 },
      editingRow: null,
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
    this.fetchCompanies()
  },
  methods: {
    async fetchCompanies() {
      try {
        const { data } = await axios.get(`${this.apiBaseUrl}/companies`, {
          params: {
            search: this.search,
            page: this.pagination.page,
            size: this.pagination.size,
          },
        })
        this.companies = data.data.results.map((company) => ({
          ...company,
          editableName: company.name,
          editableCode: company.code,
        }))
        this.pagination.total = data.data.totalElements || 0
      } catch (error) {
        ElMessage.error('Failed to load companies.')
      }
    },
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.pagination.page = newPage
        this.fetchCompanies()
      }
    },
    searchQuery() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.fetchCompanies()
      }, 500)
    },
    async saveEdit(row) {
      try {
        await axios.put(`${this.apiBaseUrl}/companies/${row.id}`, {
          id: row.id,
          name: row.editableName,
          code: row.editableCode,
        })
        row.name = row.editableName
        row.code = row.editableCode
        ElMessage.success('Company updated successfully!')
        this.editingRow = null
      } catch (error) {
        ElMessage.error('Failed to update company.')
      }
    },
    cancelEdit(row) {
      row.editableName = row.name
      row.editableCode = row.code
      this.editingRow = null
    },
    confirmDelete(id) {
      ElMessageBox.confirm('Are you sure you want to delete this company?', 'Warning', {
        type: 'warning',
      })
        .then(() => this.deleteCompany(id))
        .catch(() => {})
    },
    async deleteCompany(id) {
      try {
        await axios.delete(`${this.apiBaseUrl}/companies/${id}`)
        ElMessage.success('Deleted successfully!')
        this.fetchCompanies()
      } catch (error) {
        ElMessage.error('Failed to delete company.')
      }
    },
  },
}
</script>
