import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  Wrench, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Calendar, 
  Download,
  CheckCircle2
} from 'lucide-react'
import { serviceApi } from '../../api/service'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ServiceReports() {
  const [stats, setStats] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const [statsRes, svcRes] = await Promise.all([
          serviceApi.getServiceStats().catch(() => ({ data: { data: {} } })),
          serviceApi.getServices({ limit: 100 }).catch(() => ({ data: { data: [] } })),
        ])
        setStats(statsRes.data?.data || {})
        const sList = svcRes.data?.data?.services || svcRes.data?.data || []
        setServices(sList)
      } catch (err) {
        console.error('Failed to load service reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" message="Generating service performance reports..." />
      </div>
    )
  }

  const totalRevenue = services.reduce((sum, s) => sum + Number(s.finalAmount || 0), 0)
  const completedCount = services.filter((s) => s.status === 'completed').length
  const avgJobValue = services.length > 0 ? Math.round(totalRevenue / services.length) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Performance Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Workshop throughput, revenue generation, spare parts consumption, and turnaround efficiency
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => alert('Exporting Service Report CSV...')}
          >
            Export CSV
          </Button>
          <Link to="/service/records/new">
            <Button variant="primary" size="sm" icon={<Wrench className="w-4 h-4" />}>
              Open Job Card
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL WORKSHOP REVENUE"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle="All completed & billed services"
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          title="TOTAL JOB CARDS"
          value={services.length}
          subtitle="Processed through service bay"
          icon={<Wrench className="w-5 h-5" />}
          variant="primary"
        />
        <StatCard
          title="COMPLETED DELIVERIES"
          value={completedCount}
          subtitle="Tractors repaired & returned"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="AVERAGE JOB VALUE"
          value={`₹${avgJobValue.toLocaleString('en-IN')}`}
          subtitle="Parts and labor per tractor"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Analysis breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Service Types Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Routine Paid Maintenance', count: services.filter(s => s.serviceType === 'routine_paid').length },
              { label: '1st & 2nd Free Services', count: services.filter(s => s.serviceType?.includes('free')).length },
              { label: 'Breakdown / Field Emergencies', count: services.filter(s => s.serviceType === 'breakdown_repair').length },
              { label: 'Major Overhauls', count: services.filter(s => s.serviceType === 'major_overhaul').length },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fleet Operational Health</h2>
          <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100 space-y-2">
            <span className="text-xs font-bold text-primary-900 uppercase">Engine-Hour Maintenance Policy</span>
            <p className="text-xs text-primary-800 leading-relaxed">
              Athiran Motors enforces strict 250-engine-hour maintenance intervals to protect tractor warranty validity and optimize diesel efficiency across agricultural farmlands in Tamil Nadu.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/service/tractors">
              <Button variant="secondary" size="sm" className="w-full justify-center">
                Review Tractor Fleet Engine Hours
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
