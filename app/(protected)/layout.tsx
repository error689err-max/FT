import type React from 'react'
import { redirect } from 'next/navigation'
import { createServerClientInstance } from '@/lib/supabase/server'
import { LayoutWrapper } from './components/layout-wrapper'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClientInstance()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not authenticated, redirect to login
  if (!user) {
    redirect('/login')
  }

  return <LayoutWrapper user={user}>{children}</LayoutWrapper>
}
