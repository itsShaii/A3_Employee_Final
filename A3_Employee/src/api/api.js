import axios from 'axios'

const API_URL = 'https://localhost:44312'

export const api = {
  // Companies API
  getCompanies: (params) => axios.get(`${API_URL}/companies`, { params }),
  createCompany: (data) => axios.post(`${API_URL}/companies`, data),
  updateCompany: (id, data) => axios.put(`${API_URL}/companies/${id}`, data),
  deleteCompany: (id) => axios.delete(`${API_URL}/companies/${id}`),

  // Employees API
  getEmployees: (params) => axios.get(`${API_URL}/employees`, { params }),
  createEmployee: (data) => axios.post(`${API_URL}/employees`, data),
  updateEmployee: (id, data) => axios.put(`${API_URL}/employees/${id}`, data),
  deleteEmployee: (id) => axios.delete(`${API_URL}/employees/${id}`),

  // Time Logs API
  getTimeLogs: (params) => axios.get(`${API_URL}/time-logs`, { params }),
  createTimeLog: (data) => axios.post(`${API_URL}/time-logs`, data),
  updateTimeLog: (id, data) => axios.put(`${API_URL}/time-logs/${id}`, data), // Added data parameter for updating TimeLog
}
