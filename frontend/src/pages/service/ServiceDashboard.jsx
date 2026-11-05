import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wrench, 
  Users, 
  Tractor as TractorIcon, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Sparkles
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ServiceDashboard() {
  const [stats, setStats] = useState(null)
  const [recentServices, setRecentServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, servicesRes] = await Promise.all([
        serviceApi.getServiceStats().catch(() => ({ data: { data: {} } })),
        serviceApi.getServices({ limit: 5, sort: '-scheduledDate' }).catch(() => ({ data: { data: { services: [] } } }))
      ])
      setStats(statsRes.data?.data || {})
      setRecentServices(servicesRes.data?.data?.services || servicesRes.data?.data || [])
    } catch (err) {
      console.error('Error fetching service dashboard:', err)
      setError('Failed to load service metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" message="Loading Service Operations Dashboard..." />
      </div>
    )
  }

  const statusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'scheduled': return 'info'
      case 'waiting_parts': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'neutral'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tractor Service & Workshop</h1>
          <p className="text-sm text-slate-500 mt-1">
            Engine-hour predictive maintenance, workshop job cards, and customer fleet service tracking
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/service/customers">
            <Button variant="secondary" size="sm" icon={<Users className="w-4 h-4" />}>
              Customers
            </Button>
          </Link>
          <Link to="/service/tractors">
            <Button variant="secondary" size="sm" icon={<TractorIcon className="w-4 h-4" />}>
              Fleet
            </Button>
          </Link>
          <Link to="/service/records/new">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              New Job Card
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL REGISTERED FLEET"
          value={stats?.totalTractors || 0}
          subtitle="Tractors under active support"
          icon={<TractorIcon className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="SERVICES SCHEDULED TODAY"
          value={stats?.servicesToday || 0}
          subtitle="Booked workshop appointments"
          icon={<Calendar className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="ACTIVE IN-WORKSHOP JOBS"
          value={stats?.inProgressCount || 0}
          subtitle="Currently on service bays"
          icon={<Wrench className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="ENGINE-HOUR ALERTS"
          value={stats?.serviceDueTractorsCount || 0}
          subtitle="Maintenance predicted overdue"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Service Job Cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary-600" />
              <h2 className="text-base font-semibold text-slate-900">Recent Service Records</h2>
            </div>
            <Link to="/service/records" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentServices.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">No Service Records Logged</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Start logging tractor maintenance, engine hour services, or customer repairs.
                </p>
                <div className="mt-4">
                  <Link to="/service/records/new">
                    <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                      Create First Job Card
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentServices.map((svc) => (
                <div key={svc._id} className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                      <TractorIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {svc.tractor?.model || 'Tractor Service'}
                        </span>
                        <Badge variant={statusBadgeVariant(svc.status)}>
                          {svc.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {svc.customer?.fullName || 'Walk-in'} • {svc.serviceType || 'Routine Maintenance'} • {svc.currentEngineHours ? `${svc.currentEngineHours} hrs` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-sm font-semibold text-slate-900">
                        {svc.finalAmount ? `₹${Number(svc.finalAmount).toLocaleString('en-IN')}` : '₹0'}
                      </span>
                      <p className="text-xs text-slate-400">
                        {new Date(svc.scheduledDate || svc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <Link to="/service/records">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engine Hour Predictive Insights */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-semibold text-slate-900">Engine-Hour Predictor</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our intelligent engine-hour algorithm predicts upcoming service intervals based on daily agricultural operating hours, preventing field breakdowns during harvesting seasons.
            </p>
            <div className="mt-5 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                <span>Standard Interval</span>
                <span>Every 250 Engine Hours</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-700">
                <span>Average Usage</span>
                <span>~6.5 hrs/day</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/service/calendar">
                <Button variant="secondary" size="sm" className="w-full justify-center" icon={<Calendar className="w-4 h-4" />}>
                  View Service Calendar
                </Button>
              </Link>
              <Link to="/service/tractors">
                <Button variant="ghost" size="sm" className="w-full justify-center" icon={<TractorIcon className="w-4 h-4" />}>
                  Manage Tractor Fleet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
