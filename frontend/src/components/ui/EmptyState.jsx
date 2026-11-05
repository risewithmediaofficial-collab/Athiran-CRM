import React from 'react'
import Button from './Button'

export default function EmptyState({
  title = 'No records found',
  description = 'There is currently no data to display for this view.',
  icon,
  action,
  className = '',
}) {
  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) {
      return icon
    }
    const IconComponent = icon
    return <IconComponent className="w-6 h-6" />
  }

  const renderAction = () => {
    if (!action) return null
    if (React.isValidElement(action)) {
      return action
    }
    if (typeof action === 'object' && action.label) {
      return (
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )
    }
    return null
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200/80 ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {renderAction()}
    </div>
  )
}
