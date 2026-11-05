import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  KeyRound,
  AlertCircle 
} from 'lucide-react'
import { usersApi } from '../../api/users'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function EmployeeDetails() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const [uRes, pRes] = await Promise.all([
          usersApi.getUser(id),
          usersApi.getPerformance(id).catch(() => ({ data: { data: {} } })),
        ])
        setUser(uRes.data?.data)
        setPerformance(pRes.data?.data)
      } catch (err) {
        console.error('Failed to load employee details:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading employee performance file..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-300" />}
          title="Employee Not Found"
          description="The requested employee record could not be located."
          action={
            <Link to="/employees">
              <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Staff Directory
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const summary = performance?.summary || {}

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/employees">
          <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.fullName}</h1>
            <Badge variant={user.accountStatus === 'active' ? 'success' : 'danger'}>
              {user.accountStatus || 'active'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.designation} • {user.department} • ID: <span className="font-mono text-slate-700">{user.employeeId || `@${user.username}`}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL LEADS MANAGED"
          value={summary.totalLeads || 0}
          subtitle="Assigned sales inquiries"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="CONVERTED DEALS"
          value={summary.convertedLeads || 0}
          subtitle="Tractors booked & delivered"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="CONVERSION RATE"
          value={summary.conversionRate || '0.0%'}
          subtitle="Lead-to-booking efficiency"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="COMPLETED FOLLOW-UPS"
          value={summary.followupsCompleted || 0}
          subtitle="Customer interactions done"
          icon={<Award className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact & Credentials</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.mobile}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Role: <strong>{user.role?.displayName || user.role?.name || 'Staff'}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined: {new Date(user.joiningDate || user.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Operational Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Active Working Pipeline</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.activeLeads || 0} Leads</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Lost / Dropped Leads</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.lostLeads || 0} Leads</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 text-xs text-primary-800">
            Workload and active leads are automatically updated when follow-ups are closed or leaves are scheduled with lead handover.
          </div>
        </div>
      </div>
    </div>
  )
}
