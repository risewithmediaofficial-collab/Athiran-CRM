import api from '../config/api'

export const tractorModelsApi = {
  getModels: (params) => api.get('/tractor-models', { params }),
  getModel: (id) => api.get(`/tractor-models/${id}`),
  createModel: (data) => api.post('/tractor-models', data),
  updateModel: (id, data) => api.patch(`/tractor-models/${id}`, data),
  deleteModel: (id) => api.delete(`/tractor-models/${id}`),
}

export default tractorModelsApi

