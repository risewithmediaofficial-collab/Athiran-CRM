import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-content-primary mb-2">
        New Password
      </h2>
      <p className="text-xs text-content-secondary mb-6">
        Please enter the verification code provided by your administrator to configure your new password.
      </p>

      <Link to="/login">
        <Button variant="secondary" size="md" fullWidth leftIcon={ArrowLeft}>
          Back to Sign In
        </Button>
      </Link>
    </div>
  )
}

