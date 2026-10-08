import type React from 'react'
import { redirect } from 'next/navigation'
import { createServerClientInstance } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClientInstance()

  // If user is already authenticated, redirect to dashboard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  )
}
