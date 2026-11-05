import 'dotenv/config'

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  API_VERSION: process.env.API_VERSION || 'v1',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'Lax',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  IS_PRODUCTION: (process.env.NODE_ENV || 'development') === 'production',
  IS_DEVELOPMENT: (process.env.NODE_ENV || 'development') === 'development',
}

// Validate required secrets
if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
  if (env.IS_PRODUCTION) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in production')
  }
  // Dev fallback (not secure — only for local dev)
  env.JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET || 'dev_access_secret_replace_in_production_minimum_64_characters'
  env.JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'dev_refresh_secret_replace_in_production_minimum_64_characters'
}

