import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  KeyRound, 
  Eye, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  AlertCircle 
} from 'lucide-react'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { DEPARTMENTS, DEPARTMENT_DESIGNATIONS } from '../../constants'

export default function EmployeeList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Add / Edit Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    department: 'sales',
    designation: 'Sales Executive',
    role: '',
    accountStatus: 'active',
    joiningDate: new Date().toISOString().split('T')[0],
  })

  // Reset Password State
  const [newPassword, setNewPassword] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [uRes, rRes] = await Promise.all([
        usersApi.getUsers({ search, department: deptFilter || undefined }),
        usersApi.getRoles().catch(() => ({ data: { data: [] } })),
      ])
      const uData = uRes.data?.data
      setUsers(Array.isArray(uData) ? uData : uData?.users || [])
      const rData = rRes.data?.data
      const rolesList = Array.isArray(rData) ? rData : rData?.roles || []
      setRoles(rolesList)
    } catch (err) {
      console.error('Failed to load employees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, deptFilter])

  // Helper to find default role matching department
  const getDefaultRoleForDept = (dept, availableRoles) => {
    if (!availableRoles || availableRoles.length === 0) return ''
    const match = availableRoles.find((r) => r.department?.toLowerCase() === dept.toLowerCase() && !r.name.includes('admin'))
    return match?._id || availableRoles[0]?._id || ''
  }

  const handleOpenAdd = () => {
    const defaultDept = 'sales'
    const defaultDesig = DEPARTMENT_DESIGNATIONS[defaultDept][2] || 'Sales Executive'
    const defaultRole = getDefaultRoleForDept(defaultDept, roles)

    setFormData({
      fullName: '',
      username: '',
      email: '',
      mobile: '',
      password: '',
      department: defaultDept,
      designation: defaultDesig,
      role: defaultRole,
      accountStatus: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
    })
    setFormError('')
    setIsAddOpen(true)
  }

  const handleDepartmentChange = (newDept) => {
    const designations = DEPARTMENT_DESIGNATIONS[newDept] || []
    const firstDesig = designations[0] || 'Staff Member'
    const matchingRole = getDefaultRoleForDept(newDept, roles)

    setFormData((prev) => ({
      ...prev,
      department: newDept,
      designation: firstDesig,
      role: matchingRole || prev.role,
    }))
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    const userDept = (user.department || 'sales').toLowerCase()
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '',
      department: userDept,
      designation: user.designation || 'Sales Executive',
      role: user.role?._id || user.role || '',
      accountStatus: user.accountStatus || 'active',
      joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : '',
    })
    setFormError('')
    setIsEditOpen(true)
  }

  const handleOpenReset = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setFormError('')
    setIsResetOpen(true)
  }

  const handleOpenDelete = (user) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

  const handleSaveAdd = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      setFormError('Full name is required.')
      return
    }
    if (!formData.username.trim()) {
      setFormError('Username (Login ID) is required.')
      return
    }
    if (!formData.email.trim()) {
      setFormError('Valid email address is required.')
      return
    }
    if (!formData.mobile.trim()) {
      setFormError('Mobile number is required.')
      return
    }
    if (!formData.password || formData.password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (!formData.role) {
      setFormError('Please select a system security role.')
      return
    }

    try {
      setSubmitting(true)
      setFormError('')
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        department: formData.department.toLowerCase(),
        designation: formData.designation,
        role: formData.role,
        joiningDate: formData.joiningDate || new Date().toISOString(),
      }
      await usersApi.createUser(payload)
      setIsAddOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create employee account.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setFormError('')
      const updatePayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        department: formData.department.toLowerCase(),
        designation: formData.designation,
        role: formData.role,
        accountStatus: formData.accountStatus,
      }
      await usersApi.updateUser(selectedUser._id, updatePayload)
      if (formData.accountStatus !== selectedUser.accountStatus) {
        await usersApi.updateStatus(selectedUser._id, { accountStatus: formData.accountStatus }).catch(() => {})
      }
      setIsEditOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update employee details.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveReset = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.')
      return
    }
    try {
      setSubmitting(true)
      setFormError('')
      await usersApi.resetPassword(selectedUser._id, { newPassword })
      setIsResetOpen(false)
      alert('Password has been successfully updated.')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      setSubmitting(true)
      await usersApi.deleteUser(selectedUser._id)
      setIsDeleteOpen(false)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee account.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeDesignations = DEPARTMENT_DESIGNATIONS[formData.department] || []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dealership Staff & Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage sales managers, field executives, service advisors, and role permissions
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">All Departments</option>
          <option value="sales">Sales Department</option>
          <option value="service">Service & Workshop</option>
          <option value="management">Management & Operations</option>
          <option value="admin">Administration</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" message="Loading dealership team..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10 text-slate-300" />}
            title="No Employees Found"
            description={search ? 'No team members match your search criteria.' : 'No staff profiles recorded yet. Add your sales executives or service technicians.'}
            action={
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
                Add Employee
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Designation & Role</th>
                  <th className="py-3.5 px-6">Contact Details</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => navigate(`/employees/${u._id}`)}
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group"
                    title="Click anywhere on this row to view employee profile"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs flex items-center justify-center border border-primary-200">
                          {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {u.fullName}
                          </div>
                          <span className="block text-[11px] font-mono text-slate-400">
                            {u.employeeId || `@${u.username}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium text-xs capitalize">
                      {u.department}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-slate-900">{u.designation}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                        <span>{u.role?.displayName || u.role?.name?.replace('_', ' ') || 'Staff'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={u.accountStatus === 'active' ? 'success' : 'danger'}>
                        {u.accountStatus || 'active'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Reset Password"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenReset(u)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          title="View Performance"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/employees/${u._id}`)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Details"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEdit(u)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.username !== 'superadmin' && (
                          <button
                            title="Delete Account"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDelete(u)
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Dealership Employee"
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
              placeholder="e.g. Anand Kumar"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Username (Login ID) *"
              placeholder="e.g. anand_sales"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              placeholder="anand@athiranmotors.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="e.g. 9842188888"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                {Object.entries(DEPARTMENTS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contextual Designation Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                {activeDesignations.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>

            {/* System Security Role Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Security Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                <option value="">-- Select Role --</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.displayName || r.name} ({r.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Temporary Password *"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Input
              label="Joining Date *"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Employee Information"
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
              label="Username (Login ID)"
              value={formData.username}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Mobile Number *"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                {Object.entries(DEPARTMENTS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                {activeDesignations.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                required
              >
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.displayName || r.name} ({r.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Status</label>
            <select
              value={formData.accountStatus}
              onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
              className="w-full h-9 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="active">Active (Access Allowed)</option>
              <option value="inactive">Inactive (Temporarily Disabled)</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Update Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Account Password"
        size="sm"
      >
        <form onSubmit={handleSaveReset} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Set a new temporary password for <strong>{selectedUser?.fullName}</strong>. They will need to re-login on all devices.
          </p>

          <Input
            label="New Password *"
            type="password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Confirm Reset
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Employee Account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete the account of <strong className="text-slate-900">{selectedUser?.fullName}</strong> ({selectedUser?.username})?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ This will remove user access immediately.
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
