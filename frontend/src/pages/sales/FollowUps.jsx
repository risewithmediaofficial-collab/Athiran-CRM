import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Phone, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle,
  Eye 
} from 'lucide-react'
import { followupsApi } from '../../api/followups'
import { leadsApi } from '../../api/leads'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function FollowUps() {
  const navigate = useNavigate()
  const [followups, setFollowups] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all') // all, today, overdue, completed

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedFollowup, setSelectedFollowup] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Schedule / Edit Form
  const [formData, setFormData] = useState({
    lead: '',
    type: 'call',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    notes: '',
  })

  // Complete Form
  const [completeNotes, setCompleteNotes] = useState('')

  const fetchFollowups = async () => {
    try {
      setLoading(true)
      const [fRes, lRes] = await Promise.all([
        followupsApi.getFollowUps({ search, tab }),
        leadsApi.getLeads({ limit: 100 }),
      ])
      const fData = fRes.data?.data
      setFollowups(Array.isArray(fData) ? fData : fData?.followUps || [])
      const lData = lRes.data?.data
      setLeads(Array.isArray(lData) ? lData : lData?.leads || [])
    } catch (err) {
      console.error('Failed to load follow-ups:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowups()
  }, [search, tab])

  const handleOpenSchedule = () => {
    setFormData({
      lead: leads[0]?._id || '',
      type: 'call',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '10:00',
      notes: '',
    })
    setFormError('')
    setIsScheduleOpen(true)
  }

  const handleOpenEdit = (f) => {
    setSelectedFollowup(f)
    setFormData({
      lead: f.lead?._id || f.lead || '',
      type: f.type || 'call',
      scheduledDate: f.scheduledDate ? new Date(f.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: f.scheduledTime || '10:00',
      notes: f.notes || '',
    })
    setFormError('')
    setIsEditOpen(true)
  }

  const handleOpenComplete = (f) => {
    setSelectedFollowup(f)
    setCompleteNotes('')
    setFormError('')
    setIsCompleteOpen(true)
  }

  const handleOpenDelete = (f) => {
    setSelectedFollowup(f)
    setIsDeleteOpen(true)
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.lead) {
      setFormError('Please select a customer lead.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await followupsApi.createFollowUp({
        ...formData,
        scheduledDate: new Date(`${formData.scheduledDate}T${formData.scheduledTime || '10:00'}:00`).toISOString(),
      })
      setIsScheduleOpen(false)
      fetchFollowups()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to schedule follow-up.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setFormError('')
      await followupsApi.updateFollowUp(selectedFollowup._id, {
        ...formData,
        scheduledDate: new Date(`${formData.scheduledDate}T${formData.scheduledTime || '10:00'}:00`).toISOString(),
      })
      setIsEditOpen(false)
      fetchFollowups()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update follow-up.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setFormError('')
      await followupsApi.completeFollowUp(selectedFollowup._id, {
        notes: completeNotes.trim() || 'Follow-up completed successfully.',
      })
      setIsCompleteOpen(false)
      fetchFollowups()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to mark follow-up completed.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedFollowup) return
    try {
      setSubmitting(true)
      await followupsApi.deleteFollowUp(selectedFollowup._id)
      setIsDeleteOpen(false)
      fetchFollowups()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete follow-up.')
    } finally {
      setSubmitting(false)
    }
  }

  const typeIcon = (type) => {
    switch (type) {
      case 'call': return <Phone className="w-3.5 h-3.5" />
      case 'whatsapp': return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
      case 'visit': return <Users className="w-3.5 h-3.5 text-blue-600" />
      default: return <Clock className="w-3.5 h-3.5" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Follow-Ups</h1>
          <p className="text-sm text-slate-500 mt-1">
            Scheduled customer calls, farm visits, demonstrations, and sales pipeline engagements
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenSchedule}>
          Schedule Follow-Up
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tab === t.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, tractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* Follow-up List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading sales follow-ups..." />
          </div>
        ) : followups.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-slate-300" />}
            title="No Follow-Ups Found"
            description={tab !== 'all' ? `No follow-ups match the '${tab}' filter.` : 'You have no scheduled follow-up tasks. Keep your sales pipeline active by scheduling a reminder.'}
            action={
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenSchedule}>
                Schedule Follow-Up
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {followups.map((f) => {
              const isPast = new Date(f.scheduledDate) < new Date() && f.status === 'pending'
              const leadTargetId = f.lead?._id || f.lead
              return (
                <div
                  key={f._id}
                  onClick={() => {
                    if (leadTargetId) navigate(`/leads/${leadTargetId}`)
                  }}
                  className={`p-4 sm:px-6 hover:bg-primary-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    leadTargetId ? 'cursor-pointer' : ''
                  }`}
                  title={leadTargetId ? 'Click anywhere to view lead details' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      f.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isPast ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary-50 text-primary-600 border-primary-100'
                    }`}>
                      {typeIcon(f.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {f.lead?.customerName || f.lead?.name || 'Customer Lead'}
                        </span>
                        <Badge variant={f.status === 'completed' ? 'success' : isPast ? 'danger' : 'info'}>
                          {f.status === 'completed' ? 'Completed' : isPast ? 'Overdue' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {f.lead?.mobileNumber ? `Phone: ${f.lead.mobileNumber} • ` : ''}Model: <span className="text-slate-700 font-medium">{f.lead?.tractorModel || 'Tractor Inquiry'}</span>
                      </p>
                      {f.notes && (
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-lg">
                          "{f.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-800">
                        {new Date(f.scheduledDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(f.scheduledDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3" onClick={(e) => e.stopPropagation()}>
                      {leadTargetId && (
                        <button
                          title="View Lead Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/leads/${leadTargetId}`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {f.status !== 'completed' && (
                        <button
                          title="Mark Completed"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenComplete(f)
                          }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="Edit Follow-Up"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEdit(f)
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Follow-Up"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenDelete(f)
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Lead Follow-Up"
        size="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer Lead *</label>
            <select
              value={formData.lead}
              onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              required
            >
              <option value="">-- Choose Lead --</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.customerName} ({l.primaryMobile || l.mobileNumber}) - {l.interestedModel || l.tractorModel || 'Inquiry'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interaction Channel *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="visit">Customer Farm Visit</option>
                <option value="demo">Tractor Demonstration</option>
                <option value="meeting">Showroom Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Time"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <Input
            label="Scheduled Date *"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Action Notes / Goal</label>
            <textarea
              rows={3}
              placeholder="e.g. Discuss down payment subsidy options and arrange 45 HP trial..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Follow-up Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Follow-Up Task"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="call">Phone Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="visit">Customer Farm Visit</option>
                <option value="demo">Demonstration</option>
                <option value="meeting">Showroom Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Time"
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>

          <Input
            label="Date *"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Update Follow-Up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Follow-up Modal */}
      <Modal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        title="Complete Follow-Up"
        size="md"
      >
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">
            Log the conversation result and mark this task completed:
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome / Discussion Notes *</label>
            <textarea
              rows={3}
              placeholder="e.g. Spoke with customer. He agreed to visit dealership on Saturday for test drive..."
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
              required
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsCompleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Mark Completed
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Follow-up Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Follow-Up Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this follow-up reminder?
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
