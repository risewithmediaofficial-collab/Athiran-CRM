import api from '../config/api'

export const usersApi = {
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  updateStatus: (id, data) => api.patch(`/users/${id}/status`, data),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  getPerformance: (id) => api.get(`/users/${id}/performance`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/roles'),
  createRole: (data) => api.post('/roles', data),
  updateRole: (id, data) => api.patch(`/roles/${id}`, data),
}

export default usersApi

