module.exports = {
  apps: [
    {
      name: 'athiran-crm-backend',
      script: 'src/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
