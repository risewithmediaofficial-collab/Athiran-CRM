import React from 'react'
import TractorModelsCatalog from '../../components/tractors/TractorModelsCatalog'

export default function TractorModels() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tractor Models</h1>
        <p className="text-sm text-slate-500 mt-1">
          Massey Ferguson dealership model lineup — double-click any model to view technical specifications
        </p>
      </div>

      <TractorModelsCatalog />
    </div>
  )
}

