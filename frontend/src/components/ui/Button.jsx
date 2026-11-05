import React, { forwardRef } from 'react'
import LoadingSpinner from './LoadingSpinner'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
  secondary: 'bg-surface text-content-primary border border-border hover:bg-surface-raised',
  danger: 'bg-status-danger text-white hover:opacity-95 shadow-sm',
  ghost: 'text-content-secondary hover:bg-surface-raised hover:text-content-primary',
  outline: 'border border-primary text-primary hover:bg-primary-light',
}

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    leftIcon,
    rightIcon,
    className = '',
    type = 'button',
    onClick,
    ...props
  },
  ref
) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary
  const sizeClass = SIZES[size] || SIZES.md

  const effectiveLeft = leftIcon || icon

  const renderIcon = (ic) => {
    if (!ic) return null
    if (React.isValidElement(ic)) {
      return ic
    }
    const IconComp = ic
    return <IconComp className="w-4 h-4 shrink-0" />
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantClass} ${sizeClass} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'gray'} />
      ) : (
        renderIcon(effectiveLeft)
      )}
      {children}
      {!loading && renderIcon(rightIcon)}
    </button>
  )
})

export default Button
