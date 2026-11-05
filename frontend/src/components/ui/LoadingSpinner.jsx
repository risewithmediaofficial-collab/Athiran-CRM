import React from 'react'

export default function LoadingSpinner({ size = 'md', color = 'primary', message }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  }

  const colorMap = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-content-secondary border-t-transparent',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`rounded-full animate-spin ${sizeMap[size] || sizeMap.md} ${
          colorMap[color] || colorMap.primary
        }`}
      />
      {message && <span className="text-xs text-content-secondary font-medium">{message}</span>}
    </div>
  )
}

