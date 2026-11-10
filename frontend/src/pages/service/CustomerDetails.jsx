import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Tractor as TractorIcon, 
  Wrench, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { TAMIL_NADU_DISTRICTS, INDIAN_STATES } from '../../constants'
import useTractorModels from '../../hooks/useTractorModels'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { modelNames } = useTractorModels()
  const [customer, setCustomer] = useState(null)
  const [tractors, setTractors] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add Tractor Modal
  const [isAddTractorOpen, setIsAddTractorOpen] = useState(false)
  const [tractorForm, setTractorForm] = useState({
    model: '',
    registrationNumber: '',
    chassisNumber: '',
    engineNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currentEngineHours: '',
    serviceIntervalHours: 250,
  })
  const [submittingTractor, setSubmittingTractor] = useState(false)
  const [tractorError, setTractorError] = useState('')

  // Delete Customer Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit Customer Modal
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [editCustForm, setEditCustForm] = useState({
    fullName: '',
    primaryMobile: '',
    alternateMobile: '',
    email: '',
    village: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    notes: '',
  })
  const [submittingCust, setSubmittingCust] = useState(false)
  const [editCustError, setEditCustError] = useState('')

  const handleOpenEditCustomer = () => {
    if (!customer) return
    setEditCustForm({
      fullName: customer.customerName || customer.fullName || '',
      primaryMobile: customer.mobile || customer.primaryMobile || '',
      alternateMobile: customer.alternateMobile || '',
      email: customer.email || '',
      village: customer.address?.village || customer.village || '',
      district: customer.address?.district || customer.district || 'Tiruppur',
      state: customer.address?.state || customer.state || 'Tamil Nadu',
      pincode: customer.address?.pincode || customer.pincode || '',
      notes: customer.notes || '',
    })
    setEditCustError('')
    setIsEditCustomerOpen(true)
  }

  const handleSaveCustomer = async (e) => {
    e.preventDefault()
    if (!editCustForm.fullName.trim() || !editCustForm.primaryMobile.trim()) {
      setEditCustError('Customer Name and Primary Mobile are required.')
      return
    }
    try {
      setSubmittingCust(true)
      setEditCustError('')
      await serviceApi.updateCustomer(id, {
        fullName: editCustForm.fullName.trim(),
        primaryMobile: editCustForm.primaryMobile.trim(),
        alternateMobile: editCustForm.alternateMobile.trim(),
        email: editCustForm.email.trim() || undefined,
        address: {
          village: editCustForm.village.trim(),
          district: editCustForm.district.trim(),
          state: editCustForm.state.trim(),
          pincode: editCustForm.pincode.trim(),
        },
        notes: editCustForm.notes.trim(),
      })
      setIsEditCustomerOpen(false)
      fetchCustomerDetails()
    } catch (err) {
      setEditCustError(err.response?.data?.message || 'Failed to update customer.')
    } finally {
      setSubmittingCust(false)
    }
  }

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true)
      const [custRes, tracRes, svcRes] = await Promise.all([
        serviceApi.getCustomer(id),
        serviceApi.getCustomerTractors(id).catch(() => ({ data: { data: [] } })),
        serviceApi.getCustomerServices(id).catch(() => ({ data: { data: [] } })),
      ])
      setCustomer(custRes.data?.data)
      setTractors(tracRes.data?.data || [])
      setServices(svcRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load customer details:', err)
      setError('Could not load customer information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchCustomerDetails()
  }, [id])

  const handleAddTractor = async (e) => {
    e.preventDefault()
    if (!tractorForm.model.trim()) {
      setTractorError('Tractor model name is required.')
      return
    }
    try {
      setSubmittingTractor(true)
      setTractorError('')
      await serviceApi.createTractor({
        ...tractorForm,
        customer: id,
        currentEngineHours: Number(tractorForm.currentEngineHours) || 0,
        serviceIntervalHours: Number(tractorForm.serviceIntervalHours) || 250,
      })
      setIsAddTractorOpen(false)
      fetchCustomerDetails()
    } catch (err) {
      setTractorError(err.response?.data?.message || 'Failed to register tractor.')
    } finally {
      setSubmittingTractor(false)
    }
  }

  const handleDeleteCustomer = async () => {
    try {
      setDeleting(true)
      await serviceApi.deleteCustomer(id)
      navigate('/service/customers')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading customer 360° profile..." />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-300" />}
          title="Customer Not Found"
          description={error || 'The requested customer does not exist.'}
          action={
            <Link to="/service/customers">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Customer List
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/service/customers">
            <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{customer.customerName || customer.fullName}</h1>
              {customer.customerId && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {customer.customerId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="w-4 h-4" />}
            onClick={handleOpenEditCustomer}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete Customer
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setTractorForm({
                model: modelNames[0] || 'Massey Ferguson 1035 DI Maha Shakti',
                registrationNumber: '',
                chassisNumber: '',
                engineNumber: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                currentEngineHours: '',
                serviceIntervalHours: 250,
              })
              setTractorError('')
              setIsAddTractorOpen(true)
            }}
          >
            Register Tractor
          </Button>
        </div>
      </div>

      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900">{customer.mobile || customer.primaryMobile}</span>
                {customer.alternateMobile && (
                  <span className="block text-xs text-slate-400">Alt: {customer.alternateMobile}</span>
                )}
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div>{customer.address?.village || customer.village || 'No village specified'}</div>
                <div className="text-xs text-slate-500">
                  {customer.address?.district || customer.district || ''}, {customer.address?.state || customer.state || 'Tamil Nadu'} {customer.address?.pincode ? `- ${customer.address?.pincode}` : ''}
                </div>
              </div>
            </div>
          </div>
          {customer.notes && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Internal Notes:</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{customer.notes}</p>
            </div>
          )}
          {customer.linkedLeadId && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">Converted From Lead:</span>
                <div className="text-xs font-bold text-primary-600 mt-0.5">
                  {customer.linkedLeadId?.leadId || 'View Lead'}
                </div>
              </div>
              <Link to={`/leads/${customer.linkedLeadId?._id || customer.linkedLeadId}`}>
                <button className="text-xs text-primary-600 font-semibold hover:underline cursor-pointer">
                  View Lead Details →
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Fleet Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fleet Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Tractors Owned</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{tractors.length}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Service Jobs</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{services.length}</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-primary-50/50 border border-primary-100 text-xs text-primary-800">
            Tractors are synced with the workshop job cards and engine-hour tracking system.
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h2>
          <div className="space-y-2">
            <Link to={`/service/records/new?customerId=${customer._id}`}>
              <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Wrench className="w-4 h-4" />}>
                Create Service Job Card
              </Button>
            </Link>
            <Link to="/service/calendar">
              <Button variant="ghost" size="sm" className="w-full justify-start" icon={<Calendar className="w-4 h-4" />}>
                View Upcoming Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1: Customer's Tractor Fleet */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TractorIcon className="w-4 h-4 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">Owned Tractor Fleet ({tractors.length})</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setTractorForm({
                model: modelNames[0] || 'Massey Ferguson 1035 DI Maha Shakti',
                registrationNumber: '',
                chassisNumber: '',
                engineNumber: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                currentEngineHours: '',
                serviceIntervalHours: 250,
              })
              setTractorError('')
              setIsAddTractorOpen(true)
            }}
          >
            Add Tractor
          </Button>
        </div>

        {tractors.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No tractors registered under this customer yet. Click "Register Tractor" above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto custom-scrollbar">
            {tractors.map((t) => (
              <div
                key={t._id}
                onClick={() => navigate(`/service/tractors/${t._id}`)}
                className="p-4 sm:px-6 hover:bg-primary-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                title="Click anywhere to open tractor profile"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <TractorIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {t.model || t.modelName || 'Tractor'}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Reg: <span className="font-mono text-slate-700">{t.registrationNumber || 'Pending'}</span> • Chassis: <span className="font-mono text-slate-700">{t.chassisNumber || 'N/A'}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                        {t.currentEngineHours || 0} Engine Hours
                      </span>
                      <span>Next service at {t.nextServiceDueHours || (t.currentEngineHours + (t.serviceIntervalHours || 250))} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/service/tractors/${t._id}`}>
                    <Button variant="secondary" size="sm">
                      Tractor Profile
                    </Button>
                  </Link>
                  <Link to={`/service/records/new?tractorId=${t._id}&customerId=${customer._id}`}>
                    <Button variant="primary" size="sm" icon={<Wrench className="w-3.5 h-3.5" />}>
                      Service
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Service History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">Service History ({services.length})</h2>
          </div>
          <Link to={`/service/records/new?customerId=${customer._id}`}>
            <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Log Service
            </Button>
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No service history recorded for this customer yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto custom-scrollbar">
            {services.map((svc) => (
              <div key={svc._id} className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {svc.tractor?.model || 'Tractor Service'}
                    </span>
                    <Badge variant={svc.status === 'completed' ? 'success' : 'neutral'}>
                      {svc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {svc.serviceType || 'Routine Maintenance'} • Date: {new Date(svc.scheduledDate || svc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {svc.finalAmount ? `₹${Number(svc.finalAmount).toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Tractor Modal */}
      <Modal
        isOpen={isAddTractorOpen}
        onClose={() => setIsAddTractorOpen(false)}
        title="Register Tractor to Customer"
        size="md"
      >
        <form onSubmit={handleAddTractor} className="space-y-4">
          {tractorError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{tractorError}</span>
            </div>
          )}

          <div>
            <Select
              label="Tractor Model"
              required
              value={tractorForm.model}
              onChange={(e) => setTractorForm({ ...tractorForm, model: e.target.value })}
              options={[
                { value: '', label: '-- Select Tractor Model --' },
                ...(tractorForm.model && !modelNames.includes(tractorForm.model)
                  ? [{ value: tractorForm.model, label: tractorForm.model }]
                  : []),
                ...modelNames.map((m) => ({ value: m, label: m })),
              ]}
              placeholder="-- Select Tractor Model --"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              placeholder="e.g. TN-39-AZ-1234"
              value={tractorForm.registrationNumber}
              onChange={(e) => setTractorForm({ ...tractorForm, registrationNumber: e.target.value })}
            />
            <Input
              label="Purchase Date"
              type="date"
              value={tractorForm.purchaseDate}
              onChange={(e) => setTractorForm({ ...tractorForm, purchaseDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Chassis Number"
              placeholder="e.g. ATH50-2024-988"
              value={tractorForm.chassisNumber}
              onChange={(e) => setTractorForm({ ...tractorForm, chassisNumber: e.target.value })}
            />
            <Input
              label="Engine Number"
              placeholder="e.g. ENG-883921"
              value={tractorForm.engineNumber}
              onChange={(e) => setTractorForm({ ...tractorForm, engineNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Engine Hours"
              type="number"
              placeholder="e.g. 150"
              value={tractorForm.currentEngineHours}
              onChange={(e) => setTractorForm({ ...tractorForm, currentEngineHours: e.target.value })}
            />
            <div>
              <Select
                label="Service Interval"
                value={tractorForm.serviceIntervalHours}
                onChange={(e) => setTractorForm({ ...tractorForm, serviceIntervalHours: Number(e.target.value) })}
                options={[
                  { value: 250, label: '250 Hours (Recommended Standard)' },
                  { value: 500, label: '500 Hours (Extended Duty Cycle)' },
                  { value: 100, label: '100 Hours (Initial Run-in Period)' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsAddTractorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submittingTractor}>
              Save Tractor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Customer Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Customer Profile"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{customer.customerName || customer.fullName}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ This will remove the customer profile from your CRM.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteCustomer}>
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Profile Modal */}
      <Modal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        title="Edit Customer Profile"
        size="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          {editCustError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editCustError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={editCustForm.fullName}
              onChange={(e) => setEditCustForm({ ...editCustForm, fullName: e.target.value })}
              required
            />
            <Input
              label="Primary Mobile *"
              value={editCustForm.primaryMobile}
              onChange={(e) => setEditCustForm({ ...editCustForm, primaryMobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alternate Mobile"
              value={editCustForm.alternateMobile}
              onChange={(e) => setEditCustForm({ ...editCustForm, alternateMobile: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={editCustForm.email}
              onChange={(e) => setEditCustForm({ ...editCustForm, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Town"
              value={editCustForm.village}
              onChange={(e) => setEditCustForm({ ...editCustForm, village: e.target.value })}
            />
            <div>
              <Select
                label="District"
                value={editCustForm.district}
                onChange={(e) => setEditCustForm({ ...editCustForm, district: e.target.value })}
                options={[
                  { value: '', label: '-- Select District --' },
                  ...TAMIL_NADU_DISTRICTS.map((d) => ({ value: d, label: d })),
                ]}
                placeholder="-- Select District --"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="State"
                value={editCustForm.state}
                onChange={(e) => setEditCustForm({ ...editCustForm, state: e.target.value })}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Input
              label="PIN Code"
              value={editCustForm.pincode}
              onChange={(e) => setEditCustForm({ ...editCustForm, pincode: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={3}
              value={editCustForm.notes}
              onChange={(e) => setEditCustForm({ ...editCustForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditCustomerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submittingCust}>
              Update Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
