import api from '../config/api'

export const reportsApi = {
  getSalesOverview: (params) => api.get('/reports/sales/overview', { params }),
  getLeadsBySource: (params) => api.get('/reports/sales/leads-by-source', { params }),
  getEmployeePerformance: (params) => api.get('/reports/sales/employee-performance', { params }),
  getServiceOverview: (params) => api.get('/reports/service/overview', { params }),
  getServiceWorkload: (params) => api.get('/reports/service/workload', { params }),
}

export default reportsApi

