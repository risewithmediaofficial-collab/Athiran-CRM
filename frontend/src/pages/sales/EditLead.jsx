import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import leadsApi from '../../api/leads'
import usersApi from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Tractor,
  IndianRupee,
  AlertCircle,
  Save,
  ArrowLeft,
  Trash2,
  Calendar,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import { 
  LEAD_SOURCES, 
  LEAD_TEMPERATURES, 
  LEAD_STATUSES, 
  LEAD_PRIORITIES, 
  TAMIL_NADU_DISTRICTS, 
  INDIAN_STATES, 
  TRACTOR_MODELS 
} from '../../constants'

const HP_OPTIONS = [
  { value: '35', label: '35 HP (Compact / Orchard)' },
  { value: '42', label: '42 HP (Standard Utility)' },
  { value: '45', label: '45 HP (Multi-Purpose 2WD)' },
  { value: '48', label: '48 HP (Heavy Utility)' },
  { value: '50', label: '50 HP (4WD High Traction)' },
  { value: '52', label: '52 HP (Field Specialist)' },
  { value: '55', label: '55 HP (Heavy Duty 4WD)' },
  { value: '60', label: '60 HP (Commercial & Rotavator)' },
  { value: '75', label: '75 HP (Turbo Commercial)' },
]

const PURCHASE_PURPOSES = [
  'Agriculture & Farming',
  'Commercial Haulage & Transport',
  'Paddy & Wetland Cultivation',
  'Orchard & Vineyard Inter-cultivation',
  'Heavy Tillage / Rotavator Work',
  'Contract Hiring Business',
  'Other / General Purpose',
]

const leadEditSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  primaryMobile: z.string().min(10, 'Valid 10-digit mobile number required'),
  alternateMobile: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  address: z.string().optional(),
  leadDate: z.string().optional(),

  leadTemperature: z.enum(['hot', 'warm', 'cold']),
  leadSource: z.string().min(1, 'Lead source is required'),
  status: z.string().min(1, 'Status is required'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),

  tractorModelInterested: z.string().optional(),
  horsepowerRequirement: z.union([z.coerce.number(), z.literal('')]).optional(),
  purposeOfPurchase: z.string().optional(),
  agriculturalLandArea: z.union([z.coerce.number(), z.literal('')]).optional(),
  estimatedBudget: z.union([z.coerce.number(), z.literal('')]).optional(),
  financingRequired: z.boolean().default(false),
  exchangeRequired: z.boolean().default(false),
  remarks: z.string().optional(),
  assignedTo: z.string().optional(),
})

