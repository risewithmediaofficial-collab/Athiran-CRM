import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Pencil, 
  Trash2, 
  AlertCircle,
  Eye,
  User,
  Phone,
  MapPin,
  Tractor as TractorIcon,
  Printer,
  Package
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function ServiceRecords() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Modals
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [editStatus, setEditStatus] = useState('scheduled')
  const [editNotes, setEditNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await serviceApi.getServices({
        search,
        status: statusFilter || undefined,
        serviceType: typeFilter || undefined,
      })
      const data = res.data?.data
      setServices(Array.isArray(data) ? data : data?.services || [])
    } catch (err) {
      console.error('Failed to load service records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [search, statusFilter, typeFilter])

  const handleOpenView = (svc) => {
    setSelectedService(svc)
    setIsViewOpen(true)
  }

  const handleOpenEdit = (svc) => {
    setSelectedService(svc)
    setEditStatus(svc.status || 'scheduled')
    setEditNotes(svc.recommendations || '')
    setErrorMsg('')
    setIsEditOpen(true)
  }

  const handleOpenDelete = (svc) => {
    setSelectedService(svc)
    setIsDeleteOpen(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setErrorMsg('')
      await serviceApi.updateService(selectedService._id, {
        status: editStatus,
        recommendations: editNotes,
      })
      setIsEditOpen(false)
      fetchServices()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update service record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedService) return
    try {
      setSubmitting(true)
      await serviceApi.deleteService(selectedService._id)
      setIsDeleteOpen(false)
      fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service job card.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusVariant = (st) => {
    switch (st) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'scheduled': return 'info'
      case 'waiting_parts': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'neutral'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service & Job Cards</h1>
          <p className="text-sm text-slate-500 mt-1">
            Workshop maintenance orders, parts replacements, and technician work logs
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/service/calendar">
            <Button variant="secondary" size="sm" icon={<Calendar className="w-4 h-4" />}>
              Calendar
            </Button>
          </Link>
          <Link to="/service/records/new">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Create Job Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, tractor, job card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="min-w-[140px]">
            <Select
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'waiting_parts', label: 'Waiting Parts' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              placeholder="All Statuses"
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Service Types' },
                { value: 'first_free', label: '1st Free Service' },
                { value: 'second_free', label: '2nd Free Service' },
                { value: 'routine_paid', label: 'Routine Paid Maintenance' },
                { value: 'major_overhaul', label: 'Major Engine Overhaul' },
                { value: 'breakdown_repair', label: 'Breakdown / Field Repair' },
                { value: 'warranty_repair', label: 'Warranty Replacement' },
              ]}
              placeholder="All Service Types"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading service job cards..." />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-10 h-10 text-slate-300" />}
            title="No Service Records Found"
            description={search || statusFilter || typeFilter ? 'No job cards match your filter criteria.' : 'No service job cards have been opened yet. Create your first maintenance record.'}
            action={
              <Link to="/service/records/new">
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Create Job Card
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Job Card #</th>
                  <th className="py-3.5 px-6">Tractor & Owner</th>
                  <th className="py-3.5 px-6">Service Type</th>
                  <th className="py-3.5 px-6">Engine Hours</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Bill Amount</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => handleOpenView(s)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to open details"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-900">
                      <div className="group-hover:text-primary-600 font-mono font-bold text-primary-700 transition-colors">
                        {s.serviceId || s._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-left font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {s.tractor?.model || s.tractor?.modelName || 'Tractor Service'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {s.customer?.customerName || s.customer?.fullName || 'Customer'} • {s.tractor?.registrationNumber || 'No Reg'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                      <span className="capitalize">{s.serviceType?.replace('_', ' ') || 'Maintenance'}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-700">
                      {s.currentEngineHours ? `${s.currentEngineHours} hrs` : '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(s.scheduledDate || s.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={statusVariant(s.status)}>
                        {s.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 text-sm">
                      {s.finalAmount ? `₹${Number(s.finalAmount).toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Open & View Job Card Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenView(s)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Update Status / Recommendations"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(s)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Service Job Card"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(s)
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

      {/* View Full Job Card Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Workshop Job Card: ${selectedService?.serviceId || 'Details'}`}
        size="lg"
      >
        {selectedService && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* Header Status & Type Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {selectedService.tractor?.model || selectedService.tractor?.modelName || 'Tractor Service'}
                    </span>
                    <Badge variant={statusVariant(selectedService.status)}>
                      {selectedService.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    Job Card: {selectedService.serviceId} • Date: {new Date(selectedService.scheduledDate || selectedService.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase font-medium tracking-wider">Total Bill</span>
                <span className="text-lg font-bold text-slate-900">
                  ₹{selectedService.finalAmount ? Number(selectedService.finalAmount).toLocaleString('en-IN') : '0'}
                </span>
              </div>
            </div>

            {/* Customer & Tractor Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  Customer Details
                </h4>
                <div className="space-y-1.5 pt-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-semibold text-slate-900">{selectedService.customer?.customerName || selectedService.customer?.fullName || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-medium text-slate-800">{selectedService.customer?.mobile || selectedService.customer?.primaryMobile || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location / Village:</span>
                    <span className="font-medium text-slate-800">{selectedService.customer?.village || selectedService.serviceLocation || 'Dealership Workshop'}</span>
                  </div>
                </div>
              </div>

              {/* Tractor Info */}
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <TractorIcon className="w-3.5 h-3.5 text-primary-600" />
                  Tractor Machine Details
                </h4>
                <div className="space-y-1.5 pt-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registration #:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedService.tractor?.registrationNumber || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Engine Hours:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedService.currentEngineHours ? `${selectedService.currentEngineHours} hrs` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service Category:</span>
                    <span className="capitalize font-medium text-slate-800">{selectedService.serviceType?.replace('_', ' ') || 'Routine Maintenance'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints & Work Performed */}
            <div className="space-y-3">
              {selectedService.complaint && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1">
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block">Reported Issues & Complaints</span>
                  <p className="text-amber-800 leading-relaxed">{selectedService.complaint}</p>
                </div>
              )}

              {selectedService.workPerformed && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">Work Carried Out / Bay Action</span>
                  <p className="text-slate-700 leading-relaxed">{selectedService.workPerformed}</p>
                </div>
              )}
            </div>

            {/* Spare Parts Consumed Table */}
            {selectedService.partsReplaced && selectedService.partsReplaced.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary-600" />
                  Spare Parts & Lubricants Replaced
                </h4>
                <div className="rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-2.5 px-3">Part Description</th>
                        <th className="py-2.5 px-3">Part #</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedService.partsReplaced.map((p, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{p.partName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{p.partNumber || '-'}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">{p.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">₹{Number(p.unitPrice || 0).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">₹{(Number(p.quantity || 0) * Number(p.unitPrice || 0)).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Billing Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">Cost & Invoice Summary</h4>
              <div className="flex justify-between text-slate-600">
                <span>Spare Parts & Consumables:</span>
                <span className="font-mono">₹{Number(selectedService.partsCost || selectedService.cost?.partsCost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Workshop Labor Charges:</span>
                <span className="font-mono">₹{Number(selectedService.laborCost || selectedService.cost?.laborCost || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(selectedService.discount || selectedService.cost?.discount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Dealership Courtesy Discount:</span>
                  <span className="font-mono">-₹{Number(selectedService.discount || selectedService.cost?.discount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount Payable:</span>
                <span className="font-mono text-base text-primary-700">₹{Number(selectedService.finalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Recommendations */}
            {selectedService.recommendations && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 text-xs space-y-1">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] block">Technician Recommendations</span>
                <p className="text-blue-800 leading-relaxed">{selectedService.recommendations}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Print Job Card
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Pencil className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setIsViewOpen(false)
                    handleOpenEdit(selectedService)
                  }}
                >
                  Update Status
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Job Card Status"
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <Select
              label="Job Card Status"
              required
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress (Bay Occupied)' },
                { value: 'waiting_parts', label: 'Waiting Parts / Spares' },
                { value: 'completed', label: 'Completed & Ready for Delivery' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Recommendations & Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Engine oil replaced, filter cleaned. Recommend radiator flush in next 250 hrs."
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Update Job Card
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Service Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Service Job Card"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete job card{' '}
            <strong className="text-slate-900">{selectedService?.serviceId || 'this record'}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ This will remove the service record and its parts cost calculation.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
