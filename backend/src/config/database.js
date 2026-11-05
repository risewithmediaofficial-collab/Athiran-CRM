import 'dotenv/config'
import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm'

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    logger.info(`MongoDB connected: ${mongoose.connection.host}`)
  } catch (error) {
    logger.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err)
})

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

