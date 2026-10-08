'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateEmail, validatePassword } from '@/lib/validators/person'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [serverError, setServerError] = useState('')

  const supabase = createClient()

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setServerError(error.message || 'Invalid email or password')
        setIsLoading(false)
        return
      }

      // Redirect to dashboard or original destination
      router.push(redirectTo)
    } catch (err) {
      setServerError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setServerError(error.message || 'Unable to sign up')
        setIsLoading(false)
        return
      }

      // Show success message and switch to login
      setServerError('')
      setPassword('')
      setIsLogin(true)
      alert('Sign up successful! Please check your email to confirm your account.')
    } catch (err) {
      setServerError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setServerError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setServerError('OAuth provider unavailable. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      setServerError('An unexpected error occurred during Google sign in')
      setIsLoading(false)
    }
  }

  const handleSubmit = isLogin ? handleSignIn : handleSignUp

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Server Error */}
      {serverError && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {serverError}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
          placeholder="user@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded font-medium transition"
      >
        {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2 border border-slate-300 dark:border-slate-600 rounded font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition text-slate-900 dark:text-slate-100"
      >
        {isLoading ? 'Loading...' : 'Sign in with Google'}
      </button>

      {/* Toggle between sign in and sign up */}
      <div className="text-center text-sm">
        <p className="text-slate-600 dark:text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setErrors({})
              setServerError('')
            }}
            disabled={isLoading}
            className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </form>
  )
}
