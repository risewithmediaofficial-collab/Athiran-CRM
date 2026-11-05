import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-content-primary mb-2">
        Reset Password
      </h2>
      <p className="text-xs text-content-secondary mb-6 leading-relaxed">
        For enterprise security, password resets are managed directly by your Athiran Motors dealership administrator or HR department.
      </p>

      <div className="p-4 bg-surface-raised rounded-xl border border-border-subtle text-xs text-content-secondary mb-6 space-y-2">
        <div className="font-semibold text-content-primary">Procedure:</div>
        <div>1. Notify your Sales or Service Manager.</div>
        <div>2. Super Admin can securely issue a one-time temporary password from Employee Management.</div>
        <div>3. You will be prompted to choose a new password upon your next login.</div>
      </div>

      <Link to="/login">
        <Button variant="secondary" size="md" fullWidth leftIcon={ArrowLeft}>
          Back to Sign In
        </Button>
      </Link>
    </div>
  )
}

