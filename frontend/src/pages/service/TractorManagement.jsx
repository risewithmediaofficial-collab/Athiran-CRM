import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Tractor as TractorIcon, 
  Plus, 
  Search, 
  Gauge, 
  Eye, 
  Pencil, 
  Trash2, 
  Wrench, 
  Calendar, 
  AlertCircle 
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { TRACTOR_MODELS } from '../../constants'

export default function TractorManagement() {
  const navigate = useNavigate()
  const [tractors, setTractors] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isMeterOpen, setIsMeterOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTractor, setSelectedTractor] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    customer: '',
    model: '',
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currentEngineHours: '',
    serviceIntervalHours: 250,
  })

  // Meter Reading Form State
  const [meterForm, setMeterForm] = useState({
    currentReading: '',
    notes: '',
  })

  const fetchTractors = async () => {
    try {
      setLoading(true)
      const [tractorsRes, custRes] = await Promise.all([
        serviceApi.getTractors({ search }),
        serviceApi.getCustomers({ limit: 100 }),
      ])
      const tData = tractorsRes.data?.data
      setTractors(Array.isArray(tData) ? tData : tData?.tractors || [])
      const cData = custRes.data?.data
      setCustomers(Array.isArray(cData) ? cData : cData?.customers || [])
    } catch (err) {
      console.error('Failed to load tractor fleet:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTractors()
  }, [search])

  const handleOpenAdd = () => {
    setFormData({
      customer: customers[0]?._id || '',
      model: TRACTOR_MODELS[0] || 'Athiran PowerTrac 45 HP (2WD)',
      registrationNumber: '',
      chassisNumber: '',
      engineNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      currentEngineHours: '',
      serviceIntervalHours: 250,
    })
    setFormError('')
    setIsAddOpen(true)
  }

  const handleOpenEdit = (t) => {
    setSelectedTractor(t)
    setFormData({
      customer: t.customer?._id || t.customer || '',
      model: t.model || '',
      registrationNumber: t.registrationNumber || '',
      chassisNumber: t.chassisNumber || '',
      engineNumber: t.engineNumber || '',
      purchaseDate: t.purchaseDate ? new Date(t.purchaseDate).toISOString().split('T')[0] : '',
      currentEngineHours: t.currentEngineHours !== undefined ? t.currentEngineHours : '',
      serviceIntervalHours: t.serviceIntervalHours || 250,
    })
    setFormError('')
    setIsEditOpen(true)
  }

  const handleOpenMeter = (t) => {
    setSelectedTractor(t)
    setMeterForm({
      currentReading: '',
      notes: '',
    })
    setFormError('')
    setIsMeterOpen(true)
  }

  const handleOpenDelete = (t) => {
    setSelectedTractor(t)
    setIsDeleteOpen(true)
  }

  const handleSaveAdd = async (e) => {
    e.preventDefault()
    if (!formData.customer) {
      setFormError('Please select a customer owner.')
      return
    }
    if (!formData.model.trim()) {
      setFormError('Tractor model name is required.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await serviceApi.createTractor({
        ...formData,
        currentEngineHours: Number(formData.currentEngineHours) || 0,
        serviceIntervalHours: Number(formData.serviceIntervalHours) || 250,
      })
      setIsAddOpen(false)
      fetchTractors()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register tractor.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!formData.model.trim()) {
      setFormError('Tractor model name is required.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await serviceApi.updateTractor(selectedTractor._id, {
        ...formData,
        currentEngineHours: Number(formData.currentEngineHours) || 0,
        serviceIntervalHours: Number(formData.serviceIntervalHours) || 250,
      })
      setIsEditOpen(false)
      fetchTractors()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update tractor.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveMeter = async (e) => {
    e.preventDefault()
    if (meterForm.currentReading === '' || isNaN(Number(meterForm.currentReading))) {
      setFormError('Please enter a valid engine-hour reading.')
      return
    }
    const newHours = Number(meterForm.currentReading)
    if (newHours < (selectedTractor.currentEngineHours || 0)) {
      setFormError(`New reading cannot be lower than current reading (${selectedTractor.currentEngineHours || 0} hrs).`)
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await serviceApi.addMeterReading(selectedTractor._id, {
        hours: newHours,
        notes: meterForm.notes,
      })
      setIsMeterOpen(false)
      fetchTractors()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update meter reading.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTractor) return
    try {
      setSubmitting(true)
      await serviceApi.deleteTractor(selectedTractor._id)
      setIsDeleteOpen(false)
      fetchTractors()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tractor.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tractor Fleet Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Engine-hour meter reading updates, serial verification, and service intervals
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Register Tractor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by model, reg #, chassis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Fleet: {tractors.length}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading tractor fleet..." />
          </div>
        ) : tractors.length === 0 ? (
          <EmptyState
            icon={<TractorIcon className="w-10 h-10 text-slate-300" />}
            title="No Tractors Registered"
            description={search ? 'No fleet tractors match your search query.' : 'Register your customer tractors to track engine hours and predictive service intervals.'}
            action={
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
                Register Tractor
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Tractor Model</th>
                  <th className="py-3.5 px-6">Owner / Customer</th>
                  <th className="py-3.5 px-6">Registration #</th>
                  <th className="py-3.5 px-6">Current Hours</th>
                  <th className="py-3.5 px-6">Next Service Due</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tractors.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/service/tractors/${t._id}`)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to open tractor details"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-semibold text-xs flex items-center justify-center border border-primary-100">
                          <TractorIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="group-hover:text-primary-600 transition-colors font-medium">
                            {t.model || t.modelName || 'Tractor'}
                          </div>
                          {t.tractorId && (
                            <span className="block text-[11px] font-mono text-slate-400 font-normal">
                              {t.tractorId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600" onClick={(e) => {
                      if (t.customer) {
                        e.stopPropagation()
                        navigate(`/service/customers/${t.customer._id || t.customer}`)
                      }
                    }}>
                      {t.customer ? (
                        <span className="hover:text-primary-600 font-medium text-primary-700 hover:underline">
                          {t.customer.customerName || t.customer.fullName || 'Customer'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-700">
                      {t.registrationNumber || 'Pending'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        <Gauge className="w-3.5 h-3.5 text-blue-600" />
                        {t.currentEngineHours || 0} hrs
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {t.nextServiceDueHours ? `${t.nextServiceDueHours} hrs` : `${(t.currentEngineHours || 0) + 250} hrs`}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Record Meter Reading"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenMeter(t)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Gauge className="w-4 h-4" />
                        </button>
                        <button
                          title="View Tractor Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/service/tractors/${t._id}`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Tractor"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(t)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Tractor"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(t)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Tractor Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Fleet Tractor"
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              required
            >
              <option value="">-- Choose Customer Owner --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.customerName || c.fullName || 'Customer'} ({c.mobile || c.primaryMobile || 'No Phone'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tractor Model *</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
              required
            >
              <option value="">-- Select Tractor Model --</option>
              {TRACTOR_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              placeholder="e.g. TN-39-AZ-1234"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chassis Number"
              placeholder="e.g. ATH50-2024-988"
              value={formData.chassisNumber}
              onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
            />
            <Input
              label="Engine Number"
              placeholder="e.g. ENG-883921"
              value={formData.engineNumber}
              onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Engine Hours"
              type="number"
              placeholder="e.g. 0 or 150"
              value={formData.currentEngineHours}
              onChange={(e) => setFormData({ ...formData, currentEngineHours: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Interval</label>
              <select
                value={formData.serviceIntervalHours}
                onChange={(e) => setFormData({ ...formData, serviceIntervalHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
              >
                <option value={250}>250 Hours (Recommended Standard)</option>
                <option value={500}>500 Hours (Extended Duty Cycle)</option>
                <option value={100}>100 Hours (Initial Run-in Period)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Register Tractor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Tractor Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Tractor Fleet Record"
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
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
              required
            >
              <option value="">-- Select Tractor Model --</option>
              {TRACTOR_MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chassis Number"
              value={formData.chassisNumber}
              onChange={(e) => setFormData({ ...formData, chassisNumber: e.target.value })}
            />
            <Input
              label="Engine Number"
              value={formData.engineNumber}
              onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Engine Hours"
              type="number"
              value={formData.currentEngineHours}
              onChange={(e) => setFormData({ ...formData, currentEngineHours: e.target.value })}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Interval</label>
              <select
                value={formData.serviceIntervalHours}
                onChange={(e) => setFormData({ ...formData, serviceIntervalHours: Number(e.target.value) })}
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

      {/* Record Meter Reading Modal */}
      <Modal
        isOpen={isMeterOpen}
        onClose={() => setIsMeterOpen(false)}
        title="Update Engine-Hour Reading"
        size="md"
      >
        <form onSubmit={handleSaveMeter} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div><strong>Tractor:</strong> {selectedTractor?.model}</div>
            <div><strong>Current Recorded Reading:</strong> {selectedTractor?.currentEngineHours || 0} Hours</div>
          </div>

          <Input
            label="New Engine-Hour Reading *"
            type="number"
            step="0.1"
            placeholder="e.g. 185.5"
            value={meterForm.currentReading}
            onChange={(e) => setMeterForm({ ...meterForm, currentReading: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Checked during periodic field visit in Kangeyam..."
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
              Save Reading
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Tractor Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedTractor?.model}</strong> ({selectedTractor?.registrationNumber || 'No Reg'})?
          </p>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            ⚠️ This will remove the tractor and its recorded meter log.
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
