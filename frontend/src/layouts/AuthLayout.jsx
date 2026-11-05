import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck, Tractor, Users, Wrench } from 'lucide-react'

export default function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-surface-raised flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
            <Tractor className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-content-primary">
            ATHIRAN MOTORS
          </span>
        </div>
        <p className="text-center text-xs uppercase tracking-wider text-content-secondary font-medium">
          Dealer CRM & Tractor Lifecycle Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-md rounded-2xl border border-border sm:px-10">
          <Outlet />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-content-secondary">
          <div className="flex flex-col items-center gap-1 p-2 bg-surface rounded-lg border border-border-subtle">
            <Users className="w-4 h-4 text-primary" />
            <span>Sales & Leads</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-surface rounded-lg border border-border-subtle">
            <Wrench className="w-4 h-4 text-primary" />
            <span>Service & Maintenance</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-surface rounded-lg border border-border-subtle">
            <ShieldCheck className="w-4 h-4 text-status-success" />
            <span>Enterprise Security</span>
          </div>
        </div>
      </div>
    </div>
  )
}

