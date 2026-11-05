import React, { useState } from 'react'

export default function Tooltip({ content, children, side = 'top' }) {
  const [isVisible, setIsVisible] = useState(false)

  if (!content) return children

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-tooltip whitespace-nowrap rounded-md bg-content-primary px-2.5 py-1 text-[11px] font-medium text-white shadow-md pointer-events-none animate-fade-in ${
            positionClasses[side] || positionClasses.top
          }`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

