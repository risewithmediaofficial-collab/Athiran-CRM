import React, { useState, useMemo, Suspense } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  Tractor,
  LayoutDashboard,
  Users,
  Calendar,
  Wrench,
  CalendarDays,
  UserCheck,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Search,
  Plus,
  User,
} from 'lucide-react'
import { PERMISSIONS } from '../constants'

export default function MainLayout() {
  const { user, logout, hasPermission, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleGlobalSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In Leads / Tractors / Customers
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Navigation schema with permissions
  const navGroups = useMemo(() => {
    const groups = [
      {
        title: 'Main',
        items: [
          { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Sales CRM',
        items: [
          { label: 'Sales Dashboard', path: '/sales', icon: BarChart3, permission: PERMISSIONS.LEADS_VIEW_OWN },
          { label: 'Leads Pipeline', path: '/sales/pipeline', icon: Users, permission: PERMISSIONS.LEADS_VIEW_OWN },
          { label: 'All Leads', path: '/leads', icon: Users, permission: PERMISSIONS.LEADS_VIEW_OWN },
          { label: 'Follow-ups', path: '/follow-ups', icon: Calendar, permission: PERMISSIONS.LEADS_VIEW_OWN },
        ],
      },
      {
        title: 'Service CRM',
        items: [
          { label: 'Service Dashboard', path: '/service', icon: LayoutDashboard, permission: PERMISSIONS.SERVICE_VIEW_OWN },
          { label: 'Customers', path: '/service/customers', icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW_ALL },
          { label: 'Tractor Fleet', path: '/service/tractors', icon: Tractor, permission: PERMISSIONS.TRACTORS_VIEW_ALL },
          { label: 'Service Records', path: '/service/records', icon: Wrench, permission: PERMISSIONS.SERVICE_VIEW_OWN },
          { label: 'Service Calendar', path: '/service/calendar', icon: CalendarDays, permission: PERMISSIONS.SERVICE_VIEW_OWN },
        ],
      },
      {
        title: 'HR & Operations',
        items: [
          { label: 'Employees', path: '/employees', icon: UserCheck, permission: PERMISSIONS.EMPLOYEES_VIEW_ALL },
          { label: 'Leave Management', path: '/leave', icon: FileText, permission: PERMISSIONS.LEAVE_APPLY },
          { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_SALES },
        ],
      },
    ]

    if (isAdmin()) {
      groups.push({
        title: 'Administration',
        items: [
          { label: 'Users & Roles', path: '/admin/users', icon: Shield },
          { label: 'Lead Handover', path: '/admin/leave', icon: FileText },
          { label: 'System Settings', path: '/admin/settings', icon: Settings },
        ],
      })
    }

    return groups
  }, [isAdmin])

  const renderNavGroup = (group) => {
    const visibleItems = group.items.filter(
      (item) => !item.permission || hasPermission(item.permission)
    )

    if (visibleItems.length === 0) return null

    return (
      <div key={group.title} className="mb-6">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-content-tertiary">
          {group.title}
        </div>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isItemActive = (itemPath, currentPath) => {
              if (currentPath === itemPath) return true
              // Allow child sub-routes ONLY for specific entity listing pages (e.g. /leads/new, /service/records/new)
              const prefixMatchEntities = [
                '/leads',
                '/service/customers',
                '/service/tractors',
                '/service/records',
                '/employees',
                '/leave',
                '/admin/users',
              ]
              if (prefixMatchEntities.includes(itemPath)) {
                return currentPath.startsWith(itemPath + '/')
              }
              return false
            }

            const isActive = isItemActive(item.path, location.pathname)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-raised'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-content-secondary'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-raised flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs">
            <Tractor className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="font-bold text-xs tracking-tight text-content-primary">ATHIRAN MOTORS</div>
            <div className="text-[10px] text-content-secondary leading-none">Dealer CRM</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to="/notifications"
            className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center text-content-secondary hover:text-content-primary relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-danger" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center text-content-secondary hover:text-content-primary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-border shrink-0 h-screen sticky top-0">
        {/* Dealership Branding */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs shrink-0">
            <Tractor className="w-4.5 h-4.5" />
          </div>
          <div className="overflow-hidden leading-tight">
            <div className="font-bold text-xs tracking-tight text-content-primary truncate">ATHIRAN MOTORS</div>
            <div className="text-[10px] text-content-secondary font-medium truncate mt-0.5">Dealer CRM System</div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {navGroups.map(renderNavGroup)}
        </div>

        {/* Current User Badge & Logout */}
        <div className="p-3 border-t border-border bg-surface-overlay shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden leading-tight">
                <div className="text-xs font-semibold text-content-primary truncate">{user?.fullName || 'User'}</div>
                <div className="text-[10px] text-content-secondary truncate capitalize mt-0.5">{user?.role?.displayName || user?.role?.name || 'Staff'}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-content-tertiary hover:text-status-danger hover:bg-surface-raised rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-72 bg-surface h-full p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Tractor className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-sm">ATHIRAN MOTORS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-content-secondary hover:text-content-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            {navGroups.map(renderNavGroup)}
            <div className="pt-4 border-t border-border mt-4">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-danger font-medium hover:bg-status-danger-bg rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header Bar — Edge-to-Edge with clean padding */}
        <header className="hidden md:flex h-14 bg-surface border-b border-border items-center justify-between px-6 sticky top-0 z-30 shrink-0">
          {/* Global Search */}
          <form onSubmit={handleGlobalSearch} className="relative w-72 lg:w-84">
            <Search className="w-3.5 h-3.5 text-content-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads, tractors, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-8 bg-surface-raised border border-border/70 hover:border-border rounded-lg text-xs placeholder:text-content-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary focus:bg-surface transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="hidden sm:inline-block text-[10px] font-mono font-medium text-content-tertiary bg-surface px-1 py-0.5 rounded border border-border shadow-2xs leading-none">
                /
              </kbd>
            </div>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <Link
              to="/leads/new"
              className="h-8 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lead</span>
            </Link>

            <div className="h-4 w-px bg-border mx-1" />

            <Link
              to="/notifications"
              className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center text-content-secondary hover:text-content-primary transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-status-danger ring-2 ring-surface" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-surface-raised transition-colors group"
              title="My Profile"
            >
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-content-primary group-hover:text-primary transition-colors max-w-[120px] truncate">
                {user?.fullName || 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <LoadingSpinner size="md" message="Loading..." />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

