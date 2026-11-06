import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'No records match the current filter criteria.',
  emptyAction,
  onSort,
  sortKey,
  sortDir = 'desc',
  onRowClick,
}) {
  const handleSort = (key, sortable) => {
    if (!sortable || !onSort) return
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'
    onSort(key, nextDir)
  }

  if (loading) {
    return (
      <div className="table-container bg-surface">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j}>
                    <div className="h-4 bg-surface-raised rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div className="table-container bg-surface shadow-sm">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key
              const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              const justifyClass = col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
              return (
                <th
                  key={col.key}
                  style={{
                    ...(col.width ? { width: col.width, minWidth: col.width } : {}),
                    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                  }}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`align-middle whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:bg-surface-inset' : ''} ${alignClass} ${col.headerClassName || ''}`}
                >
                  <div className={`flex items-center gap-1.5 ${justifyClass}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-content-tertiary">
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id || row.id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-primary-50/30 transition-colors group' : ''}
              title={onRowClick ? 'Click anywhere on this row to open details' : ''}
            >
              {columns.map((col) => {
                const alignClass = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                return (
                  <td
                    key={col.key}
                    style={{
                      ...(col.width ? { width: col.width, minWidth: col.width } : {}),
                      ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                    }}
                    className={`align-middle ${alignClass} ${col.cellClassName || ''}`}
                    onClick={(e) => {
                      if (col.key === 'actions' || col.key === 'assignedTo') {
                        e.stopPropagation()
                      }
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

