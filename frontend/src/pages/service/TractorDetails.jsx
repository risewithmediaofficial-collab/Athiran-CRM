import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Tractor as TractorIcon, 
  ArrowLeft, 
  Gauge, 
  Calendar, 
  Wrench, 
  Clock, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  User, 
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { TRACTOR_MODELS } from '../../constants'

export default function TractorDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tractor, setTractor] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals
  const [isMeterOpen, setIsMeterOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [meterForm, setMeterForm] = useState({
    hours: '',
    notes: '',
  })

  const [editForm, setEditForm] = useState({
    model: '',
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    purchaseDate: '',
    currentEngineHours: '',
    serviceIntervalHours: 250,
  })

  const fetchTractorDetails = async () => {
    try {
      setLoading(true)
      const [tractorRes, predRes] = await Promise.all([
        serviceApi.getTractor(id),
        serviceApi.getServicePrediction(id).catch(() => ({ data: { data: null } })),
      ])
      const t = tractorRes.data?.data
      setTractor(t)
      setPrediction(predRes.data?.data)
      if (t) {
        setEditForm({
          model: t.model || '',
          registrationNumber: t.registrationNumber || '',
          chassisNumber: t.chassisNumber || '',
          engineNumber: t.engineNumber || '',
          purchaseDate: t.purchaseDate ? new Date(t.purchaseDate).toISOString().split('T')[0] : '',
          currentEngineHours: t.currentEngineHours || 0,
          serviceIntervalHours: t.serviceIntervalHours || 250,
        })
      }
    } catch (err) {
      console.error('Failed to load tractor details:', err)
      setError('Could not load tractor profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchTractorDetails()
  }, [id])

  const handleSaveMeter = async (e) => {
    e.preventDefault()
    if (meterForm.hours === '' || isNaN(Number(meterForm.hours))) {
      setFormError('Please enter a valid engine-hour reading.')
      return
    }
    const newHours = Number(meterForm.hours)
    if (newHours < (tractor.currentEngineHours || 0)) {
      setFormError(`New reading cannot be lower than current reading (${tractor.currentEngineHours || 0} hrs).`)
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await serviceApi.addMeterReading(id, {
        hours: newHours,
        notes: meterForm.notes,
      })
      setIsMeterOpen(false)
      fetchTractorDetails()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to record meter reading.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setFormError('')
      await serviceApi.updateTractor(id, {
        ...editForm,
        currentEngineHours: Number(editForm.currentEngineHours) || 0,
        serviceIntervalHours: Number(editForm.serviceIntervalHours) || 250,
      })
      setIsEditOpen(false)
      fetchTractorDetails()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update tractor.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSubmitting(true)
      await serviceApi.deleteTractor(id)
      navigate('/service/tractors')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tractor.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading tractor profile and meter records..." />
      </div>
    )
  }

  if (error || !tractor) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<TractorIcon className="w-10 h-10 text-slate-300" />}
          title="Tractor Not Found"
          description={error || 'The requested tractor record does not exist.'}
          action={
            <Link to="/service/tractors">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Fleet
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const nextDue = tractor.nextServiceDueHours || ((tractor.currentEngineHours || 0) + (tractor.serviceIntervalHours || 250))
  const remainingHours = Math.max(0, nextDue - (tractor.currentEngineHours || 0))
  const percentUsed = Math.min(100, Math.round(((tractor.currentEngineHours % (tractor.serviceIntervalHours || 250)) / (tractor.serviceIntervalHours || 250)) * 100))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/service/tractors">
            <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{tractor.model}</h1>
              {tractor.registrationNumber && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold">
                  {tractor.registrationNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tractor ID: {tractor.tractorId || 'Pending'} • Registered on {new Date(tractor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Gauge className="w-4 h-4" />}
            onClick={() => {
              setMeterForm({ hours: '', notes: '' })
              setFormError('')
              setIsMeterOpen(true)
            }}
          >
            Update Meter Reading
          </Button>
        </div>
      </div>

      {/* Top 3 Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Engine-Hour Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Engine Hours</span>
            <Gauge className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {tractor.currentEngineHours || 0} <span className="text-sm font-normal text-slate-500">hours</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Next scheduled maintenance at <strong>{nextDue} hrs</strong> ({remainingHours} hrs remaining)
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Interval Progress</span>
              <span>{percentUsed}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentUsed > 90 ? 'bg-red-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-primary-600'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* Prediction Insights */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service Predictor</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {prediction?.predictedServiceDate ? (
                new Date(prediction.predictedServiceDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              ) : (
                'Routine Schedule Active'
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Based on agricultural run-time calculations (~{prediction?.dailyAverageHours || '5.5'} hrs/day)
            </p>
          </div>
          <div className="pt-2">
            <Link to={`/service/records/new?tractorId=${tractor._id}&customerId=${tractor.customer?._id || tractor.customer}`}>
              <Button variant="secondary" size="sm" className="w-full justify-center" icon={<Wrench className="w-4 h-4" />}>
                Book Service Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Tractor Specs & Owner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner & Chassis Details</span>
          <div className="text-xs space-y-2 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Owner:</span>
              <span className="font-semibold text-slate-900">
                {tractor.customer ? (
                  <Link to={`/service/customers/${tractor.customer._id || tractor.customer}`} className="hover:text-primary-600">
                    {tractor.customer.customerName || tractor.customer.fullName || 'View Owner'}
                  </Link>
                ) : (
                  'Unassigned'
                )}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Chassis #:</span>
              <span className="font-mono text-slate-800">{tractor.chassisNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Engine #:</span>
              <span className="font-mono text-slate-800">{tractor.engineNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Purchase Date:</span>
              <span className="text-slate-800">
                {tractor.purchaseDate ? new Date(tractor.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meter Reading Log History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">Meter Reading History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setMeterForm({ hours: '', notes: '' })
              setFormError('')
              setIsMeterOpen(true)
            }}
          >
            Record Reading
          </Button>
        </div>

        {(!tractor.meterReadings || tractor.meterReadings.length === 0) ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No historical meter logs recorded yet. Current reading is <strong>{tractor.currentEngineHours || 0} hours</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Recorded Date</th>
                  <th className="py-3 px-6">Engine Hours</th>
                  <th className="py-3 px-6">Hours Added</th>
                  <th className="py-3 px-6">Notes / Operational Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tractor.meterReadings.slice().reverse().map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {new Date(m.readingDate || m.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900 font-mono">
                      {m.hours} hrs
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {m.hoursAdded ? `+${m.hoursAdded} hrs` : '-'}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {m.notes || 'Routine check'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Meter Reading Modal */}
      <Modal
        isOpen={isMeterOpen}
        onClose={() => setIsMeterOpen(false)}
        title="Record New Meter Reading"
        size="md"
      >
        <form onSubmit={handleSaveMeter} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <div>Current engine-hour baseline: <strong>{tractor.currentEngineHours || 0} Hours</strong></div>
          </div>

          <Input
            label="Updated Reading (Engine Hours) *"
            type="number"
            step="0.1"
            placeholder="e.g. 250"
            value={meterForm.hours}
            onChange={(e) => setMeterForm({ ...meterForm, hours: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Field inspection during plowing season..."
              value={meterForm.notes}
              onChange={(e) => setMeterForm({ ...meterForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsMeterOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Submit Reading
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Tractor Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Tractor Record"
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tractor Model *</label>
            <select
              value={editForm.model}
              onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
              required
            >
              <option value="">-- Select Tractor Model --</option>
              {TRACTOR_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              value={editForm.registrationNumber}
              onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={editForm.purchaseDate}
              onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Chassis Number"
              value={editForm.chassisNumber}
              onChange={(e) => setEditForm({ ...editForm, chassisNumber: e.target.value })}
            />
            <Input
              label="Engine Number"
              value={editForm.engineNumber}
              onChange={(e) => setEditForm({ ...editForm, engineNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Engine Hours"
              type="number"
              value={editForm.currentEngineHours}
              onChange={(e) => setEditForm({ ...editForm, currentEngineHours: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Interval</label>
              <select
                value={editForm.serviceIntervalHours}
                onChange={(e) => setEditForm({ ...editForm, serviceIntervalHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
              >
                <option value={250}>250 Hours (Recommended Standard)</option>
                <option value={500}>500 Hours (Extended Duty Cycle)</option>
                <option value={100}>100 Hours (Initial Run-in Period)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Update Tractor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Tractor Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Tractor Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{tractor.model || tractor.modelName}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ This will remove the tractor fleet record permanently.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>
              Delete Tractor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
