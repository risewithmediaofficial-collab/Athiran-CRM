import React, { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon,
    leftIcon,
    rightIcon,
    required = false,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9)
  const effectiveLeft = leftIcon || icon

  const renderIcon = (ic) => {
    if (!ic) return null
    if (React.isValidElement(ic)) return ic
    const IconComp = ic
    return <IconComp className="w-4 h-4" />
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label.replace(/\s*\*+$/, '')} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {effectiveLeft && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {renderIcon(effectiveLeft)}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          onWheel={(e) => {
            if (type === 'number') {
              e.currentTarget.blur()
            }
            if (props.onWheel) {
              props.onWheel(e)
            }
          }}
          className={`w-full h-10 rounded-xl border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors ${
            effectiveLeft ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-slate-200'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {renderIcon(rightIcon)}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
