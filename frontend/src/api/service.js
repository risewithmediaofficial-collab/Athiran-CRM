import api from '../config/api'

export const serviceApi = {
  // Customers
  getCustomers: (params) => api.get('/customers', { params }),
  createCustomer: (data) => api.post('/customers', data),
  getCustomer: (id) => api.get(`/customers/${id}`),
  updateCustomer: (id, data) => api.patch(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  getCustomerTractors: (id) => api.get(`/customers/${id}/tractors`),
  getCustomerServices: (id) => api.get(`/customers/${id}/services`),

  // Tractors
  getTractors: (params) => api.get('/tractors', { params }),
  createTractor: (data) => api.post('/tractors', data),
  getTractor: (id) => api.get(`/tractors/${id}`),
  updateTractor: (id, data) => api.patch(`/tractors/${id}`, data),
  deleteTractor: (id) => api.delete(`/tractors/${id}`),
  getServicePrediction: (id) => api.get(`/tractors/${id}/next-service-prediction`),
  addMeterReading: (id, data) => api.post(`/tractors/${id}/meter-readings`, data),

  // Services
  getServices: (params) => api.get('/services', { params }),
  createService: (data) => api.post('/services', data),
  getService: (id) => api.get(`/services/${id}`),
  updateService: (id, data) => api.patch(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
  getServiceStats: () => api.get('/services/dashboard/stats'),
  getServiceCalendar: (params) => api.get('/services/calendar', { params }),
}

export default serviceApi
