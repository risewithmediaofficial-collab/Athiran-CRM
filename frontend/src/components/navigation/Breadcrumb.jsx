import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-content-tertiary mb-3">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-content-primary transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-content-tertiary shrink-0" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-content-primary transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[200px] ${isLast ? 'text-content-primary font-semibold' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

