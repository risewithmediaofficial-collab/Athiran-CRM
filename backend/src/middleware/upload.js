import multer from 'multer'
import path from 'path'
import { env } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, WEBP and PDF files are allowed.', 'INVALID_FILE_TYPE'), false)
  }
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } })

