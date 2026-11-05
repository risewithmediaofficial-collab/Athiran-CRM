import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  Plus, 
  Lock, 
  Check, 
  Pencil, 
  Eye, 
  Users 
} from 'lucide-react'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function RoleManagement() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await usersApi.getRoles()
      const data = res.data?.data
      setRoles(Array.isArray(data) ? data : data?.roles || [])
    } catch (err) {
      console.error('Failed to load roles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleOpenView = (role) => {
    setSelectedRole(role)
    setIsViewOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Role-Based Access Control (RBAC)</h1>
          <p className="text-sm text-slate-500 mt-1">
            System security roles, department boundaries, and granular permission enforcement
          </p>
        </div>
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" message="Loading security roles and permission matrix..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r._id}
              onClick={() => handleOpenView(r)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
              title="Click anywhere on this card to view permissions"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={r.name.includes('admin') ? 'primary' : 'neutral'}>
                    {r.department}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {r.permissions?.length || 0} permissions
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{r.displayName || r.name}</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {r.description || `Controls access and workflows for the ${r.department} team.`}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => handleOpenView(r)}>
                  View Permissions
                </Button>
                {r.isSystem && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> System Role
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Permissions Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`${selectedRole?.displayName || selectedRole?.name} Permissions`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Assigned granular permissions enforced at backend API routes:
          </p>
          <div className="max-h-96 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1">
            {selectedRole?.permissions?.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{p}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 text-right">
            <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
