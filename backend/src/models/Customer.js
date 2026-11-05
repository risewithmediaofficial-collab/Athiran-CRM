import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  customerId: { type: String, unique: true, required: true },
  customerName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true },
  alternateMobile: String,
  email: String,
  address: String,
  village: String,
  district: String,
  state: String,
  pinCode: String,
  notes: String,
  customerType: { type: String, enum: ['individual', 'farmer', 'contractor', 'dealer'], default: 'individual' },
  linkedLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

customerSchema.virtual('fullName').get(function() { return this.customerName })
customerSchema.virtual('primaryMobile').get(function() { return this.mobile })

customerSchema.index({ mobile: 1 })
customerSchema.index({ customerName: 'text', mobile: 'text' })

export const Customer = mongoose.model('Customer', customerSchema)

