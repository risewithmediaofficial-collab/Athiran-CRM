import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile: { type: String, required: true },
  alternateMobile: String,
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  department: { type: String, enum: ['admin', 'sales', 'service', 'management'], required: true },
  designation: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joiningDate: { type: Date, required: true },
  profileImage: String,
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  refreshTokens: { type: [String], select: false, default: [] },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiry: { type: Date, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Never return password in queries
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash
    delete ret.refreshTokens
    delete ret.loginAttempts
    delete ret.lockUntil
    delete ret.passwordResetToken
    delete ret.passwordResetExpiry
    return ret
  },
})

userSchema.index({ role: 1 })
userSchema.index({ department: 1 })
userSchema.index({ accountStatus: 1 })
userSchema.index({ assignedManager: 1 })

export const User = mongoose.model('User', userSchema)

