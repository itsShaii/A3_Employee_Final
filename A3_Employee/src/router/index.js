import { createRouter, createWebHistory } from 'vue-router'
import CompaniesView from '../views/CompaniesView.vue'
import EmployeesView from '../views/EmployeesView.vue'
import TimeLogView from '../views/TimeLogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'CompaniesView',
      component: CompaniesView,
    },
    {
      path: '/employees',
      name: 'EmployeesView',
      component: EmployeesView,
    },
    {
      path: '/time-logs',
      name: 'TimeLogView',
      component: TimeLogView,
    },
  ],
})

export default router
