import React from 'react'
import { Tractor } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function TractorModelSpecsModal({ isOpen, onClose, model }) {
  if (!model) return null

  const specs = model.specs || {}
  const specRows = [
    { label: 'Horsepower', value: model.hpDisplay || (model.horsepower ? `${model.horsepower} HP` : '') },
    { label: 'Drive Configuration', value: specs.driveType },
    { label: 'Engine', value: specs.engine },
    {
      label: 'Cylinders & Displacement',
      value: [specs.cylinders, specs.displacementCc].filter(Boolean).join(' • '),
    },
    { label: 'Transmission Type', value: specs.transmission },
    { label: 'Gearbox Speeds', value: specs.gears },
    { label: 'Clutch', value: specs.clutch },
    { label: 'PTO Specification', value: specs.pto },
    { label: 'Lifting Capacity', value: specs.liftingCapacity },
    { label: 'Hydraulics Control', value: specs.hydraulicsControl },
    { label: 'Brakes', value: specs.brakes },
    { label: 'Steering', value: specs.steering },
    { label: 'Emission Norm', value: specs.emissionNorm },
    {
      label: 'Service Interval',
      value: model.serviceIntervalHours ? `Every ${model.serviceIntervalHours} Hours` : 'Every 250 Hours',
    },
  ].filter((item) => item.value && String(item.value).trim() !== '')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={model.modelName}
      description={model.category || model.brand}
      size="lg"
      footer={
        <Button variant="secondary" type="button" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 sm:space-y-5 max-h-[62vh] sm:max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
        {/* Header Highlight Strip (No Pricing) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {model.brand || 'Massey Ferguson'}
                </span>
                {model.hpDisplay && (
                  <Badge variant="primary">{model.hpDisplay}</Badge>
                )}
                {specs.driveType && (
                  <Badge variant="info">{specs.driveType}</Badge>
                )}
              </div>
              {model.description && (
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {model.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Technical Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specRows.map((row) => (
            <div
              key={row.label}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {row.label}
              </span>
              <span className="text-sm font-medium text-slate-900 block break-words">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {specRows.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No additional technical specifications recorded for this model yet.
          </div>
        )}
      </div>
    </Modal>
  )
}
