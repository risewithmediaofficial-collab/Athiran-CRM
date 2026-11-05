import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import leadsApi from '../../api/leads'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Tractor,
  IndianRupee,
  Calendar,
  AlertCircle,
  Save,
  ArrowLeft,
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

const leadFormSchema = z.object({
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
  status: z.string().default('new'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),

  tractorModelInterested: z.string().optional(),
  horsepowerRequirement: z.union([z.coerce.number(), z.literal('')]).optional(),
  purposeOfPurchase: z.string().optional(),
  agriculturalLandArea: z.union([z.coerce.number(), z.literal('')]).optional(),
  estimatedBudget: z.union([z.coerce.number(), z.literal('')]).optional(),
  financingRequired: z.boolean().default(false),
  exchangeRequired: z.boolean().default(false),
  remarks: z.string().optional(),
})

export default function AddLead() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      customerName: '',
      primaryMobile: '',
      alternateMobile: '',
      email: '',
      village: '',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '',
      address: '',
      leadDate: new Date().toISOString().split('T')[0],
      leadTemperature: 'warm',
      leadSource: 'walk_in',
      status: 'new',
      priority: 'medium',
      tractorModelInterested: 'Athiran PowerTrac 45 HP',
      purposeOfPurchase: 'Agriculture',
      agriculturalLandArea: '',
      estimatedBudget: '',
      financingRequired: true,
      exchangeRequired: false,
      remarks: '',
    },
  })

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
      const res = await leadsApi.createLead(payload)
      const created = res.data?.data
      navigate(`/leads/${created._id}`)
    } catch (err) {
      setServerError(
        err.response?.data?.error?.message || 'Failed to create lead. Please check the inputs.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Sales CRM', href: '/sales' },
          { label: 'Leads', href: '/leads' },
          { label: 'Create New Lead' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">New Sales Inquiry</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Record customer details, tractor preferences, and commercial specifications
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/leads')}
          leftIcon={ArrowLeft}
        >
          Cancel
        </Button>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-status-danger-bg border border-red-200 flex items-start gap-3 text-xs text-status-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Customer Contact Information */}
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
              placeholder="e.g. Ramasamy Gounder"
              required
              error={errors.customerName?.message}
              {...register('customerName')}
            />

            <Input
              label="Primary Mobile Number"
              placeholder="e.g. 9842156789"
              required
              leftIcon={Phone}
              error={errors.primaryMobile?.message}
              {...register('primaryMobile')}
            />

            <Input
              label="Alternate Mobile"
              placeholder="Optional backup phone"
              leftIcon={Phone}
              {...register('alternateMobile')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="farmer@example.com"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Input
              label="Village / Town"
              placeholder="e.g. Kangeyam / Pollachi"
              {...register('village')}
            />

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

        {/* Section 2: Lead Classification & Source */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-content-primary">
              2. Lead Classification & Date
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Lead / Enquiry Date"
              type="date"
              required
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
              label="Initial Status"
              options={Object.entries(LEAD_STATUSES).map(([val, lbl]) => ({
                value: val,
                label: lbl,
              }))}
              {...register('status')}
            />
          </div>
        </div>

        {/* Section 3: Tractor Enquiry Details */}
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
              placeholder="e.g. 750000"
              leftIcon={IndianRupee}
              {...register('estimatedBudget')}
            />

            <Input
              label="Agricultural Land Area (Acres)"
              type="number"
              placeholder="e.g. 10"
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
              <span>Requires Bank / Dealership Financing</span>
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
              Specific Customer Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Customer requirements, soil condition, crop type, preferred implements..."
              className="w-full rounded-lg border border-border p-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('remarks')}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/leads')}
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
            Save & Open Lead
          </Button>
        </div>
      </form>
    </div>
  )
}
