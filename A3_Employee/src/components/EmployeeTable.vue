<template>
  <div>
    <!-- Toggle Add Employee Form -->
    <el-button
      @click="isAddEmployeeFormVisible = !isAddEmployeeFormVisible"
      type="primary"
      style="margin-bottom: 20px"
    >
      {{ isAddEmployeeFormVisible ? 'Hide Form' : 'Add Employee' }}
    </el-button>

    <!-- Employee Table -->
    <el-card class="mt-4">
      <el-input
        v-model="searchQuery"
        placeholder="Search Employee"
        @input="debouncedSearch"
        clearable
      />

      <el-table :data="paginatedEmployees" stripe class="mt-4" style="width: 100%">
        <el-table-column label="Name" prop="Name" width="180" />
        <el-table-column label="Email" prop="Email" width="220" />
        <el-table-column label="Position" prop="Position" width="180" />
        <el-table-column label="Salary" prop="Salary" width="150" />
        <el-table-column label="SssNumber" prop="SssNumber" width="200" />
        <el-table-column label="PagIbigNumber" prop="PagIbigNumber" width="200" />

        <!-- Actions -->
        <el-table-column label="Actions" width="180">
          <template v-slot:default="{ row }">
            <el-button v-if="!row.isEditing" @click="editEmployee(row)" size="small" type="primary">
              Edit
            </el-button>
            <el-button v-if="row.isEditing" @click="saveChanges(row)" size="small" type="success">
              Save
            </el-button>
            <el-button
              v-if="!row.isEditing"
              @click="deleteEmployee(row)"
              size="small"
              type="danger"
            >
              Delete
            </el-button>
            <el-button v-if="row.isEditing" @click="cancelEdit(row)" size="small">
              Cancel
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination Controls -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="filteredEmployees.length"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        layout="sizes, prev, pager, next, total"
        :page-sizes="[5, 10, 20, 50]"
      />
    </el-card>

    <!-- Add Employee Form -->
    <el-form :model="employeeForm" label-width="100px" v-if="isAddEmployeeFormVisible">
      <el-form-item label="Name">
        <el-input v-model="employeeForm.Name"></el-input>
      </el-form-item>
      <el-form-item label="Email">
        <el-input v-model="employeeForm.Email"></el-input>
      </el-form-item>
      <el-form-item label="Position">
        <el-input v-model="employeeForm.Position"></el-input>
      </el-form-item>
      <el-form-item label="Salary">
        <el-input v-model="employeeForm.Salary" type="number"></el-input>
      </el-form-item>
      <el-form-item label="SssNumber">
        <el-input v-model="employeeForm.SssNumber"></el-input>
      </el-form-item>
      <el-form-item label="PagIbigNumber">
        <el-input v-model="employeeForm.PagIbigNumber"></el-input>
      </el-form-item>
      <el-form-item label="Company">
        <el-select v-model="employeeForm.CompanyId" placeholder="Select Company">
          <el-option
            v-for="company in companies"
            :key="company.id"
            :label="company.Name"
            :value="company.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="addEmployee" type="primary">Add Employee</el-button>
        <el-button @click="cancelAdd" type="danger">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import debounce from 'lodash/debounce'

export default {
  data() {
    return {
      employees: [],
      searchQuery: '',
      employeeForm: {
        Name: '',
        Email: '',
        Position: '',
        Salary: 0,
        SssNumber: '',
        PagIbigNumber: '',
        CompanyId: null,
      },
      isAddEmployeeFormVisible: false,
      pagination: {
        currentPage: 1,
        pageSize: 10,
      },
      companies: [], // Holds company data for selection
    }
  },
  computed: {
    filteredEmployees() {
      if (!this.searchQuery) return this.employees
      return this.employees.filter((e) =>
        e.Name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      )
    },
    paginatedEmployees() {
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
      return this.filteredEmployees.slice(start, start + this.pagination.pageSize)
    },
  },
  methods: {
    async fetchEmployees() {
      try {
        const { data } = await axios.get('http://localhost:5001/api/Employee')
        this.employees = data.data || []
      } catch {
        ElMessage.error('Error fetching employees')
      }
    },

    async fetchCompanies() {
      try {
        const { data } = await axios.get('http://localhost:5001/api/Company')
        this.companies = data.data
      } catch {
        ElMessage.error('Error fetching companies')
      }
    },

    async addEmployee() {
      try {
        await axios.post('http://localhost:5001/api/Employee', this.employeeForm)
        ElMessage.success('Employee successfully added')
        this.fetchEmployees()
        this.isAddEmployeeFormVisible = false
      } catch {
        ElMessage.error('Error adding employee')
      }
    },

    async deleteEmployee(employee) {
      try {
        await axios.delete(`http://localhost:5001/api/Employee/${employee.Id}`)
        ElMessage.success('Employee deleted')
        this.fetchEmployees()
      } catch {
        ElMessage.error('Error deleting employee')
      }
    },

    editEmployee(employee) {
      employee.isEditing = true
    },

    async saveChanges(employee) {
      try {
        await axios.put(`http://localhost:5001/api/Employee/${employee.Id}`, employee)
        ElMessage.success('Employee updated')
        employee.isEditing = false
        this.fetchEmployees()
      } catch {
        ElMessage.error('Error updating employee')
      }
    },

    cancelEdit(employee) {
      employee.isEditing = false
      this.fetchEmployees() // Reset data
    },

    handlePageChange(newPage) {
      this.pagination.currentPage = newPage
    },

    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.pagination.currentPage = 1
    },

    debouncedSearch: debounce(function () {
      this.pagination.currentPage = 1
    }, 500),
  },
  mounted() {
    this.fetchEmployees()
    this.fetchCompanies()
  },
}
</script>

<style scoped>
.el-card {
  padding: 16px;
}
</style>
