/**
 * Seed script: upserts Massey Ferguson tractor models catalog into MongoDB.
 * Run: node scripts/seedTractorModels.js
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import { TractorModel } from '../src/models/TractorModel.js'
import { INITIAL_TRACTOR_MODELS } from '../src/constants/tractorModels.seed.js'
import { logger } from '../src/utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const seedTractorModels = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm')
  logger.info('Connected to MongoDB')

  for (const model of INITIAL_TRACTOR_MODELS) {
    await TractorModel.findOneAndUpdate(
      { modelCode: model.modelCode },
      { $set: model },
      { upsert: true, new: true }
    )
    logger.info(`✓ Seeded tractor model: ${model.modelName} (${model.hpDisplay})`)
  }

  logger.info(`All ${INITIAL_TRACTOR_MODELS.length} tractor models seeded successfully`)
  await mongoose.disconnect()
  process.exit(0)
}

seedTractorModels().catch((err) => {
  logger.error('Tractor model seed failed:', err)
  process.exit(1)
})
