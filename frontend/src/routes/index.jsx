import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from '../guards/ProtectedRoute'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { PERMISSIONS } from '../constants'

// Auth Pages
const Login = lazy(() => import('../pages/auth/Login'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('../pages/admin/UserManagement'))
const RoleManagement = lazy(() => import('../pages/admin/RoleManagement'))
const LeadManagement = lazy(() => import('../pages/admin/LeadManagement'))
const LeaveManagement = lazy(() => import('../pages/admin/LeaveManagement'))
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'))

// Sales Pages
const SalesDashboard = lazy(() => import('../pages/sales/SalesDashboard'))
const SalesPipeline = lazy(() => import('../pages/sales/SalesPipeline'))
const MyLeads = lazy(() => import('../pages/sales/MyLeads'))
const AddLead = lazy(() => import('../pages/sales/AddLead'))
const EditLead = lazy(() => import('../pages/sales/EditLead'))
const LeadDetails = lazy(() => import('../pages/sales/LeadDetails'))
const FollowUps = lazy(() => import('../pages/sales/FollowUps'))
const SalesReports = lazy(() => import('../pages/reports/ReportsDashboard'))

// Service Pages
const ServiceDashboard = lazy(() => import('../pages/service/ServiceDashboard'))
const ServiceCustomers = lazy(() => import('../pages/service/ServiceCustomers'))
const CustomerDetails = lazy(() => import('../pages/service/CustomerDetails'))
const TractorManagement = lazy(() => import('../pages/service/TractorManagement'))
const TractorDetails = lazy(() => import('../pages/service/TractorDetails'))
const ServiceRecords = lazy(() => import('../pages/service/ServiceRecords'))
const AddService = lazy(() => import('../pages/service/AddService'))
const ServiceCalendar = lazy(() => import('../pages/service/ServiceCalendar'))
const ServiceReports = lazy(() => import('../pages/service/ServiceReports'))

// Employees
const EmployeeList = lazy(() => import('../pages/employees/EmployeeList'))
const EmployeeDetails = lazy(() => import('../pages/employees/EmployeeDetails'))
const MyProfile = lazy(() => import('../pages/employees/MyProfile'))

// Leave
const MyLeave = lazy(() => import('../pages/leave/MyLeave'))
const ApplyLeave = lazy(() => import('../pages/leave/ApplyLeave'))
const LeaveCalendar = lazy(() => import('../pages/leave/LeaveCalendar'))

// Common
const ReportsDashboard = lazy(() => import('../pages/reports/ReportsDashboard'))
const Notifications = lazy(() => import('../pages/notifications/Notifications'))
const Settings = lazy(() => import('../pages/settings/Settings'))

const SuspenseLoader = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center">
    <LoadingSpinner size="md" message="Loading..." />
  </div>
)

export default function AppRoutes() {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected CRM Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* Sales Module */}
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/pipeline" element={<SalesPipeline />} />
          <Route path="/leads" element={<MyLeads />} />
          <Route path="/leads/new" element={<AddLead />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/leads/:id/edit" element={<EditLead />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/sales/reports" element={<SalesReports />} />

          {/* Service Module */}
          <Route path="/service" element={<ServiceDashboard />} />
          <Route path="/service/customers" element={<ServiceCustomers />} />
          <Route path="/service/customers/:id" element={<CustomerDetails />} />
          <Route path="/service/tractors" element={<TractorManagement />} />
          <Route path="/service/tractors/:id" element={<TractorDetails />} />
          <Route path="/service/records" element={<ServiceRecords />} />
          <Route path="/service/records/new" element={<AddService />} />
          <Route path="/service/calendar" element={<ServiceCalendar />} />
          <Route path="/service/reports" element={<ServiceReports />} />

          {/* Employees */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute permission={PERMISSIONS.EMPLOYEES_VIEW_ALL}>
                <EmployeeList />
              </ProtectedRoute>
            }
          />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/profile" element={<MyProfile />} />

          {/* Leave Management */}
          <Route path="/leave" element={<MyLeave />} />
          <Route path="/leave/apply" element={<ApplyLeave />} />
          <Route path="/leave/calendar" element={<LeaveCalendar />} />

          {/* Common Modules */}
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin Dedicated Section */}
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/leads" element={<LeadManagement />} />
          <Route path="/admin/leave" element={<LeaveManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

