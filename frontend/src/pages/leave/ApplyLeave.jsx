import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Calendar, ArrowLeft, Send, AlertCircle } from 'lucide-react'
import { leaveApi } from '../../api/leave'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function ApplyLeave() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Calculate day difference
  const start = new Date(formData.startDate)
  const end = new Date(formData.endDate)
  const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.reason.trim()) {
      setErrorMsg('Please specify the reason for your leave.')
      return
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMsg('End date cannot be earlier than start date.')
      return
    }
    try {
      setSubmitting(true)
      setErrorMsg('')
      await leaveApi.applyLeave({
        ...formData,
        numberOfDays: diffDays,
      })
      navigate('/leave')
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/leave">
          <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Apply for Leave</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit leave request for management approval and lead coverage
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div>
          <Select
            label="Leave Category"
            required
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            options={[
              { value: 'casual', label: 'Casual Leave (CL)' },
              { value: 'sick', label: 'Sick Leave (SL)' },
              { value: 'emergency', label: 'Emergency / Personal Leave' },
              { value: 'earned', label: 'Earned / Privilege Leave' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <Input
            label="End Date *"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
          <span>Calculated Absence Duration:</span>
          <span className="font-bold text-primary-700 text-sm">{diffDays} {diffDays === 1 ? 'Day' : 'Days'}</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave *</label>
          <textarea
            rows={4}
            placeholder="e.g. Attending family function in native village / Medical appointment..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            required
          />
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 space-y-1">
          <span className="font-semibold block">Customer Lead Handover Notice:</span>
          <span>During your approved leave, your active sales leads will be monitored under Option A (Admin Supervision) or temporarily reassigned to a colleague so no customer inquiry is missed.</span>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/leave">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" loading={submitting} icon={<Send className="w-4 h-4" />}>
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  )
}
