<template>
  <div>
    <!-- Include the NavBar at the top of the page -->
    <NavBar />

    <!-- Search and Add Company Button -->
    <el-input v-model="search" placeholder="Search..." @input="searchQuery" clearable />
    <el-button type="primary" @click="showAddDialog = true">Add Company</el-button>

    <!-- Companies Table -->
    <el-table :data="companies" stripe>
      <el-table-column prop="name" label="Company Name">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="code" label="Company Code">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.code" />
          <span v-else>{{ row.code }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Employees">
        <template v-slot:default="{ row }">
          <el-link type="primary" @click="viewEmployees(row.id)">View Employees</el-link>
        </template>
      </el-table-column>

      <el-table-column label="Actions">
        <template v-slot:default="{ row }">
          <el-button v-if="editingRow !== row.id" @click="startEdit(row.id)">Edit</el-button>
          <el-button v-if="editingRow === row.id" @click="saveEdit(row)">Save</el-button>
          <el-button v-if="editingRow === row.id" @click="cancelEdit">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete(row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      v-model:current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      @current-change="fetchCompanies"
    />

    <!-- Add Company Dialog -->
    <el-dialog v-model="showAddDialog" title="Add Company" width="50%">
      <el-form :model="newCompany">
        <el-form-item label="Company Name">
          <el-input v-model="newCompany.name" />
        </el-form-item>
        <el-form-item label="Company Code">
          <el-input v-model="newCompany.code" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="addCompany">Add</el-button>
      </template>
    </el-dialog>

    <!-- Employees List Modal -->
    <el-dialog v-model="showEmployeeDialog" title="Employees of Company" width="50%">
      <el-table :data="employees" stripe>
        <el-table-column prop="name" label="Employee Name" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="position" label="Position" />
        <el-table-column prop="salary" label="Salary" />
        <el-table-column prop="company.name" label="Company" />
      </el-table>
      <template v-slot:footer>
        <el-button @click="showEmployeeDialog = false">Close</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import { api } from '@/api/api'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'CompaniesPage',
  components: {
    NavBar, // Register the NavBar component
  },
  data() {
    return {
      companies: [],
      search: '',
      pagination: { page: 1, size: 10, total: 0 },
      editingRow: null,
      originalData: {},
      showEmployeeDialog: false,
      employees: [],
      showAddDialog: false,
      newCompany: { name: '', code: '' },
      searchTimeout: null,
    }
  },
  mounted() {
    this.fetchCompanies()
  },
  methods: {
    async fetchCompanies() {
      const params = {
        search: this.search,
        currentPage: this.pagination.page,
        elementsPerPage: this.pagination.size,
      }
      const { data } = await api.getCompanies(params)
      this.companies = data.results
      this.pagination.total = data.totalElements

      // Adjust the page if the current search doesn't match the current page
      if (this.pagination.total === 0 && this.pagination.page > 1) {
        this.pagination.page -= 1 // Go back one page if no results on current page
        this.fetchCompanies() // Re-fetch companies for the new page
      }
    },

    searchQuery() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => this.fetchCompanies(), 500)
    },

    startEdit(id) {
      this.editingRow = id
      this.originalData[id] = { ...this.companies.find((c) => c.id === id) }
    },

    async saveEdit(row) {
      try {
        await api.updateCompany(row.id, { name: row.name, code: row.code })
        ElMessage.success('Updated successfully!')
        this.editingRow = null
      } catch {
        ElMessage.error('Update failed!')
      }
    },

    cancelEdit() {
      this.companies = this.companies.map((c) =>
        c.id === this.editingRow ? this.originalData[c.id] : c,
      )
      this.editingRow = null
    },

    confirmDelete(id) {
      ElMessageBox.confirm('Are you sure to delete?', 'Warning', { type: 'warning' })
        .then(() => this.deleteCompany(id))
        .catch(() => {})
    },

    async deleteCompany(id) {
      await api.deleteCompany(id)
      ElMessage.success('Deleted successfully!')
      this.fetchCompanies()
    },

    async addCompany() {
      try {
        await api.addCompany(this.newCompany)
        ElMessage.success('Company added successfully!')
        this.showAddDialog = false
        this.newCompany = { name: '', code: '' }
        this.fetchCompanies()
      } catch {
        ElMessage.error('Failed to add company!')
      }
    },

    async viewEmployees(companyId) {
      try {
        const { data } = await api.getCompanyEmployees(companyId)
        this.employees = data.results
        this.showEmployeeDialog = true
      } catch {
        ElMessage.error('Failed to fetch employees for this company.')
      }
    },
  },
}
</script>
