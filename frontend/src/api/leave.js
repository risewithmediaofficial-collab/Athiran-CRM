import api from '../config/api'

export const leaveApi = {
  getLeaves: (params) => api.get('/leave', { params }),
  applyLeave: (data) => api.post('/leave', data),
  getLeaveById: (id) => api.get(`/leave/${id}`),
  approveLeave: (id) => api.patch(`/leave/${id}/approve`),
  rejectLeave: (id, reason) => api.patch(`/leave/${id}/reject`, { rejectionReason: reason }),
  handoverLeads: (id, data) => api.post(`/leave/${id}/handover`, data),
  getCalendar: () => api.get('/leave/calendar'),
  deleteLeave: (id) => api.delete(`/leave/${id}`),
}

export default leaveApi

