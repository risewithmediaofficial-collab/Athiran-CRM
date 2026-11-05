import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  PhoneCall, 
  Sparkles,
  Layers
} from 'lucide-react'
import { leadsApi } from '../../api/leads'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function SalesDashboard() {
  const [stats, setStats] = useState(null)
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true)
        const [statsRes, leadsRes] = await Promise.all([
          leadsApi.getStats().catch(() => ({ data: { data: {} } })),
          leadsApi.getLeads({ limit: 6, sort: '-createdAt' }).catch(() => ({ data: { data: { leads: [] } } })),
        ])
        setStats(statsRes.data?.data || {})
        const lList = leadsRes.data?.data?.leads || leadsRes.data?.data || []
        setRecentLeads(lList)
      } catch (err) {
        console.error('Failed to load sales dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSalesData()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Loading sales pipeline and lead conversion metrics..." />
      </div>
    )
  }

  const tempBadgeVariant = (temp) => {
    switch (temp?.toLowerCase()) {
      case 'hot': return 'danger'
      case 'warm': return 'warning'
      case 'cold': return 'info'
      default: return 'neutral'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tractor Sales Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time dealership inquiry pipeline, customer follow-ups, and tractor bookings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/sales/pipeline">
            <Button variant="secondary" size="sm" icon={<Layers className="w-4 h-4" />}>
              Pipeline Board
            </Button>
          </Link>
          <Link to="/follow-ups">
            <Button variant="secondary" size="sm" icon={<Calendar className="w-4 h-4" />}>
              Follow-Ups
            </Button>
          </Link>
          <Link to="/leads/new">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              New Sales Inquiry
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ACTIVE INQUIRIES"
          value={stats?.totalLeads || 0}
          subtitle="All leads in pipeline"
          icon={<Users className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="HOT ENQUIRIES"
          value={stats?.hotLeads || 0}
          subtitle="High purchase intent"
          icon={<Flame className="w-5 h-5" />}
          variant="danger"
        />
        <StatCard
          title="FOLLOW-UPS TODAY"
          value={stats?.followupsDueToday || 0}
          subtitle="Customer calls & trials"
          icon={<Calendar className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="CONVERTED SALES"
          value={stats?.convertedLeads || 0}
          subtitle="Tractors booked & sold"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <h2 className="text-base font-semibold text-slate-900">Recent Customer Inquiries</h2>
            </div>
            <Link to="/leads" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All Leads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLeads.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No active inquiries recorded. Start capturing incoming farmer inquiries.
                <div className="mt-4">
                  <Link to="/leads/new">
                    <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                      Create First Lead
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              recentLeads.map((l) => (
                <div key={l._id} className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/leads/${l._id}`} className="font-semibold text-slate-900 hover:text-primary-600 text-sm">
                        {l.customerName}
                      </Link>
                      <Badge variant={tempBadgeVariant(l.leadTemperature)}>
                        {l.leadTemperature || 'Warm'}
                      </Badge>
                      <Badge variant="neutral">
                        {l.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {l.interestedModel || l.tractorModel || 'Tractor Model'} • Phone: {l.primaryMobile || l.mobileNumber} • {l.village || 'Tamil Nadu'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to={`/leads/${l._id}`}>
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

        {/* Sales Shortcuts & Dealership Goals */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <h3 className="text-base font-semibold text-slate-900">Sales Fast Actions</h3>
            </div>
            <div className="space-y-2">
              <Link to="/leads/new" className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Plus className="w-4 h-4" />}>
                  Register Customer Inquiry
                </Button>
              </Link>
              <Link to="/sales/pipeline" className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start" icon={<Layers className="w-4 h-4" />}>
                  Manage Deal Stages (Kanban)
                </Button>
              </Link>
              <Link to="/follow-ups" className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start" icon={<PhoneCall className="w-4 h-4" />}>
                  Call Schedule & Farm Visits
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dealership Guidance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensure immediate contact within 15 minutes of inquiry entry to maximize test drive conversion rates during seasonal harvest campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
