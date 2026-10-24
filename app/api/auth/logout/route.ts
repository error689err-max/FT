import { createServerClientInstance } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerClientInstance()
  await supabase.auth.signOut()

  const origin = request.headers.get('origin') || 'http://localhost:3000'
  return NextResponse.redirect(new URL('/login', origin), { status: 302 })
}
