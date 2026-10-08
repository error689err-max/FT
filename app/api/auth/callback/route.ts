import { createServerClientInstance } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  if (code) {
    const supabase = await createServerClientInstance()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the original destination or dashboard
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Return an error if code exchange failed
  return NextResponse.redirect(
    new URL('/login?error=oauth_failed', request.url)
  )
}
