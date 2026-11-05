import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setErrorMsg('')
    setIsLoading(true)
    try {
      await login(data.username, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        'Unable to log in. Please verify your credentials.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-content-primary">
          Sign In
        </h2>
        <p className="text-xs text-content-secondary mt-1">
          Access your Athiran Motors Dealership account
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-status-danger-bg border border-red-200 flex items-start gap-2.5 text-xs text-status-danger animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username / Employee ID"
          placeholder="e.g. superadmin"
          leftIcon={User}
          required
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={Lock}
          required
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
            rightIcon={ArrowRight}
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-border-subtle text-center">
        <span className="text-[11px] text-content-tertiary">
          Need access or password reset? Contact your Athiran Dealership Administrator.
        </span>
      </div>
    </div>
  )
}

