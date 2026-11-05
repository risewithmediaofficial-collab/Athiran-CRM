import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  change,
  changeLabel,
  color,
  variant,
  loading = false,
}) {
  const chosenColor = color || (
    variant === 'success' ? 'green' :
    variant === 'warning' ? 'orange' :
    variant === 'danger' ? 'red' :
    variant === 'info' ? 'blue' :
    variant === 'primary' ? 'blue' :
    'blue'
  )

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  }

  const label = changeLabel || subtitle

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
        <div className="h-8 bg-slate-100 rounded w-16 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-32" />
      </div>
    )
  }

  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colorMap[chosenColor] || colorMap.blue}`}>
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
        {value !== undefined ? value : 0}
      </div>

      {(change !== undefined || label) && (
        <div className="flex items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span
              className={`flex items-center font-medium ${
                change >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(change)}%
            </span>
          )}
          {label && (
            <span className="text-slate-400">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}
