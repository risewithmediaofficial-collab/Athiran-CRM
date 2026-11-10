import React, { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Tractor,
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Info,
} from 'lucide-react'
import { useTractorModels } from '../../hooks/useTractorModels'
import { tractorModelsApi } from '../../api/tractorModels'
import { useAuth } from '../../context/AuthContext'
import { PERMISSIONS } from '../../constants'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'
import EmptyState from '../ui/EmptyState'
import TractorModelSpecsModal from './TractorModelSpecsModal'

const EMPTY_FORM = {
  modelName: '',
  brand: 'Massey Ferguson',
  category: 'Utility & Mid-HP (40 HP – 42 HP)',
  horsepower: '',
  hpDisplay: '',
  description: '',
  serviceIntervalHours: 250,
  specs: {
    engine: '',
    cylinders: '',
    displacementCc: '',
    transmission: '',
    gears: '',
    clutch: '',
    pto: '',
    liftingCapacity: '',
    hydraulicsControl: '',
    driveType: '2WD',
    brakes: '',
    steering: '',
    emissionNorm: '',
  },
}

export default function TractorModelsCatalog() {
  const queryClient = useQueryClient()
  const { hasAnyPermission, isAdmin } = useAuth()
  const { models, isLoading } = useTractorModels()

  const canManageModels =
    isAdmin() ||
    hasAnyPermission(
      PERMISSIONS.TRACTORS_CREATE,
      PERMISSIONS.TRACTORS_EDIT,
      PERMISSIONS.SETTINGS_MANAGE
    )

  const [search, setSearch] = useState('')
  const [specModel, setSpecModel] = useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [deletingModel, setDeletingModel] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredModels = useMemo(() => {
    const valid = (models || []).filter((m) => !m.isFallback)
    const q = search.trim().toLowerCase()
    if (!q) return valid
    return valid.filter(
      (m) =>
        m.modelName?.toLowerCase().includes(q) ||
        m.brand?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
    )
  }, [models, search])

  const openAddModal = () => {
    setEditingModel(null)
    setFormData(EMPTY_FORM)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditModal = (m) => {
    setEditingModel(m)
    setFormData({
      modelName: m.modelName || '',
      brand: m.brand || 'Massey Ferguson',
      category: m.category || '',
      horsepower: m.horsepower || '',
      hpDisplay: m.hpDisplay || '',
      description: m.description || '',
      serviceIntervalHours: m.serviceIntervalHours || 250,
      specs: {
        engine: m.specs?.engine || '',
        cylinders: m.specs?.cylinders || '',
        displacementCc: m.specs?.displacementCc || '',
        transmission: m.specs?.transmission || '',
        gears: m.specs?.gears || '',
        clutch: m.specs?.clutch || '',
        pto: m.specs?.pto || '',
        liftingCapacity: m.specs?.liftingCapacity || '',
        hydraulicsControl: m.specs?.hydraulicsControl || '',
        driveType: m.specs?.driveType || '2WD',
        brakes: m.specs?.brakes || '',
        steering: m.specs?.steering || '',
        emissionNorm: m.specs?.emissionNorm || '',
      },
    })
    setFormError('')
    setIsFormOpen(true)
  }

  const handleSaveModel = async (e) => {
    e.preventDefault()
    if (!formData.modelName.trim()) {
      setFormError('Tractor model name is required.')
      return
    }
    const hpNum = Number(formData.horsepower) || 40
    const payload = {
      modelName: formData.modelName.trim(),
      brand: formData.brand.trim() || 'Massey Ferguson',
      category: formData.category.trim() || 'Utility & Agricultural',
      horsepower: hpNum,
      hpDisplay: formData.hpDisplay.trim() || `${hpNum} HP`,
      description: formData.description.trim(),
      serviceIntervalHours: Number(formData.serviceIntervalHours) || 250,
      specs: formData.specs,
    }

    try {
      setSubmitting(true)
      setFormError('')
      if (editingModel) {
        await tractorModelsApi.updateModel(editingModel._id, payload)
      } else {
        await tractorModelsApi.createModel(payload)
      }
      await queryClient.invalidateQueries({ queryKey: ['tractorModels'] })
      setIsFormOpen(false)
    } catch (err) {
      setFormError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Failed to save tractor model.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteModel = async () => {
    if (!deletingModel) return
    try {
      setSubmitting(true)
      await tractorModelsApi.deleteModel(deletingModel._id)
      await queryClient.invalidateQueries({ queryKey: ['tractorModels'] })
      setIsDeleteOpen(false)
      setDeletingModel(null)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete tractor model.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateSpec = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, [field]: value },
    }))
  }

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tractor models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span>Double-click any model to view specs</span>
          </span>
          {canManageModels && (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAddModal}>
              Add Model
            </Button>
          )}
        </div>
      </div>

      {/* Models List — Clean Model-Only Table (No Pricing) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="md" message="Loading tractor models..." />
          </div>
        ) : filteredModels.length === 0 ? (
          <EmptyState
            icon={<Tractor className="w-10 h-10 text-slate-300" />}
            title="No Tractor Models Found"
            description={
              search
                ? 'No tractor models match your search.'
                : 'Add tractor models to build your dealership model catalog.'
            }
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6 w-16">#</th>
                  <th className="py-3.5 px-6">Tractor Model</th>
                  <th className="py-3.5 px-6 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModels.map((model, idx) => (
                  <tr
                    key={model._id}
                    tabIndex={0}
                    onDoubleClick={() => setSpecModel(model)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSpecModel(model)
                      }
                    }}
                    title="Double-click to view specifications"
                    className="hover:bg-primary-50/40 cursor-pointer transition-colors group select-none touch-manipulation focus:outline-none focus:bg-primary-50/50"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shrink-0">
                          <Tractor className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                          {model.modelName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="hidden sm:inline-block text-[11px] text-slate-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Double-click for specs
                        </span>
                        <button
                          type="button"
                          title="View Specifications"
                          onClick={() => setSpecModel(model)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors sm:hidden"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {canManageModels && (
                          <>
                            <button
                              type="button"
                              title="Edit Model"
                              onClick={() => openEditModal(model)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Delete Model"
                              onClick={() => {
                                setDeletingModel(model)
                                setIsDeleteOpen(true)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Double-Click Specs Modal (No Price) */}
      <TractorModelSpecsModal
        isOpen={Boolean(specModel)}
        onClose={() => setSpecModel(null)}
        model={specModel}
      />

      {/* Add / Edit Model Modal (No Price Field) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingModel ? 'Edit Tractor Model' : 'Add Tractor Model'}
        size="lg"
      >
        <form onSubmit={handleSaveModel} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Model Name *"
              placeholder="e.g. Massey Ferguson 241 DI Maha Shakti"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              required
            />
            <Input
              label="Brand"
              placeholder="e.g. Massey Ferguson"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Horsepower (Numeric) *"
              type="number"
              placeholder="e.g. 42"
              value={formData.horsepower}
              onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
              required
            />
            <Input
              label="HP Display Label"
              placeholder="e.g. 46–50 HP"
              value={formData.hpDisplay}
              onChange={(e) => setFormData({ ...formData, hpDisplay: e.target.value })}
            />
            <Input
              label="Service Interval (Hrs)"
              type="number"
              value={formData.serviceIntervalHours}
              onChange={(e) => setFormData({ ...formData, serviceIntervalHours: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category / Segment"
              placeholder="e.g. Heavy-Duty & Utility Tractors"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <Input
              label="Drive Type"
              placeholder="e.g. 2WD / 4WD"
              value={formData.specs.driveType}
              onChange={(e) => updateSpec('driveType', e.target.value)}
            />
          </div>

          <Input
            label="Application / Summary"
            placeholder="e.g. Built for ploughing and rotavation"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Engine"
              placeholder="e.g. Simpson S325.1 T III A Diesel"
              value={formData.specs.engine}
              onChange={(e) => updateSpec('engine', e.target.value)}
            />
            <Input
              label="Cylinders & Displacement"
              placeholder="e.g. 3 Cylinders"
              value={formData.specs.cylinders}
              onChange={(e) => updateSpec('cylinders', e.target.value)}
            />
            <Input
              label="Cubic Capacity"
              placeholder="e.g. 2500 cc"
              value={formData.specs.displacementCc}
              onChange={(e) => updateSpec('displacementCc', e.target.value)}
            />
            <Input
              label="Transmission"
              placeholder="e.g. Partial Constant Mesh"
              value={formData.specs.transmission}
              onChange={(e) => updateSpec('transmission', e.target.value)}
            />
            <Input
              label="Gearbox Speeds"
              placeholder="e.g. 8 Forward + 2 Reverse"
              value={formData.specs.gears}
              onChange={(e) => updateSpec('gears', e.target.value)}
            />
            <Input
              label="Lifting Capacity"
              placeholder="e.g. 1700 kgf"
              value={formData.specs.liftingCapacity}
              onChange={(e) => updateSpec('liftingCapacity', e.target.value)}
            />
            <Input
              label="PTO Specification"
              placeholder="e.g. 540 RPM Live PTO"
              value={formData.specs.pto}
              onChange={(e) => updateSpec('pto', e.target.value)}
            />
            <Input
              label="Brakes"
              placeholder="e.g. Multi-Disc Oil Immersed Brakes"
              value={formData.specs.brakes}
              onChange={(e) => updateSpec('brakes', e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingModel ? 'Update Model' : 'Save Model'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Tractor Model"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Remove <strong className="text-slate-900">{deletingModel?.modelName}</strong> from the model catalog? Existing customer tractors and leads will keep their saved model names.
          </p>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="secondary" type="button" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="button" loading={submitting} onClick={handleDeleteModel}>
              Delete Model
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

