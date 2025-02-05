<template>
  <div>
    <NavBar />

    <el-input v-model="search" placeholder="Search Employees" @input="searchQuery" clearable />
    <el-button type="primary" @click="showAddDialog = true">Add Employee</el-button>

    <el-table :data="employees" stripe>
      <el-table-column prop="name" label="Name">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableName" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="email" label="Email">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableEmail" />
          <span v-else>{{ row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="position" label="Position">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editablePosition" />
          <span v-else>{{ row.position }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="salary" label="Salary">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableSalary" type="number" />
          <span v-else>{{ row.salary }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="sssNumber" label="SSS Number">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editableSssNumber" />
          <span v-else>{{ row.sssNumber }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="pagIbigNumber" label="Pag-IBIG Number">
        <template v-slot:default="{ row }">
          <el-input v-if="editingRow === row.id" v-model="row.editablePagIbigNumber" />
          <span v-else>{{ row.pagIbigNumber }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="company" label="Company">
        <template v-slot:default="{ row }">
          <el-select
            v-if="editingRow === row.id"
            v-model="row.editableCompanyId"
            placeholder="Select Company"
          >
            <el-option
              v-for="company in companies"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
          <span v-else>{{ row.company?.name || 'N/A' }}</span>
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

    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />

    <el-dialog v-model="showAddDialog" title="Add Employee" width="50%">
      <el-form :model="newEmployee">
        <el-form-item label="Name">
          <el-input v-model="newEmployee.name" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="newEmployee.email" />
        </el-form-item>
        <el-form-item label="Position">
          <el-input v-model="newEmployee.position" />
        </el-form-item>
        <el-form-item label="Salary">
          <el-input v-model="newEmployee.salary" type="number" />
        </el-form-item>
        <el-form-item label="SSS Number">
          <el-input v-model="newEmployee.sssNumber" />
        </el-form-item>
        <el-form-item label="Pag-IBIG Number">
          <el-input v-model="newEmployee.pagIbigNumber" />
        </el-form-item>
        <el-form-item label="Company">
          <el-select v-model="newEmployee.companyId" placeholder="Select Company">
            <el-option
              v-for="company in companies"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="addEmployee">Add</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'EmployeesPage',
  components: { NavBar },
  data() {
    return {
      employees: [],
      companies: [],
      search: '',
      pagination: { page: 1, size: 10, total: 0 },
      editingRow: null,
      showAddDialog: false,
      newEmployee: {
        name: '',
        email: '',
        position: '',
        salary: 0,
        sssNumber: '',
        pagIbigNumber: '',
        companyId: null,
      },
      apiBaseUrl: 'https://localhost:5001',
    }
  },
  mounted() {
    this.fetchCompanies().then(() => {
      this.fetchEmployees()
    })
  },
  methods: {
    async fetchEmployees() {
      try {
        const { data } = await axios.get(`${this.apiBaseUrl}/employees`, {
          params: { search: this.search, page: this.pagination.page, size: this.pagination.size },
        })
        this.employees = data.data.results.map((emp) => ({
          ...emp,
          editableName: emp.name,
          editableEmail: emp.email,
          editablePosition: emp.position,
          editableSalary: emp.salary,
          editableSssNumber: emp.sssNumber,
          editablePagIbigNumber: emp.pagIbigNumber,
          editableCompanyId: emp.companyId,
          company: this.companies.find((c) => c.id === emp.companyId) || { name: 'N/A' },
        }))
        this.pagination.total = data.data.totalElements
      } catch (error) {
        ElMessage.error('Failed to fetch employees.')
      }
    },

    async fetchCompanies() {
      try {
        const { data } = await axios.get(`${this.apiBaseUrl}/companies`)
        this.companies = data.data.results || []
      } catch (error) {
        ElMessage.error('Failed to fetch companies.')
      }
    },

    searchQuery() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1
        this.fetchEmployees()
      }, 500)
    },

    startEdit(row) {
      this.editingRow = row.id
    },

    async saveEdit(row) {
      try {
        await axios.put(`${this.apiBaseUrl}/employees/${row.id}`, {
          id: row.id,
          name: row.editableName,
          email: row.editableEmail,
          position: row.editablePosition,
          salary: row.editableSalary,
          sssNumber: row.editableSssNumber,
          pagIbigNumber: row.editablePagIbigNumber,
          companyId: row.editableCompanyId,
        })
        row.name = row.editableName
        row.email = row.editableEmail
        row.position = row.editablePosition
        row.salary = row.editableSalary
        row.sssNumber = row.editableSssNumber
        row.pagIbigNumber = row.editablePagIbigNumber
        row.company = this.companies.find((company) => company.id === row.editableCompanyId) || {
          name: 'N/A',
        }
        ElMessage.success('Employee updated!')
        this.editingRow = null
      } catch (error) {
        ElMessage.error('Failed to update employee.')
      }
    },

    cancelEdit(row) {
      row.editableName = row.name
      row.editableEmail = row.email
      row.editablePosition = row.position
      row.editableSalary = row.salary
      row.editableSssNumber = row.sssNumber
      row.editablePagIbigNumber = row.pagIbigNumber
      row.editableCompanyId = row.company ? row.company.id : null
      this.editingRow = null
    },

    confirmDelete(id) {
      ElMessageBox.confirm('Are you sure you want to delete this employee?', 'Confirm Delete', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
      })
        .then(() => {
          this.deleteEmployee(id)
        })
        .catch(() => {
          ElMessage.info('Delete action cancelled')
        })
    },

    async deleteEmployee(id) {
      try {
        await axios.delete(`${this.apiBaseUrl}/employees/${id}`)
        ElMessage.success('Employee deleted!')
        this.fetchEmployees()
      } catch (error) {
        ElMessage.error('Failed to delete employee.')
      }
    },

    async addEmployee() {
      try {
        await axios.post(`${this.apiBaseUrl}/employees`, this.newEmployee)
        ElMessage.success('Employee added!')
        this.showAddDialog = false
        this.newEmployee = {
          name: '',
          email: '',
          position: '',
          salary: 0,
          sssNumber: '',
          pagIbigNumber: '',
          companyId: null,
        }
        this.fetchEmployees()
      } catch (error) {
        ElMessage.error('Failed to add employee.')
      }
    },

    handlePageChange(newPage) {
      this.pagination.page = newPage
      this.fetchEmployees()
    },
  },
}
</script>
