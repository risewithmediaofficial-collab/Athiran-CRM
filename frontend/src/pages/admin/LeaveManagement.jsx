import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Check, 
  X, 
  Trash2, 
  Users, 
  ShieldAlert, 
  ArrowRightLeft, 
  AlertCircle,
  Eye,
  Clock,
  UserCheck
} from 'lucide-react'
import { leaveApi } from '../../api/leave'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleOpenView = (leave) => {
    setSelectedLeave(leave)
    setIsViewOpen(true)
  }

  // Approve / Handover State
  const [handoverOption, setHandoverOption] = useState('admin_supervision') // 'admin_supervision' or 'delegate_colleague'
  const [delegateUserId, setDelegateUserId] = useState('')

  // Reject State
  const [rejectReason, setRejectReason] = useState('')

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const [lRes, uRes] = await Promise.all([
        leaveApi.getLeaves(),
        usersApi.getUsers({ limit: 100 }).catch(() => ({ data: { data: [] } })),
      ])
      const lData = lRes.data?.data
      setLeaves(Array.isArray(lData) ? lData : lData?.leaves || [])
      const uData = uRes.data?.data
      setUsers(Array.isArray(uData) ? uData : uData?.users || [])
    } catch (err) {
      console.error('Failed to load leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const handleOpenApprove = (leave) => {
    setSelectedLeave(leave)
    setHandoverOption('admin_supervision')
    setDelegateUserId(users.find(u => u._id !== leave.user?._id)?._id || '')
    setErrorMsg('')
    setIsApproveOpen(true)
  }

  const handleOpenReject = (leave) => {
    setSelectedLeave(leave)
    setRejectReason('')
    setErrorMsg('')
    setIsRejectOpen(true)
  }

  const handleOpenDelete = (leave) => {
    setSelectedLeave(leave)
    setIsDeleteOpen(true)
  }

  const handleConfirmApprove = async () => {
    try {
      setSubmitting(true)
      setErrorMsg('')
      await leaveApi.approveLeave(selectedLeave._id)

      if (handoverOption === 'delegate_colleague' && delegateUserId) {
        await leaveApi.handoverLeads(selectedLeave._id, {
          handoverType: 'delegate',
          assignedTo: delegateUserId,
        }).catch((e) => console.warn('Handover warning:', e))
      }

      setIsApproveOpen(false)
      fetchLeaves()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to approve leave.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setErrorMsg('Please specify the rejection reason.')
      return
    }
    try {
      setSubmitting(true)
      setErrorMsg('')
      await leaveApi.rejectLeave(selectedLeave._id, rejectReason.trim())
      setIsRejectOpen(false)
      fetchLeaves()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reject leave.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true)
      await leaveApi.deleteLeave(selectedLeave._id)
      setIsDeleteOpen(false)
      fetchLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete leave record.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredLeaves = statusFilter === 'all'
    ? leaves
    : leaves.filter(l => l.status === statusFilter)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Leave Approval & Lead Handover</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review employee time-off, configure temporary lead handover supervision, and prevent lead stall
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredLeaves.length} requests
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading employee leave requests..." />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-slate-300" />}
            title="No Leave Applications"
            description="There are no employee leave applications in this category."
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-6">Dates & Duration</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((l) => (
                  <tr
                    key={l._id}
                    onClick={() => handleOpenView(l)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to view full leave details"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div className="group-hover:text-primary-600 transition-colors">{l.user?.fullName || 'Staff Member'}</div>
                      <div className="text-xs text-slate-400 font-normal">{l.user?.department} • {l.user?.designation}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium capitalize">
                      {l.leaveType?.replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div>
                        {new Date(l.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(l.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <span className="font-semibold text-slate-800">{l.numberOfDays || 1} days</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>
                        {l.status}
                      </Badge>
                      {l.rejectionReason && (
                        <span className="block text-[11px] text-red-500 mt-0.5">
                          {l.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View Leave Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenView(l)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {l.status === 'pending' && (
                          <>
                            <button
                              title="Approve & Handover"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenApprove(l)
                              }}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              title="Reject Leave"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenReject(l)
                              }}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          title="Delete Record"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDelete(l)
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Approve Modal with Handover Options */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve Leave & Configure Lead Handover"
        size="md"
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Approve absence for <strong>{selectedLeave?.user?.fullName}</strong> ({selectedLeave?.numberOfDays} days). Select how their active customer inquiries should be handled:
          </p>

          <div className="space-y-3">
            <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
              handoverOption === 'admin_supervision' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="handoverOption"
                  checked={handoverOption === 'admin_supervision'}
                  onChange={() => setHandoverOption('admin_supervision')}
                  className="text-primary-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Option A: Dealership Admin Supervision</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Leads stay under employee's name but notifications & emergency follow-ups trigger to Admin.
                  </div>
                </div>
              </div>
            </label>

            <label className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
              handoverOption === 'delegate_colleague' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="handoverOption"
                  checked={handoverOption === 'delegate_colleague'}
                  onChange={() => setHandoverOption('delegate_colleague')}
                  className="text-primary-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Option B: Delegate to Another Executive</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Temporarily transfer active leads to a covering team member until employee returns.
                  </div>
                </div>
              </div>
            </label>
          </div>

          {handoverOption === 'delegate_colleague' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Covering Staff Member *</label>
              <select
                value={delegateUserId}
                onChange={(e) => setDelegateUserId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
              >
                {users
                  .filter((u) => u._id !== selectedLeave?.user?._id)
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.designation} - {u.department})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleConfirmApprove}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Leave Application"
        size="sm"
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Please enter the business reason for rejecting <strong>{selectedLeave?.user?.fullName}</strong>'s request:
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Critical harvesting week delivery schedule requires full showroom staffing..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 resize-none"
            required
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleConfirmReject}>
              Reject Leave
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Leave Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this leave record?
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleConfirmDelete}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Leave Details Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Leave Application Details"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  {selectedLeave.user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{selectedLeave.user?.fullName || 'Staff Member'}</h4>
                  <p className="text-xs text-slate-500 capitalize">{selectedLeave.user?.department} • {selectedLeave.user?.designation}</p>
                </div>
              </div>
              <Badge variant={selectedLeave.status === 'approved' ? 'success' : selectedLeave.status === 'rejected' ? 'danger' : 'warning'}>
                {selectedLeave.status?.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Leave Type</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedLeave.leaveType?.replace('_', ' ')}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Duration</span>
                <span className="font-semibold text-slate-800">{selectedLeave.numberOfDays || 1} Days</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Start Date</span>
                <span className="font-semibold text-slate-800">{new Date(selectedLeave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">End Date</span>
                <span className="font-semibold text-slate-800">{new Date(selectedLeave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Reason for Leave:</span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedLeave.reason || 'No detailed reason provided.'}</p>
            </div>

            {selectedLeave.rejectionReason && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50">
                <span className="text-xs font-semibold text-red-700 block mb-1">Rejection Reason:</span>
                <p className="text-xs text-red-600">{selectedLeave.rejectionReason}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
