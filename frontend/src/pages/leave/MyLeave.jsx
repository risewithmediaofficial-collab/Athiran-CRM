import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  AlertCircle,
  Eye 
} from 'lucide-react'
import { leaveApi } from '../../api/leave'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function MyLeave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleOpenView = (leave) => {
    setSelectedLeave(leave)
    setIsViewOpen(true)
  }

  const fetchMyLeaves = async () => {
    try {
      setLoading(true)
      const res = await leaveApi.getLeaves()
      const data = res.data?.data
      setLeaves(Array.isArray(data) ? data : data?.leaves || [])
    } catch (err) {
      console.error('Failed to load leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyLeaves()
  }, [])

  const handleOpenCancel = (leave) => {
    setSelectedLeave(leave)
    setIsCancelOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedLeave) return
    try {
      setCancelling(true)
      await leaveApi.deleteLeave(selectedLeave._id)
      setIsCancelOpen(false)
      fetchMyLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave request.')
    } finally {
      setCancelling(false)
    }
  }

  const statusVariant = (st) => {
    switch (st) {
      case 'approved': return 'success'
      case 'rejected': return 'danger'
      case 'pending': return 'warning'
      case 'cancelled': return 'neutral'
      default: return 'neutral'
    }
  }

  const approvedCount = leaves.filter(l => l.status === 'approved').length
  const pendingCount = leaves.filter(l => l.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Leave Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply for absence, review approval decisions, and monitor customer lead handovers
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/leave/calendar">
            <Button variant="secondary" size="sm" icon={<Calendar className="w-4 h-4" />}>
              Team Calendar
            </Button>
          </Link>
          <Link to="/leave/apply">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Apply Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approval</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{leaves.length}</p>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading your leave applications..." />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10 text-slate-300" />}
            title="No Leave Records"
            description="You have not submitted any leave requests yet."
            action={
              <Link to="/leave/apply">
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Apply For Leave
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Leave Type</th>
                  <th className="py-3.5 px-6">Date Range</th>
                  <th className="py-3.5 px-6">Days</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr
                    key={l._id}
                    onClick={() => handleOpenView(l)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to view full leave details"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 capitalize group-hover:text-primary-600 transition-colors">
                      {l.leaveType?.replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(l.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(l.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 text-xs">
                      {l.numberOfDays || 1} {l.numberOfDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={statusVariant(l.status)}>
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
                          <button
                            title="Cancel Leave Request"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenCancel(l)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Leave Request"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this pending leave request?
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsCancelOpen(false)}>
              Keep
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleConfirmCancel}>
              Cancel Leave
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="My Leave Details"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-xs text-slate-500 block">Leave Category</span>
                <span className="font-bold text-slate-900 capitalize text-sm">{selectedLeave.leaveType?.replace('_', ' ')}</span>
              </div>
              <Badge variant={statusVariant(selectedLeave.status)}>
                {selectedLeave.status?.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Duration</span>
                <span className="font-semibold text-slate-800">{selectedLeave.numberOfDays || 1} Days</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block mb-0.5">Date Range</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedLeave.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(selectedLeave.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Reason:</span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedLeave.reason || 'No description provided.'}</p>
            </div>

            {selectedLeave.rejectionReason && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50">
                <span className="text-xs font-semibold text-red-700 block mb-1">Rejection Reason:</span>
                <p className="text-xs text-red-600">{selectedLeave.rejectionReason}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
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
