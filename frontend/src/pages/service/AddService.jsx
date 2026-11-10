import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { 
  Wrench, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Tractor as TractorIcon, 
  CheckCircle2, 
  AlertCircle,
  Info,
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import useTractorModels from '../../hooks/useTractorModels'
import TractorModelSpecsModal from '../../components/tractors/TractorModelSpecsModal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AddService() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preTractorId = searchParams.get('tractorId')
  const preCustomerId = searchParams.get('customerId')

  const { models: catalogModels, findModelByName } = useTractorModels()

  const [customers, setCustomers] = useState([])
  const [tractors, setTractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [specModalModel, setSpecModalModel] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    customer: preCustomerId || '',
    tractor: preTractorId || '',
    catalogModelName: '',
    registrationNumber: '',
    serviceType: 'routine_paid',
    scheduledDate: new Date().toISOString().split('T')[0],
    currentEngineHours: '',
    serviceLocation: 'dealership',
    customerComplaints: '',
    workPerformed: '',
    status: 'in_progress',
    laborCost: '',
    discount: '',
    recommendations: '',
  })

  // Dynamic Parts Line Items
  const [parts, setParts] = useState([])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [custRes, tracRes] = await Promise.all([
          serviceApi.getCustomers({ limit: 100 }),
          serviceApi.getTractors({ limit: 100 }),
        ])
        const cList = custRes.data?.data?.customers || custRes.data?.data || []
        const tList = tracRes.data?.data?.tractors || tracRes.data?.data || []
        setCustomers(cList)
        setTractors(tList)

        if (preTractorId && !formData.tractor) {
          const matched = tList.find((t) => t._id === preTractorId)
          if (matched) {
            setFormData((prev) => ({
              ...prev,
              tractor: matched._id,
              customer: matched.customer?._id || matched.customer || prev.customer,
              currentEngineHours: matched.currentEngineHours || '',
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Auto-filter tractors if a customer is selected
  const availableTractors = formData.customer
    ? tractors.filter((t) => String(t.customer?._id || t.customer) === String(formData.customer))
    : tractors

  const selectedFleetTractor = formData.tractor
    ? tractors.find((t) => t._id === formData.tractor)
    : null

  const activeSpecModel = selectedFleetTractor
    ? findModelByName(selectedFleetTractor.model || selectedFleetTractor.modelName)
    : formData.catalogModelName
      ? findModelByName(formData.catalogModelName)
      : null

  const tractorSelectValue = formData.tractor
    ? formData.tractor
    : formData.catalogModelName
      ? `catalog:${formData.catalogModelName}`
      : ''

  const tractorDropdownOptions = [
    { value: '', label: '-- Select Tractor Model --' },
    ...availableTractors.map((t) => ({
      value: t._id,
      label: `${t.model || t.modelName || 'Tractor'} (${t.registrationNumber || t.chassisNumber || 'No Reg'}) - ${t.currentEngineHours || 0} hrs`,
      description: `Registered Customer Tractor${t.customer?.customerName ? ` • ${t.customer.customerName}` : ''}`,
    })),
    ...catalogModels.map((m) => ({
      value: `catalog:${m.modelName}`,
      label: m.modelName,
      description: [m.hpDisplay, m.category || m.brand].filter(Boolean).join(' • ') || 'Massey Ferguson Catalog',
    })),
  ]

  const handleTractorChange = (selectedVal) => {
    if (!selectedVal) {
      setFormData((prev) => ({
        ...prev,
        tractor: '',
        catalogModelName: '',
        registrationNumber: '',
      }))
      return
    }

    if (selectedVal.startsWith('catalog:')) {
      const modelName = selectedVal.slice('catalog:'.length)
      setFormData((prev) => ({
        ...prev,
        tractor: '',
        catalogModelName: modelName,
      }))
      return
    }

    const selected = tractors.find((t) => t._id === selectedVal)
    setFormData((prev) => ({
      ...prev,
      tractor: selectedVal,
      catalogModelName: '',
      registrationNumber: '',
      customer: selected?.customer?._id || selected?.customer || prev.customer,
      currentEngineHours: selected?.currentEngineHours || prev.currentEngineHours,
    }))
  }

  // Parts management
  const handleAddPart = () => {
    setParts([...parts, { partName: '', partNumber: '', quantity: '', unitPrice: '' }])
  }

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index))
  }

  const handlePartChange = (index, field, value) => {
    const updated = [...parts]
    updated[index][field] = value
    setParts(updated)
  }

  // Calculation
  const partsTotal = parts.reduce((sum, p) => sum + (Number(p.quantity || 0) * Number(p.unitPrice || 0)), 0)
  const totalAmount = partsTotal + Number(formData.laborCost || 0)
  const finalAmount = Math.max(0, totalAmount - Number(formData.discount || 0))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.tractor && !formData.catalogModelName) {
      setFormError('Please select a tractor or tractor model.')
      return
    }
    if (!formData.customer) {
      setFormError('Please select a customer.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')

      const partsReplaced = parts
        .filter((p) => p.partName.trim())
        .map((p) => ({
          partName: p.partName.trim(),
          partNumber: p.partNumber.trim(),
          quantity: Number(p.quantity) || 1,
          unitPrice: Number(p.unitPrice) || 0,
          totalPrice: (Number(p.quantity) || 1) * (Number(p.unitPrice) || 0),
        }))

      const selectedCatalog = formData.catalogModelName
        ? findModelByName(formData.catalogModelName)
        : null

      const payload = {
        customer: formData.customer,
        ...(formData.tractor
          ? { tractor: formData.tractor }
          : {
              tractorModelId: selectedCatalog && !selectedCatalog.isFallback ? selectedCatalog._id : undefined,
              tractorModelName: formData.catalogModelName,
              registrationNumber: formData.registrationNumber.trim() || undefined,
            }),
        serviceType: formData.serviceType,
        serviceDate: formData.scheduledDate,
        scheduledDate: formData.scheduledDate,
        currentEngineHours: Number(formData.currentEngineHours) || 0,
        serviceLocation: formData.serviceLocation,
        complaint: formData.customerComplaints.trim() || 'Routine Periodic Service',
        customerComplaints: formData.customerComplaints.trim() || 'Routine Periodic Service',
        workPerformed: formData.workPerformed.trim() || 'Inspection & Lubrication',
        partsReplaced,
        serviceCost: finalAmount,
        cost: {
          partsCost: partsTotal,
          laborCost: Number(formData.laborCost) || 0,
          discount: Number(formData.discount) || 0,
          totalCost: finalAmount,
        },
        status: formData.status,
        recommendations: formData.recommendations.trim(),
      }

      await serviceApi.createService(payload)
      navigate('/service/records')
    } catch (err) {
      console.error('Failed to create service job card:', err)
      setFormError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to create service record.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Preparing service workshop job card form..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link to="/service/records">
          <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Service Job Card</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Record tractor maintenance, spare parts consumption, and workshop labor
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer & Tractor Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TractorIcon className="w-4 h-4 text-primary-600" />
            1. Tractor & Customer Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Customer / Owner"
                required
                value={formData.customer}
                onChange={(e) => {
                  const newCustId = e.target.value
                  const curTractor = tractors.find((t) => t._id === formData.tractor)
                  const curTractorCustId = String(curTractor?.customer?._id || curTractor?.customer || '')
                  const shouldReset = newCustId && curTractor && curTractorCustId !== String(newCustId)
                  setFormData({
                    ...formData,
                    customer: newCustId,
                    tractor: shouldReset ? '' : formData.tractor,
                  })
                }}
                options={[
                  { value: '', label: '-- Choose Customer --' },
                  ...customers.map((c) => ({
                    value: c._id,
                    label: `${c.customerName || c.fullName || 'Customer'} (${c.mobile || c.primaryMobile || 'No Phone'})`,
                  })),
                ]}
                placeholder="-- Choose Customer --"
              />
            </div>

            <div>
              <Select
                label="Tractor Model"
                required
                value={tractorSelectValue}
                onChange={(e) => handleTractorChange(e.target.value)}
                options={tractorDropdownOptions}
                placeholder="-- Select Tractor Model --"
              />
              {activeSpecModel && (
                <div
                  onDoubleClick={() => setSpecModalModel(activeSpecModel)}
                  title="Double-click to view specifications"
                  className="mt-1.5 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 select-none cursor-pointer"
                >
                  <span className="truncate font-medium text-slate-700">
                    {activeSpecModel.modelName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpecModalModel(activeSpecModel)}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold shrink-0 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>View Specs</span>
                  </button>
                </div>
              )}
              {formData.catalogModelName && !formData.tractor && (
                <div className="mt-2.5">
                  <Input
                    label="Registration # (Optional — auto-registers tractor if new)"
                    placeholder="e.g. TN-39-AZ-1234"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
              )}
              {formData.customer && availableTractors.length === 0 && !formData.catalogModelName && (
                <p className="mt-1.5 text-xs text-slate-500">
                  No pre-registered tractors for this customer — select any tractor model above or{' '}
                  <Link to="/service/tractors" className="underline font-semibold text-primary-600 hover:text-primary-700">
                    register one in Fleet
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Service Job Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-600" />
            2. Service Parameters & Readings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Service Type"
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                options={[
                  { value: 'first_free', label: '1st Free Service (50 hrs)' },
                  { value: 'second_free', label: '2nd Free Service (250 hrs)' },
                  { value: 'routine_paid', label: 'Routine Paid Maintenance' },
                  { value: 'major_overhaul', label: 'Major Engine / Gearbox Overhaul' },
                  { value: 'breakdown_repair', label: 'Breakdown / Field Emergency' },
                  { value: 'warranty_repair', label: 'Warranty Replacement' },
                ]}
              />
            </div>

            <Input
              label="Scheduled / In Date *"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />

            <Input
              label="Current Engine Hours"
              type="number"
              step="0.1"
              placeholder="e.g. 248.5"
              value={formData.currentEngineHours}
              onChange={(e) => setFormData({ ...formData, currentEngineHours: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Service Location"
                value={formData.serviceLocation}
                onChange={(e) => setFormData({ ...formData, serviceLocation: e.target.value })}
                options={[
                  { value: 'dealership', label: 'Dealership Workshop Bay' },
                  { value: 'customer_field', label: 'Doorstep / Customer Farm Visit' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Job Card Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In Progress (Bay Occupied)' },
                  { value: 'waiting_parts', label: 'Waiting Parts' },
                  { value: 'completed', label: 'Completed & Ready' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Complaints / Issues</label>
            <textarea
              rows={2}
              placeholder="e.g. Hydraulic arm dropping under heavy load, check oil pressure indicator..."
              value={formData.customerComplaints}
              onChange={(e) => setFormData({ ...formData, customerComplaints: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Done / Action Taken</label>
            <textarea
              rows={2}
              placeholder="e.g. Replaced hydraulic seal, cleaned primary diesel strainer, torqued wheel nuts..."
              value={formData.workPerformed}
              onChange={(e) => setFormData({ ...formData, workPerformed: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>
        </div>

        {/* Section 3: Spare Parts Replaced */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Spare Parts & Lubricants
            </h2>
            <Button variant="ghost" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={handleAddPart}>
              Add Spare Part
            </Button>
          </div>

          <div className="space-y-3">
            {parts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No spare parts added yet. Click &quot;Add Spare Part&quot; if new filters or lubricants were used.
              </div>
            ) : (
              parts.map((part, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="col-span-12 sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Part Name (e.g. Fuel Filter)"
                    value={part.partName}
                    onChange={(e) => handlePartChange(index, 'partName', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Part #"
                    value={part.partNumber}
                    onChange={(e) => handlePartChange(index, 'partNumber', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Qty"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    placeholder="Rate (₹)"
                    value={part.unitPrice}
                    onChange={(e) => handlePartChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemovePart(index)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Section 4: Cost Calculation & Bill Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            4. Billing & Final Job Amount
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Parts Subtotal</span>
              <p className="text-lg font-bold text-slate-900 mt-1">₹{partsTotal.toLocaleString('en-IN')}</p>
            </div>

            <Input
              label="Labor Charges (₹)"
              type="number"
              placeholder="e.g. 500"
              value={formData.laborCost}
              onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
            />

            <Input
              label="Dealership Discount (₹)"
              type="number"
              placeholder="e.g. 0"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            />
          </div>

          <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-900">Final Bill Payable</span>
            <span className="text-2xl font-extrabold text-primary-950 font-mono">
              ₹{finalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Advisor Recommendations</label>
            <textarea
              rows={2}
              placeholder="e.g. Advise customer to check water separator weekly during rainy field operations..."
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/service/records">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" loading={submitting}>
            Create Job Card
          </Button>
        </div>
      </form>

      <TractorModelSpecsModal
        isOpen={Boolean(specModalModel)}
        onClose={() => setSpecModalModel(null)}
        model={specModalModel}
      />
    </div>
  )
}
