import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tractorModelsApi } from '../api/tractorModels'
import { TRACTOR_MODELS } from '../constants'

const FALLBACK_MODELS = TRACTOR_MODELS.map((modelName, idx) => ({
  _id: `fallback-${idx}`,
  modelName,
  brand: 'Massey Ferguson',
  category: 'Tractor Model',
  hpDisplay: '',
  serviceIntervalHours: 250,
  isFallback: true,
}))

export function useTractorModels() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tractorModels'],
    queryFn: async () => {
      const res = await tractorModelsApi.getModels()
      return res.data?.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  const models = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data
    return isLoading ? FALLBACK_MODELS : []
  }, [data, isLoading])

  const modelNames = useMemo(() => models.map((m) => m.modelName), [models])

  const findModelByName = (name) => {
    if (!name) return null
    const normalized = String(name).trim().toLowerCase()
    return (
      models.find((m) => m.modelName.toLowerCase() === normalized) ||
      models.find((m) => normalized.includes(m.modelName.toLowerCase()) || m.modelName.toLowerCase().includes(normalized)) ||
      null
    )
  }

  return {
    models,
    modelNames,
    findModelByName,
    isLoading,
    isError,
    refetch,
  }
}

export default useTractorModels

