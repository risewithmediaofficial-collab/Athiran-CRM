import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export const ProtectedRoute = ({ children, permission, role }) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-raised">
        <LoadingSpinner size="lg" message="Loading Athiran CRM..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-status-danger-bg text-status-danger rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-content-secondary mb-6 text-sm">
          You do not have the required permissions to view this module. If you believe this is an error, please contact your dealer administrator.
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn btn-secondary btn-md"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (role && !hasRole(role)) {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-20">
        <h2 className="text-xl font-semibold mb-2">Role Unauthorized</h2>
        <p className="text-content-secondary mb-4 text-sm">This section is restricted to the {role} role.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute

