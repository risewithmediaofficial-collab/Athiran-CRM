import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Tractor, 
  Eye, 
  Pencil, 
  Trash2, 
  X,
  AlertCircle
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { TAMIL_NADU_DISTRICTS, INDIAN_STATES } from '../../constants'

export default function ServiceCustomers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
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

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await serviceApi.getCustomers({ search, page, limit: 15 })
      const data = res.data?.data
      if (Array.isArray(data)) {
        setCustomers(data)
        setPagination({ total: data.length, pages: 1 })
      } else if (data?.customers) {
        setCustomers(data.customers)
        setPagination(data.pagination || { total: data.customers.length, pages: 1 })
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error('Failed to load service customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, page])

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      primaryMobile: '',
      alternateMobile: '',
      email: '',
      village: '',
      district: 'Tiruppur',
      state: 'Tamil Nadu',
      pincode: '',
      notes: '',
    })
    setFormError('')
    setIsAddOpen(true)
  }

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      fullName: customer.fullName || '',
      primaryMobile: customer.primaryMobile || '',
      alternateMobile: customer.alternateMobile || '',
      email: customer.email || '',
      village: customer.address?.village || customer.village || '',
      district: customer.address?.district || customer.district || '',
      state: customer.address?.state || customer.state || 'Tamil Nadu',
      pincode: customer.address?.pincode || customer.pincode || '',
      notes: customer.notes || '',
    })
    setFormError('')
    setIsEditOpen(true)
  }

  const handleOpenDelete = (customer) => {
    setSelectedCustomer(customer)
    setIsDeleteOpen(false)
    setIsDeleteOpen(true)
  }

  const handleSaveAdd = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.primaryMobile.trim()) {
      setFormError('Customer Full Name and Primary Mobile are required.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      const payload = {
        fullName: formData.fullName.trim(),
        primaryMobile: formData.primaryMobile.trim(),
        alternateMobile: formData.alternateMobile.trim(),
        email: formData.email.trim() || undefined,
        address: {
          village: formData.village.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        notes: formData.notes.trim(),
      }
      await serviceApi.createCustomer(payload)
      setIsAddOpen(false)
      fetchCustomers()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create customer.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.primaryMobile.trim()) {
      setFormError('Customer Full Name and Primary Mobile are required.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      const payload = {
        fullName: formData.fullName.trim(),
        primaryMobile: formData.primaryMobile.trim(),
        alternateMobile: formData.alternateMobile.trim(),
        email: formData.email.trim() || undefined,
        address: {
          village: formData.village.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        notes: formData.notes.trim(),
      }
      await serviceApi.updateCustomer(selectedCustomer._id, payload)
      setIsEditOpen(false)
      fetchCustomers()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update customer.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    try {
      setSubmitting(true)
      await serviceApi.deleteCustomer(selectedCustomer._id)
      setIsDeleteOpen(false)
      fetchCustomers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Customers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered tractor owners, verified contact profiles, and agricultural fleet directory
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading customer directory..." />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10 text-slate-300" />}
            title="No Customers Found"
            description={search ? 'No registered customers match your search query.' : 'No customer records have been created yet. Add your first tractor owner to get started.'}
            action={
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
                Add Customer
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Contact Number</th>
                  <th className="py-3.5 px-6">Village / District</th>
                  <th className="py-3.5 px-6">Fleet Tractors</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/service/customers/${c._id}`)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to open customer details"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-semibold text-xs flex items-center justify-center border border-primary-100">
                          {(c.customerName || c.fullName)?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <div className="group-hover:text-primary-600 font-medium transition-colors">
                            {c.customerName || c.fullName}
                          </div>
                          {c.customerId && (
                            <span className="block text-[11px] font-mono text-slate-400 font-normal">
                              {c.customerId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.mobile || c.primaryMobile}</span>
                      </div>
                      {c.email && <div className="text-xs text-slate-400 mt-0.5">{c.email}</div>}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.address?.village || c.village || 'N/A'}, {c.address?.district || c.district || ''}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        <Tractor className="w-3 h-3 text-slate-500" />
                        {c.tractorCount || (c.tractors ? c.tractors.length : 0)} Tractors
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Profile"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/service/customers/${c._id}`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Customer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(c)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Customer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(c)
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

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Customer"
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Ramasamy Gounder"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Primary Mobile *"
              placeholder="e.g. 9842156789"
              value={formData.primaryMobile}
              onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alternate Mobile"
              placeholder="e.g. 9842199999"
              value={formData.alternateMobile}
              onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Town"
              placeholder="e.g. Kangeyam"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />
            <div>
              <Select
                label="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Input
              label="PIN Code"
              placeholder="e.g. 638701"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={3}
              placeholder="Special customer requests or landholding notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Customer Profile"
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Primary Mobile *"
              value={formData.primaryMobile}
              onChange={(e) => setFormData({ ...formData, primaryMobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Alternate Mobile"
              value={formData.alternateMobile}
              onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Town"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
            />
            <div>
              <Select
                label="District"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Input
              label="PIN Code"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Update Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Customer Profile"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedCustomer?.fullName}</strong>?
            This will remove their customer profile from the system.
          </p>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            ⚠️ This action cannot be undone. All linked records will be unlinked.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
