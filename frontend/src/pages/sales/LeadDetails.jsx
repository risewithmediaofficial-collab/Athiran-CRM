import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import leadsApi from '../../api/leads'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  Phone,
  Mail,
  MapPin,
  Tractor,
  Calendar,
  Clock,
  User,
  Plus,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  FileText,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react'
import { LEAD_STATUSES, LEAD_TEMPERATURES } from '../../constants'

export default function LeadDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activityModalOpen, setActivityModalOpen] = useState(false)
  const [activityType, setActivityType] = useState('outgoing_call')
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0])
  const [activityDesc, setActivityDesc] = useState('')
  const [activityOutcome, setActivityOutcome] = useState('')
  const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  const [submittingActivity, setSubmittingActivity] = useState(false)

  // Fetch lead data
  const { data: leadData, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await leadsApi.getLead(id)
      return res.data?.data
    },
  })

  // Fetch activities timeline
  const { data: activitiesData, isLoading: actLoading } = useQuery({
    queryKey: ['leadActivities', id],
    queryFn: async () => {
      const res = await leadsApi.getActivities(id)
      return res.data?.data || []
    },
  })

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: (newStatus) => leadsApi.updateLead(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', id])
      queryClient.invalidateQueries(['leadActivities', id])
    },
  })

  const handleDeleteLead = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete ${lead?.customerName}? This will also remove all associated activities.`)) {
      return
    }
    try {
      await leadsApi.deleteLead(id)
      navigate('/leads')
    } catch {
      alert('Failed to delete lead. Check permissions.')
    }
  }

  const handleRecordActivity = async (e) => {
    e.preventDefault()
    if (!activityDesc.trim()) return

    setSubmittingActivity(true)
    try {
      await leadsApi.addActivity(id, {
        activityType,
        date: activityDate ? new Date(activityDate).toISOString() : new Date().toISOString(),
        description: activityDesc.trim(),
        outcome: activityOutcome.trim(),
        ...(nextFollowUpDate && { nextFollowUpDate }),
      })
      queryClient.invalidateQueries(['leadActivities', id])
      queryClient.invalidateQueries(['lead', id])
      setActivityModalOpen(false)
      setActivityDesc('')
      setActivityOutcome('')
      setNextFollowUpDate('')
      setActivityDate(new Date().toISOString().split('T')[0])
    } catch {
      // Error handled
    } finally {
      setSubmittingActivity(false)
    }
  }

  if (leadLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading lead profile..." />
      </div>
    )
  }

  const lead = leadData
  if (!lead) {
    return (
      <div className="text-center p-8">
        <h2 className="text-base font-semibold">Lead not found</h2>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/leads')}>
          Back to Leads
        </Button>
      </div>
    )
  }

  const activities = activitiesData || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Sales CRM', href: '/sales' },
          { label: 'All Leads', href: '/leads' },
          { label: lead.customerName },
        ]}
      />

      {/* Header bar */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 bg-surface-raised rounded-md font-semibold text-content-secondary border border-border-subtle">
              {lead.leadId}
            </span>
            <Badge type="lead_temperature" value={lead.leadTemperature} />
            <Badge type="lead_status" value={lead.status} />
          </div>
          <h1 className="text-2xl font-bold text-content-primary mt-2">
            {lead.customerName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-content-secondary mt-1">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-content-tertiary" />
              <a href={`tel:${lead.primaryMobile}`} className="hover:text-primary font-medium">
                {lead.primaryMobile}
              </a>
            </span>
            {lead.village && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-content-tertiary" />
                {lead.village}, {lead.district || ''}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-content-tertiary" />
              Enquiry Date: {new Date(lead.leadDate || lead.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick status selector */}
          <div className="min-w-[170px]">
            <Select
              size="sm"
              value={lead.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              disabled={statusMutation.isPending}
              options={Object.entries(LEAD_STATUSES).map(([val, lbl]) => ({
                value: val,
                label: `Status: ${lbl}`,
              }))}
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setActivityModalOpen(true)}
          >
            Log Activity
          </Button>

          <Link to={`/leads/${id}/edit`}>
            <Button variant="secondary" size="sm" leftIcon={Edit}>
              Edit
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={handleDeleteLead}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Enquiry specs & Customer profile */}
        <div className="space-y-6 lg:col-span-1">
          {/* Tractor requirements card */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Tractor className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-content-primary">
                Tractor Specifications
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-content-tertiary block">Preferred Model</span>
                <span className="font-semibold text-content-primary text-sm">
                  {lead.tractorModelInterested || 'General Enquiry'}
                </span>
              </div>

              {lead.horsepowerRequirement && (
                <div>
                  <span className="text-content-tertiary block">Horsepower Requirement</span>
                  <span className="font-medium text-content-primary">
                    {lead.horsepowerRequirement} HP
                  </span>
                </div>
              )}

              {lead.estimatedBudget && (
                <div>
                  <span className="text-content-tertiary block">Estimated Budget</span>
                  <span className="font-semibold text-content-primary">
                    ₹{(lead.estimatedBudget).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {lead.agriculturalLandArea && (
                <div>
                  <span className="text-content-tertiary block">Land Area</span>
                  <span className="font-medium text-content-primary">
                    {lead.agriculturalLandArea} Acres
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-2">
                {lead.financingRequired && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                    Financing Required
                  </span>
                )}
                {lead.exchangeRequired && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200">
                    Exchange Required
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Representative & Follow-up */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-content-primary">
                Dealership Assignment
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-content-tertiary block">Assigned Executive</span>
                <span className="font-semibold text-content-primary">
                  {lead.assignedTo?.fullName || 'Not assigned'}
                </span>
                {lead.assignedTo?.mobile && (
                  <span className="text-content-secondary block">
                    {lead.assignedTo.mobile}
                  </span>
                )}
              </div>

              {lead.nextFollowUpDate && (
                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-content-tertiary block">Next Follow-up</span>
                  <div className="flex items-center gap-1.5 text-primary font-semibold mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(lead.nextFollowUpDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              )}

              {lead.remarks && (
                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-content-tertiary block">Remarks</span>
                  <p className="text-content-secondary mt-1 italic">
                    "{lead.remarks}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Activity History Timeline */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-content-primary">
              Interaction Timeline & Activities ({activities.length})
            </h2>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={() => setActivityModalOpen(true)}
            >
              Add Interaction
            </Button>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-xs text-content-tertiary">
                No recorded interactions yet. Click "Add Interaction" to log calls or customer visits.
              </div>
            ) : (
              <div className="max-h-[560px] overflow-y-auto pr-3 custom-scrollbar">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {activities.map((act) => (
                    <div key={act._id} className="relative group">
                      <div className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-primary" />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-content-primary capitalize">
                              {act.activityType.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-content-tertiary">
                              by {act.performedBy?.fullName || 'Staff'}
                            </span>
                          </div>
                          <p className="text-xs text-content-secondary mt-1">
                            {act.description}
                          </p>
                          {act.outcome && (
                            <div className="mt-1.5 p-2 rounded-lg bg-surface-raised border border-border-subtle text-xs text-content-primary">
                              <span className="font-semibold text-[11px] text-content-tertiary uppercase">Outcome: </span>
                              {act.outcome}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-semibold text-primary block">
                            Spoken: {new Date(act.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-content-tertiary">
                            {new Date(act.date).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      <Modal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title="Record Customer Interaction"
      >
        <form onSubmit={handleRecordActivity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <Select
              label="Interaction Type"
              required
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              options={[
                { value: 'outgoing_call', label: 'Outgoing Phone Call' },
                { value: 'incoming_call', label: 'Incoming Phone Call' },
                { value: 'whatsapp', label: 'WhatsApp Message' },
                { value: 'customer_visit', label: 'Field / Farm Visit' },
                { value: 'showroom_visit', label: 'Dealership Showroom Visit' },
                { value: 'demo', label: 'Tractor Demonstration' },
                { value: 'negotiation', label: 'Price Negotiation' },
                { value: 'note', label: 'Internal Note' },
              ]}
            />

            <Input
              label="Interaction Date"
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Discussion Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={activityDesc}
              onChange={(e) => setActivityDesc(e.target.value)}
              placeholder="What did the customer say? What models did you demonstrate?"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </div>

          <Input
            label="Outcome / Next Action"
            placeholder="e.g. Test drive scheduled for Friday"
            value={activityOutcome}
            onChange={(e) => setActivityOutcome(e.target.value)}
          />

          <Input
            label="Schedule Next Follow-Up (Optional)"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setActivityModalOpen(false)}
              className="rounded-xl min-h-[38px] px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submittingActivity}
              className="rounded-xl min-h-[38px] px-5 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Activity
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