export default function EditLead() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAdmin, hasPermission } = useAuth()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    usersApi
      .getUsers({ limit: 100, accountStatus: 'active' })
      .then((res) => {
        const uList = res.data?.data?.users || (Array.isArray(res.data?.data) ? res.data?.data : [])
        setUsers(uList)
      })
      .catch((err) => {
        console.error('Failed to load users for assignment', err)
      })
  }, [])

  const { data: leadData, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await leadsApi.getLead(id)
      return res.data?.data
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadEditSchema),
  })

  useEffect(() => {
    if (leadData) {
      reset({
        customerName: leadData.customerName || '',
        primaryMobile: leadData.primaryMobile || '',
        alternateMobile: leadData.alternateMobile || '',
        email: leadData.email || '',
        village: leadData.village || '',
        district: leadData.district || '',
        state: leadData.state || '',
        pinCode: leadData.pinCode || '',
        address: leadData.address || '',
        leadDate: leadData.leadDate
          ? new Date(leadData.leadDate).toISOString().split('T')[0]
          : (leadData.createdAt ? new Date(leadData.createdAt).toISOString().split('T')[0] : ''),
        leadTemperature: leadData.leadTemperature || 'warm',
        leadSource: leadData.leadSource || 'walk_in',
        status: leadData.status || 'new',
        priority: leadData.priority || 'medium',
        tractorModelInterested: leadData.tractorModelInterested || '',
        horsepowerRequirement: leadData.horsepowerRequirement || '',
        purposeOfPurchase: leadData.purposeOfPurchase || '',
        agriculturalLandArea: leadData.agriculturalLandArea || '',
        estimatedBudget: leadData.estimatedBudget || '',
        financingRequired: Boolean(leadData.financingRequired),
        exchangeRequired: Boolean(leadData.exchangeRequired),
        remarks: leadData.remarks || '',
        assignedTo: leadData.assignedTo?._id || leadData.assignedTo || '',
      })
    }
  }, [leadData, reset])

  const onSubmit = async (formData) => {
    setServerError('')
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        agriculturalLandArea: formData.agriculturalLandArea ? Number(formData.agriculturalLandArea) : undefined,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
        horsepowerRequirement: formData.horsepowerRequirement ? Number(formData.horsepowerRequirement) : undefined,
      }
      await leadsApi.updateLead(id, payload)
      navigate(`/leads/${id}`)
    } catch (err) {
      setServerError(
        err.response?.data?.error?.message || 'Failed to update lead. Please verify inputs.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete lead ${leadData?.customerName}? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await leadsApi.deleteLead(id)
      navigate('/leads')
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to delete lead.')
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading lead details..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Sales CRM', href: '/sales' },
          { label: 'Leads', href: '/leads' },
          { label: leadData?.customerName || 'Lead', href: `/leads/${id}` },
          { label: 'Edit' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Edit Lead: {leadData?.customerName}</h1>
          <p className="text-xs text-content-secondary mt-0.5 font-mono">
            ID: {leadData?.leadId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/leads/${id}`)}
            leftIcon={ArrowLeft}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            leftIcon={Trash2}
          >
            Delete Lead
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-status-danger-bg border border-red-200 flex items-start gap-3 text-xs text-status-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Contact */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-content-primary">
              1. Customer Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Full Name"
              required
              error={errors.customerName?.message}
              {...register('customerName')}
            />

            <Input
              label="Primary Mobile Number"
              required
              leftIcon={Phone}
              error={errors.primaryMobile?.message}
              {...register('primaryMobile')}
            />

            <Input
              label="Alternate Mobile"
              leftIcon={Phone}
              {...register('alternateMobile')}
            />

            <Input
              label="Email Address"
              type="email"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Input label="Village / Town" {...register('village')} />
            <Select
              label="District"
              options={TAMIL_NADU_DISTRICTS.map((d) => ({ value: d, label: d }))}
              {...register('district')}
            />
            <Select
              label="State"
              options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
              {...register('state')}
            />
          </div>
        </div>

        {/* Lead Status & Classification */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-content-primary">
              2. Classification & Lifecycle Status
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Lead / Enquiry Date"
              type="date"
              leftIcon={Calendar}
              error={errors.leadDate?.message}
              {...register('leadDate')}
            />

            <Select
              label="Lead Temperature"
              required
              options={Object.entries(LEAD_TEMPERATURES).map(([val, lbl]) => ({
                value: val,
                label: `${lbl} Interest`,
              }))}
              error={errors.leadTemperature?.message}
              {...register('leadTemperature')}
            />

            <Select
              label="Lead Source"
              required
              options={Object.entries(LEAD_SOURCES).map(([val, lbl]) => ({
                value: val,
                label: lbl,
              }))}
              error={errors.leadSource?.message}
              {...register('leadSource')}
            />

            <Select
              label="Lead Status"
              required
              options={Object.entries(LEAD_STATUSES).map(([val, lbl]) => ({
                value: val,
                label: lbl,
              }))}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
        </div>

        {/* Tractor Specs */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Tractor className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-content-primary">
              3. Tractor Requirement & Commercials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Model Interested In"
              options={TRACTOR_MODELS.map((m) => ({ value: m, label: m }))}
              {...register('tractorModelInterested')}
            />

            <Select
              label="Horsepower Requirement"
              options={HP_OPTIONS}
              {...register('horsepowerRequirement')}
            />

            <Select
              label="Purpose of Purchase"
              options={PURCHASE_PURPOSES.map((p) => ({ value: p, label: p }))}
              {...register('purposeOfPurchase')}
            />

            <Input
              label="Estimated Budget (₹)"
              type="number"
              leftIcon={IndianRupee}
              {...register('estimatedBudget')}
            />

            <Input
              label="Land Area (Acres)"
              type="number"
              {...register('agriculturalLandArea')}
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-content-primary cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary w-4 h-4"
                {...register('financingRequired')}
              />
              <span>Requires Financing</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-content-primary cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary w-4 h-4"
                {...register('exchangeRequired')}
              />
              <span>Requires Old Tractor Exchange</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-content-primary mb-1.5">
              Customer Remarks
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-border p-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('remarks')}
            />
          </div>
        </div>

        {/* Section 4: Dealership Assignment & Initiator Info */}
        <div className="card space-y-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-content-primary">
                4. Dealership Assignment & Initiator
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary-50 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Initiated By: <strong>{leadData?.createdBy?.fullName || 'Administrator'}</strong>
                {leadData?.createdAt && ` (${new Date(leadData.createdAt).toLocaleDateString('en-IN')})`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <Select
                label="Assigned Sales Executive / Rep"
                options={[
                  ...(leadData?.assignedTo?._id
                    ? []
                    : [{ value: '', label: '-- Select Assignee --' }]),
                  ...users.map((u) => ({
                    value: u._id,
                    label: `${u.fullName} • ${u.role?.displayName || u.department || 'Sales'}${u.employeeId ? ` (${u.employeeId})` : ''}`,
                  })),
                ]}
                helperText="Change or maintain the sales executive assigned to this lead."
                {...register('assignedTo')}
              />
            </div>

            <div className="bg-surface-raised p-3.5 rounded-xl border border-border text-xs text-content-secondary space-y-1">
              <div className="font-semibold text-content-primary flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Executive Responsibility:</span>
              </div>
              <p>
                The assigned representative is responsible for conducting customer calls, scheduling demos, and logging follow-up outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(`/leads/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            leftIcon={Save}
          >
            Update Lead
          </Button>
        </div>
      </form>
    </div>
  )
}
