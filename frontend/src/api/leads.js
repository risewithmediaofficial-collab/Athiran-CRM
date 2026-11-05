import api from '../config/api'

export const leadsApi = {
  getLeads: (params) => api.get('/leads', { params }),
  createLead: (data) => api.post('/leads', data),
  getLead: (id) => api.get(`/leads/${id}`),
  updateLead: (id, data) => api.patch(`/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  assignLead: (id, data) => api.post(`/leads/${id}/assign`, data),
  reassignLead: (id, data) => api.post(`/leads/${id}/reassign`, data),
  getActivities: (id) => api.get(`/leads/${id}/activities`),
  addActivity: (id, data) => api.post(`/leads/${id}/activities`, data),
  getStats: () => api.get('/leads/stats/summary'),
  bulkAssign: (data) => api.post('/leads/bulk/assign', data),
}

export default leadsApi

