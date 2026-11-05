import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import leadsApi from '../../api/leads'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import {
  Users,
  Flame,
  Calendar,
  CheckCircle2,
  Tractor,
  Wrench,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['leadStatsSummary'],
    queryFn: async () => {
      const res = await leadsApi.getStats()
      return res.data?.data || {}
    },
  })

  const { data: recentLeadsData } = useQuery({
    queryKey: ['recentLeads'],
    queryFn: async () => {
      const res = await leadsApi.getLeads({ limit: 5, sort: 'createdAt:desc' })
      return res.data?.data?.leads || (Array.isArray(res.data?.data) ? res.data?.data : [])
    },
  })

  const stats = statsData || {}
  const recentLeads = recentLeadsData || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dealership Executive Overview</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Real-time sales performance, active tractor inquiries, and operational metrics
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-content-secondary shadow-2xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-content-tertiary" />
            <span>Today: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <Link to="/sales/pipeline">
            <Button variant="secondary" size="md">
              Pipeline Kanban
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total || 0}
          icon={Users}
          color="blue"
          loading={isLoading}
          changeLabel="All active inquiries"
        />

        <StatCard
          title="Hot Enquiries"
          value={stats.hotLeads || 0}
          icon={Flame}
          color="red"
          loading={isLoading}
          changeLabel="High purchase intent"
        />

        <StatCard
          title="Due Follow-ups"
          value={stats.followupsDueToday || 0}
          icon={Calendar}
          color="orange"
          loading={isLoading}
          changeLabel="Scheduled for today"
        />

        <StatCard
          title="Converted Deals"
          value={stats.convertedLeads || 0}
          icon={CheckCircle2}
          color="green"
          loading={isLoading}
          changeLabel="Tractors booked & sold"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries List */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-content-primary">
                Recent Customer Inquiries
              </h2>
            </div>
            <Link
              to="/leads"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border-subtle">
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-xs text-content-tertiary">
                No recent customer inquiries logged.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="py-3 flex items-center justify-between hover:bg-surface-raised px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-content-primary">
                        {lead.customerName}
                      </span>
                      <Badge type="lead_temperature" value={lead.leadTemperature} />
                    </div>
                    <div className="text-[11px] text-content-secondary mt-0.5">
                      {lead.tractorModelInterested || 'General Inquiry'} • {lead.primaryMobile}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge type="lead_status" value={lead.status} />
                    <Link
                      to={`/leads/${lead._id}`}
                      className="p-1 text-content-tertiary hover:text-primary"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Tractor className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-content-primary">
              Operational Actions
            </h2>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/sales/pipeline"
              className="block p-3 rounded-xl bg-surface-raised border border-border-subtle hover:border-primary transition-all text-xs"
            >
              <div className="font-semibold text-content-primary">Sales Kanban Pipeline</div>
              <div className="text-content-secondary mt-0.5">Track deal stages from new to converted</div>
            </Link>

            <Link
              to="/service/customers"
              className="block p-3 rounded-xl bg-surface-raised border border-border-subtle hover:border-primary transition-all text-xs"
            >
              <div className="font-semibold text-content-primary">Tractor Service Records</div>
              <div className="text-content-secondary mt-0.5">Engine-hour maintenance & predictions</div>
            </Link>

            <Link
              to="/leave"
              className="block p-3 rounded-xl bg-surface-raised border border-border-subtle hover:border-primary transition-all text-xs"
            >
              <div className="font-semibold text-content-primary">Leave & Lead Handover</div>
              <div className="text-content-secondary mt-0.5">Manage employee absence and reassignments</div>
            </Link>

            <Link
              to="/admin/users"
              className="block p-3 rounded-xl bg-surface-raised border border-border-subtle hover:border-primary transition-all text-xs"
            >
              <div className="font-semibold text-content-primary">Employee & RBAC Control</div>
              <div className="text-content-secondary mt-0.5">Manage department roles and credentials</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
