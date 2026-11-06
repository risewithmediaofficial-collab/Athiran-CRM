import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import leadsApi from '../../api/leads'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { 
  Plus, 
  Phone, 
  IndianRupee, 
  Eye, 
  GripVertical, 
  ArrowRightLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

const PIPELINE_COLUMNS = [
  { id: 'new', label: 'New Inquiries', color: 'border-blue-500', headerBg: 'bg-blue-50/60 text-blue-900 border-blue-200' },
  { id: 'contacted', label: 'Contacted', color: 'border-indigo-500', headerBg: 'bg-indigo-50/60 text-indigo-900 border-indigo-200' },
  { id: 'interested', label: 'Interested / Demo', color: 'border-purple-500', headerBg: 'bg-purple-50/60 text-purple-900 border-purple-200' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-amber-500', headerBg: 'bg-amber-50/60 text-amber-900 border-amber-200' },
  { id: 'booking_pending', label: 'Booking Pending', color: 'border-orange-500', headerBg: 'bg-orange-50/60 text-orange-900 border-orange-200' },
  { id: 'converted', label: 'Converted Deals', color: 'border-emerald-500', headerBg: 'bg-emerald-50/60 text-emerald-900 border-emerald-200' },
]

export default function SalesPipeline() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [localLeads, setLocalLeads] = useState([])
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['leadsPipeline'],
    queryFn: async () => {
      const res = await leadsApi.getLeads({ limit: 100 })
      return res.data?.data?.leads || (Array.isArray(res.data?.data) ? res.data?.data : [])
    },
  })

  useEffect(() => {
    if (data) {
      setLocalLeads(data)
    }
  }, [data])

  // Drag & Drop Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(leadId)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (dragOverCol === colId) {
      setDragOverCol(null)
    }
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain') || draggingId
    setDraggingId(null)
    setDragOverCol(null)
    if (leadId) {
      handleMoveStage(leadId, targetStatus)
    }
  }

  // Move Stage Handler (used by both Drag-and-Drop and Select dropdown)
  const handleMoveStage = async (leadId, targetStatus) => {
    const currentLead = localLeads.find((l) => l._id === leadId)
    if (!currentLead) return
    const currentStatus = currentLead.status === 'demo_planned' ? 'interested' : currentLead.status
    if (currentStatus === targetStatus) return

    const previousStatus = currentLead.status

    // Optimistically update local state immediately for zero latency
    setLocalLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, status: targetStatus } : l))
    )

    try {
      setIsUpdating(true)
      await leadsApi.updateLead(leadId, { status: targetStatus })
      queryClient.invalidateQueries({ queryKey: ['leadsPipeline'] })
      queryClient.invalidateQueries({ queryKey: ['leadStatsSummary'] })
    } catch (err) {
      console.error('Failed to move stage:', err)
      // Revert optimistic update
      setLocalLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: previousStatus } : l))
      )
      alert(err.response?.data?.message || 'Failed to update deal stage.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" message="Loading sales pipeline..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Sales CRM', href: '/sales' },
          { label: 'Pipeline Kanban' },
        ]}
      />

      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Tractor Sales Pipeline</h1>
            {isUpdating && (
              <span className="text-xs text-primary font-medium flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Updating stage...
              </span>
            )}
          </div>
          <p className="text-xs text-content-secondary mt-0.5">
            Drag cards between stages or use the select dropdown to advance deals • Inline scrollable columns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/leads">
            <Button variant="secondary" size="md">
              Table View
            </Button>
          </Link>
          <Link to="/leads/new">
            <Button variant="primary" size="md" leftIcon={Plus}>
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanban Board Container with Smooth Inline Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar select-none min-h-[620px]">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = localLeads.filter(
            (l) => l.status === col.id || (col.id === 'interested' && l.status === 'demo_planned')
          )
          const isTarget = dragOverCol === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-76 shrink-0 rounded-2xl p-3 border transition-all flex flex-col h-[calc(100vh-230px)] min-h-[540px] max-h-[820px] ${
                isTarget
                  ? 'border-primary-500 bg-primary-50/40 ring-2 ring-primary-500/20 shadow-md'
                  : 'bg-surface-raised border-border'
              }`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-content-primary">
                    {col.label}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-surface border border-border text-[11px] font-bold text-content-secondary flex items-center justify-center">
                    {colLeads.length}
                  </span>
                </div>
                {isTarget && (
                  <span className="text-[10px] font-semibold text-primary-700 bg-primary-100/70 px-2 py-0.5 rounded-full animate-pulse">
                    Drop here
                  </span>
                )}
              </div>

              {/* Column Cards Container with Inline Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
                {colLeads.length === 0 ? (
                  <div className={`text-center py-12 rounded-xl border border-dashed transition-colors ${
                    isTarget ? 'border-primary-300 bg-primary-50/30 text-primary-700' : 'border-slate-200 text-content-tertiary'
                  } text-xs`}>
                    {isTarget ? 'Release to drop deal here' : 'No deals in this stage'}
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const isDragging = draggingId === lead._id

                    return (
                      <div
                        key={lead._id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, lead._id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface rounded-xl p-3.5 border border-border shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-primary-500' : 'hover:border-primary-300'
                        }`}
                      >
                        {/* Top Card Row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-content-tertiary shrink-0" />
                            <span className="font-mono text-[10px] text-content-tertiary font-semibold truncate">
                              {lead.leadId}
                            </span>
                          </div>
                          <Badge type="lead_temperature" value={lead.leadTemperature} />
                        </div>

                        {/* Customer & Details */}
                        <h4
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="font-bold text-xs text-content-primary mb-1 hover:text-primary transition-colors cursor-pointer flex items-center justify-between group"
                        >
                          <span className="truncate">{lead.customerName}</span>
                          <Eye className="w-3.5 h-3.5 text-content-tertiary group-hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>

                        <div className="text-[11px] text-content-secondary mb-2 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-content-tertiary shrink-0" />
                          <span>{lead.primaryMobile || lead.mobile}</span>
                        </div>

                        <div className="text-[11px] font-medium text-content-primary bg-surface-raised p-2 rounded-lg border border-border-subtle mb-2.5 truncate">
                          {lead.tractorModelInterested || 'General Inquiry'}
                        </div>

                        {lead.estimatedBudget && (
                          <div className="flex items-center justify-between text-[11px] text-content-secondary pt-1 mb-2.5 border-t border-border-subtle">
                            <span>Budget</span>
                            <span className="font-semibold text-content-primary flex items-center font-mono">
                              ₹{Number(lead.estimatedBudget).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}

                        {/* Card Stage Selector & Quick Action Bar */}
                        <div
                          className="pt-2 border-t border-border-subtle flex items-center justify-between gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1 text-[11px] text-content-tertiary">
                            <ArrowRightLeft className="w-3 h-3 text-content-tertiary shrink-0" />
                            <span className="hidden sm:inline">Move:</span>
                          </div>
                          <div className="flex-1 min-w-0 max-w-[155px]">
                            <Select
                              size="sm"
                              value={lead.status === 'demo_planned' ? 'interested' : lead.status}
                              onChange={(e) => handleMoveStage(lead._id, e.target.value)}
                              options={PIPELINE_COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
                              triggerClassName="text-[11px] font-medium h-7 py-0.5 px-2 rounded-lg border-border bg-surface text-content-primary shadow-none"
                            />
                          </div>
                          <button
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            title="Open Full Lead Details"
                            className="p-1 rounded-md text-content-tertiary hover:text-primary hover:bg-surface-raised transition-colors shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

