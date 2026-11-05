import mongoose from 'mongoose'

const LEAD_SOURCES = ['meta_ads', 'facebook', 'instagram', 'website', 'google_ads', 'google_search', 'whatsapp', 'phone_call', 'walk_in', 'referral', 'existing_customer', 'exhibition_event', 'other']
const LEAD_STATUSES = ['new', 'contacted', 'interested', 'follow_up_required', 'visit_planned', 'negotiation', 'demo_planned', 'booking_pending', 'booked', 'converted', 'lost', 'not_interested']

const leadSchema = new mongoose.Schema({
  leadId: { type: String, unique: true, required: true },
  customerName: { type: String, required: true, trim: true },
  primaryMobile: { type: String, required: true },
  alternateMobile: String,
  email: String,
  address: String,
  village: String,
  district: String,
  state: String,
  pinCode: String,
  leadDate: { type: Date, default: Date.now },
  leadTemperature: { type: String, enum: ['hot', 'warm', 'cold'], required: true },
  leadSource: { type: String, enum: LEAD_SOURCES, required: true },
  status: { type: String, enum: LEAD_STATUSES, default: 'new' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  tractorModelInterested: String,
  tractorCategory: String,
  horsepowerRequirement: Number,
  purposeOfPurchase: String,
  agriculturalLandArea: Number,
  estimatedBudget: Number,
  expectedPurchaseDate: Date,
  financingRequired: { type: Boolean, default: false },
  exchangeRequired: { type: Boolean, default: false },
  competitorPreference: String,
  additionalRequirements: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastContactDate: Date,
  nextFollowUpDate: Date,
  nextFollowUpTime: String,
  expectedDealValue: Number,
  remarks: String,
  lostReason: String,
  conversionDate: Date,
  isArchived: { type: Boolean, default: false },
}, { timestamps: true })

leadSchema.index({ assignedTo: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ leadTemperature: 1 })
leadSchema.index({ leadSource: 1 })
leadSchema.index({ nextFollowUpDate: 1 })
leadSchema.index({ createdAt: -1 })
leadSchema.index({ assignedTo: 1, status: 1 })
leadSchema.index({ customerName: 'text', primaryMobile: 'text', email: 'text' })

export const Lead = mongoose.model('Lead', leadSchema)
export { LEAD_SOURCES, LEAD_STATUSES }

