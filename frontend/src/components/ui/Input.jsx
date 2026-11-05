import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
    showPasswordToggle = type === 'password',
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const effectiveType = isPasswordField ? (showPassword ? 'text' : 'password') : type
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9)
  const effectiveLeft = leftIcon || icon
  const hasRightElement = rightIcon || (isPasswordField && showPasswordToggle)

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
          type={effectiveType}
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
          } ${hasRightElement ? 'pr-10' : ''} ${
            error
              ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
              : 'border-slate-200'
          } ${className}`}
          {...props}
        />
        {isPasswordField && showPasswordToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
            {renderIcon(rightIcon)}
          </div>
        ) : null}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  )
})

export default Input
