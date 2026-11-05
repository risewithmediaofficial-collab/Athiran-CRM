import mongoose from 'mongoose'

const partSchema = new mongoose.Schema({
  partName: String,
  partNumber: String,
  quantity: Number,
  cost: Number,
}, { _id: false })

const SERVICE_TYPES = [
  'first_service', 'second_service', 'third_service', 'regular', 'general', 'breakdown', 'warranty', 'paid', 'other',
  'first_free', 'second_free', 'routine_paid', 'major_overhaul', 'breakdown_repair', 'warranty_repair'
]
const SERVICE_STATUSES = ['scheduled', 'pending', 'in_progress', 'waiting_parts', 'completed', 'cancelled']

const serviceRecordSchema = new mongoose.Schema({
  serviceId: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  serviceType: { type: String, enum: SERVICE_TYPES, required: true },
  serviceDate: { type: Date, required: true },
  currentEngineHours: { type: Number, required: true, min: 0 },
  previousServiceHours: { type: Number, default: 0 },
  hoursOperated: Number, // computed: currentEngineHours - previousServiceHours
  complaint: String,
  workPerformed: String,
  partsReplaced: [partSchema],
  oilDetails: String,
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: SERVICE_STATUSES, default: 'pending' },
  serviceCost: { type: Number, default: 0 },
  recommendations: String,
  customerRemarks: String,
  internalRemarks: String,
  nextServiceDate: Date,
  nextServiceHours: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

serviceRecordSchema.virtual('scheduledDate').get(function() { return this.serviceDate })

serviceRecordSchema.pre('save', function (next) {
  if (this.currentEngineHours != null && this.previousServiceHours != null) {
    this.hoursOperated = Math.max(0, this.currentEngineHours - this.previousServiceHours)
  }
  next()
})

serviceRecordSchema.index({ tractor: 1, serviceDate: -1 })
serviceRecordSchema.index({ customer: 1 })
serviceRecordSchema.index({ status: 1 })
serviceRecordSchema.index({ assignedTo: 1 })
serviceRecordSchema.index({ serviceDate: -1 })

export const ServiceRecord = mongoose.model('ServiceRecord', serviceRecordSchema)
export { SERVICE_TYPES, SERVICE_STATUSES }

