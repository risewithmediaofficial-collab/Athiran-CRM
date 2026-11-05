import React from 'react'

export default function Badge({ 
  type, 
  value, 
  label, 
  variant, 
  children, 
  className = '' 
}) {
  const getBadgeStyle = () => {
    // If explicit variant is provided
    if (variant) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        case 'warning':
          return 'bg-amber-50 text-amber-700 border-amber-200'
        case 'danger':
          return 'bg-red-50 text-red-700 border-red-200'
        case 'info':
          return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'primary':
          return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'neutral':
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200'
      }
    }

    // Configurable status styles
    switch (type) {
      case 'lead_temperature':
        switch (value) {
          case 'hot':
            return 'bg-red-50 text-red-700 border-red-200'
          case 'warm':
            return 'bg-amber-50 text-amber-700 border-amber-200'
          case 'cold':
            return 'bg-blue-50 text-blue-700 border-blue-200'
          default:
            return 'bg-slate-100 text-slate-700 border-slate-200'
        }

      case 'lead_status':
        switch (value) {
          case 'new':
            return 'bg-blue-50 text-blue-700 border-blue-200'
          case 'contacted':
          case 'interested':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200'
          case 'visit_planned':
          case 'demo_planned':
            return 'bg-purple-50 text-purple-700 border-purple-200'
          case 'negotiation':
          case 'booking_pending':
            return 'bg-amber-50 text-amber-700 border-amber-200'
          case 'booked':
          case 'converted':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
          case 'lost':
          case 'not_interested':
            return 'bg-gray-100 text-gray-600 border-gray-200'
          default:
            return 'bg-slate-100 text-slate-700 border-slate-200'
        }

      case 'service_status':
        switch (value) {
          case 'scheduled':
          case 'pending':
            return 'bg-amber-50 text-amber-700 border-amber-200'
          case 'in_progress':
            return 'bg-blue-50 text-blue-700 border-blue-200'
          case 'waiting_parts':
            return 'bg-orange-50 text-orange-700 border-orange-200'
          case 'completed':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
          case 'cancelled':
            return 'bg-gray-100 text-gray-500 border-gray-200'
          default:
            return 'bg-slate-100 text-slate-700 border-slate-200'
        }

      case 'leave_status':
        switch (value) {
          case 'pending':
            return 'bg-amber-50 text-amber-700 border-amber-200'
          case 'approved':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
          case 'rejected':
            return 'bg-red-50 text-red-700 border-red-200'
          default:
            return 'bg-slate-100 text-slate-700 border-slate-200'
        }

      case 'account_status':
        switch (value) {
          case 'active':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200'
          case 'inactive':
            return 'bg-gray-100 text-gray-600 border-gray-200'
          case 'suspended':
            return 'bg-red-50 text-red-700 border-red-200'
          default:
            return 'bg-slate-100 text-slate-700 border-slate-200'
        }

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const formatText = (text) => {
    if (!text) return ''
    return String(text)
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      {children || label || formatText(value)}
    </span>
  )
}
