import React, { forwardRef } from 'react'

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    required = false,
    className = '',
    id,
    placeholder = 'Select an option',
    value,
    onChange,
    disabled = false,
    ...props
  },
  ref
) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9)

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:bg-slate-50 cursor-pointer ${
          error
            ? 'border-status-danger focus:ring-status-danger'
            : 'border-border'
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          )
        })}
      </select>
      {error && <p className="mt-1 text-xs text-status-danger font-medium">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-content-tertiary">{helperText}</p>
      )}
    </div>
  )
})

export default Select

