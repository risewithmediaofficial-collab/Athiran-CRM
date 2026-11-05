import api from '../config/api'

export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key, data) => api.patch(`/settings/${key}`, data),
  bulkUpdateSettings: (settings) => api.post('/settings/bulk', { settings }),
}

export default settingsApi
