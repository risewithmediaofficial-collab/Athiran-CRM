import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 20,
  onPageChange,
}) {
  if (total === 0) return null

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
      <div className="text-xs text-content-secondary">
        Showing <span className="font-semibold text-content-primary">{start}</span> to{' '}
        <span className="font-semibold text-content-primary">{end}</span> of{' '}
        <span className="font-semibold text-content-primary">{total}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={ChevronLeft}
        >
          Previous
        </Button>

        <span className="text-xs text-content-secondary px-2 font-medium">
          Page {page} of {totalPages || 1}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

