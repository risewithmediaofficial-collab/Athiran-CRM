import api from '../config/api'

export const followupsApi = {
  getFollowUps: (params) => api.get('/followups', { params }),
  createFollowUp: (data) => api.post('/followups', data),
  getFollowUp: (id) => api.get(`/followups/${id}`),
  updateFollowUp: (id, data) => api.patch(`/followups/${id}`, data),
  completeFollowUp: (id, data) => api.post(`/followups/${id}/complete`, data),
  deleteFollowUp: (id) => api.delete(`/followups/${id}`),
}

export default followupsApi
