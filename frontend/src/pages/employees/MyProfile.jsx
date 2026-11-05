import React, { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

export default function MyProfile() {
  const { user } = useAuth()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    try {
      setSubmitting(true)
      setErrorMsg('')
      await usersApi.resetPassword(user?._id || user?.id, { newPassword })
      setIsPasswordModalOpen(false)
      setSuccessMsg('Your password has been updated successfully.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Dealership Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Personal credentials, department assignments, and security settings
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<KeyRound className="w-4 h-4" />}
          onClick={() => {
            setNewPassword('')
            setConfirmPassword('')
            setErrorMsg('')
            setIsPasswordModalOpen(true)
          }}
        >
          Change Password
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center border border-primary-200">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {user?.designation || 'Staff'} • {user?.department || 'Dealership'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <User className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-xs text-slate-400">Username (Login ID)</span>
              <span className="font-semibold text-slate-900 font-mono">@{user?.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-xs text-slate-400">Email Address</span>
              <span className="font-semibold text-slate-900">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-xs text-slate-400">Mobile Number</span>
              <span className="font-semibold text-slate-900">{user?.mobile || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <div>
              <span className="block text-xs text-slate-400">Security Role</span>
              <span className="font-semibold text-slate-900 capitalize">
                {user?.role?.displayName || user?.role?.name?.replace('_', ' ') || user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Your Password"
        size="sm"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="New Password *"
            type="password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password *"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
