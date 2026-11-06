import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Trash2, 
  Eye, 
  Pencil, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { leadsApi } from '../../api/leads'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function LeadManagement() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  // Modals
  const [isReassignOpen, setIsReassignOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [newAssignee, setNewAssignee] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchLeadsAndUsers = async () => {
    try {
      setLoading(true)
      const [lRes, uRes] = await Promise.all([
        leadsApi.getLeads({
          search,
          status: statusFilter || undefined,
          assignedTo: userFilter || undefined,
          limit: 50,
        }),
        usersApi.getUsers({ department: 'Sales', limit: 100 }).catch(() => ({ data: { data: [] } })),
      ])
      const lData = lRes.data?.data
      setLeads(Array.isArray(lData) ? lData : lData?.leads || [])
      const uData = uRes.data?.data
      setUsers(Array.isArray(uData) ? uData : uData?.users || [])
    } catch (err) {
      console.error('Failed to load lead management data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeadsAndUsers()
  }, [search, statusFilter, userFilter])

  const handleOpenReassign = (lead) => {
    setSelectedLead(lead)
    setNewAssignee(users[0]?._id || '')
    setErrorMsg('')
    setIsReassignOpen(true)
  }

  const handleOpenDelete = (lead) => {
    setSelectedLead(lead)
    setIsDeleteOpen(true)
  }

  const handleConfirmReassign = async (e) => {
    e.preventDefault()
    if (!newAssignee) {
      setErrorMsg('Please select a sales executive.')
      return
    }
    try {
      setSubmitting(true)
      setErrorMsg('')
      await leadsApi.reassignLead(selectedLead._id, {
        newAssignedTo: newAssignee,
        reason: 'Administrative pipeline balancing',
      })
      setIsReassignOpen(false)
      fetchLeadsAndUsers()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reassign lead.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedLead) return
    try {
      setSubmitting(true)
      await leadsApi.deleteLead(selectedLead._id)
      setIsDeleteOpen(false)
      fetchLeadsAndUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lead.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Lead Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global sales oversight, team lead reassignments, and pipeline governance
          </p>
        </div>
        <Link to="/leads/new">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Create Lead
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead name, phone, tractor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
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
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'interested', label: 'Interested' },
                { value: 'followup_required', label: 'Follow-up Required' },
                { value: 'visit_planned', label: 'Visit Planned' },
                { value: 'negotiation', label: 'Negotiation' },
                { value: 'booked', label: 'Booked' },
                { value: 'converted', label: 'Converted' },
                { value: 'lost', label: 'Lost' },
              ]}
              placeholder="All Statuses"
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              size="sm"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: '', label: 'All Sales Executives' },
                ...users.map((u) => ({ value: u._id, label: u.fullName })),
              ]}
              placeholder="All Sales Executives"
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading leads for admin management..." />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10 text-slate-300" />}
            title="No Inquiries Found"
            description="No customer inquiries match your current filters."
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Customer / Inquiry</th>
                  <th className="py-3.5 px-6">Tractor Model</th>
                  <th className="py-3.5 px-6">Initiated By</th>
                  <th className="py-3.5 px-6">Assigned Executive</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Lead Source</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr
                    key={l._id}
                    onClick={() => navigate(`/leads/${l._id}`)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to open lead details"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="group-hover:text-primary-600 transition-colors">
                        {l.customerName}
                      </div>
                      <div className="text-xs text-slate-400 font-normal">
                        {l.primaryMobile || l.mobileNumber} • {l.village || 'Tamil Nadu'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-800 font-medium">
                      {l.tractorModelInterested || l.interestedModel || l.tractorModel || 'General Inquiry'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {l.createdBy?.fullName || 'Admin'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {l.createdBy?.employeeId ? `ID: ${l.createdBy.employeeId}` : (l.createdBy?.email || 'Initiator')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {l.assignedTo?.fullName ? (
                        <div>
                          <span className="font-semibold text-slate-800 block">{l.assignedTo.fullName}</span>
                          <span className="text-[11px] text-slate-400 block">{l.assignedTo.designation || 'Sales'}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">
                        {l.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {l.leadSource || 'Direct'}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Lead Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/leads/${l._id}`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Reassign to Executive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenReassign(l)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Lead"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/leads/${l._id}/edit`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Lead"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(l)
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

      {/* Reassign Modal */}
      <Modal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        title="Reassign Customer Lead"
        size="md"
      >
        <form onSubmit={handleConfirmReassign} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Reassigning lead for <strong>{selectedLead?.customerName}</strong> ({selectedLead?.interestedModel || 'Tractor Inquiry'}).
          </p>

          <div>
            <Select
              label="New Sales Executive"
              required
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              options={users.map((u) => ({
                value: u._id,
                label: `${u.fullName} (${u.employeeId || u.designation})`,
              }))}
              placeholder="Select an executive"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsReassignOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Customer Lead"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete lead <strong className="text-slate-900">{selectedLead?.customerName}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ This will cascade and delete all associated activity logs, follow-up reminders, and assignments.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleConfirmDelete}>
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
