/**
 * Parse pagination parameters from query string.
 * @param {object} query - req.query
 * @returns {{ page, limit, skip, sort }}
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20))
  const skip = (page - 1) * limit

  // Sort: "createdAt:desc" → { createdAt: -1 }
  let sort = { createdAt: -1 }
  if (query.sort) {
    const [field, dir] = query.sort.split(':')
    sort = { [field]: dir === 'asc' ? 1 : -1 }
  }

  return { page, limit, skip, sort }
}

export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
})

