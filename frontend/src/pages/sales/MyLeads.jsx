import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import leadsApi from '../../api/leads'
import usersApi from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Loader2,
} from 'lucide-react'
import { LEAD_STATUSES, LEAD_TEMPERATURES } from '../../constants'

export default function MyLeads() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState('')
  const [tempFilter, setTempFilter] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [users, setUsers] = useState([])
  const [assigningId, setAssigningId] = useState(null)

  useEffect(() => {
    usersApi
      .getUsers({ limit: 100, accountStatus: 'active' })
      .then((res) => {
        const uList = res.data?.data?.users || (Array.isArray(res.data?.data) ? res.data?.data : [])
        setUsers(uList)
      })
      .catch((err) => console.error('Failed to load users for assignment', err))
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { page, search: debouncedSearch, status: statusFilter, leadTemperature: tempFilter, sortKey, sortDir }],
    queryFn: async () => {
      const params = {
        page,
        limit: 15,
        sort: `${sortKey}:${sortDir}`,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
        ...(tempFilter && { leadTemperature: tempFilter }),
      }
      const res = await leadsApi.getLeads(params)
      return res.data
    },
  })

  const leads = data?.data?.leads || (Array.isArray(data?.data) ? data?.data : [])
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 }

  const handleSort = (key, dir) => {
    setSortKey(key)
    setSortDir(dir)
  }

  const queryClient = useQueryClient()

  const handleInlineAssign = async (leadId, newUserId) => {
    if (!newUserId) return
    try {
      setAssigningId(leadId)
      await leadsApi.assignLead(leadId, {
        newAssignedTo: newUserId,
        reason: 'Assigned directly from leads table',
      })
      queryClient.invalidateQueries(['leads'])
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign lead.')
    } finally {
      setAssigningId(null)
    }
  }

  const handleDeleteLead = async (e, id, name) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) return
    try {
      await leadsApi.deleteLead(id)
      queryClient.invalidateQueries(['leads'])
    } catch {
      alert('Failed to delete lead. Check permissions.')
    }
  }

  const columns = [
    {
      key: 'leadId',
      label: 'Lead ID',
      width: '155px',
      minWidth: '150px',
      render: (val, row) => (
        <div className="whitespace-nowrap">
          <Link
            to={`/leads/${row._id}`}
            className="font-mono text-xs font-bold text-primary hover:underline block"
          >
            {val}
          </Link>
          <span className="text-[11px] text-content-tertiary">
            {new Date(row.leadDate || row.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      minWidth: '180px',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-xs text-content-primary truncate max-w-[200px]" title={val}>
            {val}
          </div>
          <div className="text-[11px] text-content-tertiary flex items-center gap-1 mt-0.5 whitespace-nowrap">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{row.primaryMobile}</span>
            {row.village && <span className="truncate max-w-[120px]">• {row.village}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'tractorModelInterested',
      label: 'Model Requirement',
      minWidth: '200px',
      render: (val, row) => (
        <div>
          <span className="font-medium text-xs text-content-primary whitespace-nowrap block">
            {val || 'General Enquiry'}
          </span>
          {row.estimatedBudget ? (
            <div className="text-[11px] text-content-secondary mt-0.5 whitespace-nowrap font-mono">
              Budget: ₹{(row.estimatedBudget).toLocaleString('en-IN')}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'leadTemperature',
      label: 'Temperature',
      width: '120px',
      minWidth: '110px',
      align: 'center',
      render: (val) => <Badge type="lead_temperature" value={val} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      minWidth: '100px',
      align: 'center',
      render: (val) => <Badge type="lead_status" value={val} />,
    },
    {
      key: 'createdBy',
      label: 'Initiated By',
      width: '160px',
      minWidth: '150px',
      render: (val) => (
        <div className="whitespace-nowrap">
          <div className="font-semibold text-xs text-content-primary">
            {val?.fullName || 'Admin'}
          </div>
          <div className="text-[11px] text-content-tertiary font-mono whitespace-nowrap">
            {val?.employeeId ? `ID: ${val.employeeId}` : (val?.email || 'Initiator')}
          </div>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      width: '210px',
      minWidth: '200px',
      render: (val, row) => {
        const currentAssigneeId = typeof val === 'object' && val !== null ? val._id : (val || '')
        const isAssigning = assigningId === row._id

        return (
          <div onClick={(e) => e.stopPropagation()} className="w-[195px]">
            <div className="relative">
              <Select
                size="sm"
                disabled={isAssigning}
                value={currentAssigneeId}
                onChange={(e) => handleInlineAssign(row._id, e.target.value)}
                options={[
                  ...(currentAssigneeId ? [] : [{ value: '', label: '-- Unassigned --' }]),
                  ...users.map((u) => ({
                    value: u._id,
                    label: u.fullName + (u._id === currentUser?._id ? ' (You)' : ''),
                  })),
                ]}
                triggerClassName="text-xs font-semibold h-8 py-0.5 px-2.5 rounded-lg border-slate-200 bg-white hover:border-primary-400 focus:border-primary-500 shadow-2xs text-slate-800"
              />
              {isAssigning && (
                <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                </div>
              )}
            </div>
            {val?.designation && (
              <div
                className="text-[10px] text-content-tertiary mt-0.5 truncate pl-1 max-w-[195px]"
                title={`${val.designation} • ${val.employeeId || ''}`}
              >
                {val.designation} {val.employeeId ? `• ${val.employeeId}` : ''}
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      minWidth: '90px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/leads/${row._id}`}
            className="p-1.5 text-content-tertiary hover:text-primary rounded-lg hover:bg-surface-raised transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link
            to={`/leads/${row._id}/edit`}
            className="p-1.5 text-content-tertiary hover:text-primary rounded-lg hover:bg-surface-raised transition-colors"
            title="Edit Lead"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={(e) => handleDeleteLead(e, row._id, row.customerName)}
            className="p-1.5 text-content-tertiary hover:text-status-danger rounded-lg hover:bg-status-danger-bg transition-colors cursor-pointer"
            title="Delete Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Sales CRM', href: '/sales' }, { label: 'All Leads' }]} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Leads</h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Manage customer inquiries, assign tractor requirements, and track conversion status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/sales/pipeline">
            <Button variant="secondary" size="md">
              Pipeline View
            </Button>
          </Link>
          <Link to="/leads/new">
            <Button variant="primary" size="md" leftIcon={Plus}>
              Create Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-content-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, lead ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-surface-raised border border-border rounded-lg text-xs placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="min-w-[140px]">
            <Select
              size="sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'All Statuses' },
                ...Object.entries(LEAD_STATUSES).map(([val, lbl]) => ({ value: val, label: lbl })),
              ]}
              placeholder="All Statuses"
            />
          </div>

          <div className="min-w-[150px]">
            <Select
              size="sm"
              value={tempFilter}
              onChange={(e) => {
                setTempFilter(e.target.value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'All Temperatures' },
                ...Object.entries(LEAD_TEMPERATURES).map(([val, lbl]) => ({ value: val, label: lbl })),
              ]}
              placeholder="All Temperatures"
            />
          </div>

          {(statusFilter || tempFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setTempFilter('')
                setSearch('')
                setPage(1)
              }}
              className="text-xs text-primary hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={leads}
        loading={isLoading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/leads/${row._id}`)}
        emptyTitle="No leads found"
        emptyDescription="Create a new lead to begin tracking dealership tractor sales."
        emptyAction={{
          label: 'Create First Lead',
          icon: Plus,
          onClick: () => navigate('/leads/new'),
        }}
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  )
}
