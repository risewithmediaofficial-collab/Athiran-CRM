import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Building2, 
  Save, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react'
import { settingsApi } from '../../api/settings'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    dealershipName: 'Athiran Motors Dealer CRM',
    contactNumber: '+91 98421 56789',
    supportEmail: 'support@athiranmotors.com',
    location: 'Tiruppur District, Tamil Nadu',
    gstin: '33AAAAA0000A1Z5',
    standardServiceInterval: 250,
    dailyAverageEngineHours: 6.5,
    timezone: 'Asia/Kolkata (IST)',
    currency: 'INR (₹)',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const res = await settingsApi.getSettings()
        const settingsList = res.data?.data || []
        if (Array.isArray(settingsList) && settingsList.length > 0) {
          const map = {}
          settingsList.forEach(s => {
            map[s.key] = s.value
          })
          setFormData(prev => ({ ...prev, ...map }))
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setErrorMsg('')
      setSuccessMsg('')

      const bulkPayload = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }))

      await settingsApi.bulkUpdateSettings(bulkPayload)
      setSuccessMsg('Dealership configuration settings updated successfully.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading dealership configuration..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System & Dealership Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Dealer corporate identity, tractor maintenance intervals, and localization standards
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dealership Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" />
            1. Dealership Profile & Invoicing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dealership Legal Name *"
              value={formData.dealershipName}
              onChange={(e) => setFormData({ ...formData, dealershipName: e.target.value })}
              required
            />
            <Input
              label="GSTIN Identification Number"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Contact Number"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
            <Input
              label="Official Support Email"
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
            />
          </div>

          <Input
            label="Dealership Headquarters / Workshop Address"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        {/* Engine-Hour Service Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-600" />
            2. Engine-Hour Predictive Algorithm
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Standard Maintenance Interval (Hours) *"
              type="number"
              value={formData.standardServiceInterval}
              onChange={(e) => setFormData({ ...formData, standardServiceInterval: Number(e.target.value) })}
              required
            />
            <Input
              label="Daily Average Operating Hours *"
              type="number"
              step="0.1"
              value={formData.dailyAverageEngineHours}
              onChange={(e) => setFormData({ ...formData, dailyAverageEngineHours: Number(e.target.value) })}
              required
            />
          </div>
          <p className="text-xs text-slate-500">
            These parameters train the automated predictive scheduler to forecast service dates when farmers do not regularly log meter readings.
          </p>
        </div>

        {/* Localization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            3. Localization & Standards
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="System Timezone"
              value={formData.timezone}
              disabled
            />
            <Input
              label="Default Currency"
              value={formData.currency}
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
