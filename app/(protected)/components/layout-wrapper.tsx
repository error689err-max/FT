'use client'

import type React from 'react'
import { Sidebar } from './sidebar'
import type { User } from '@supabase/supabase-js'

interface LayoutWrapperProps {
  children: React.ReactNode
  user: User
}

export function LayoutWrapper({ children, user }: LayoutWrapperProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
