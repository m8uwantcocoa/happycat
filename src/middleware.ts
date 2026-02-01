import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Setup the response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request/response with new cookies
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. DEBUG: Check the user
  const { data: { user }, error } = await supabase.auth.getUser()

  // --- DEBUGGING LOGS (Check Vercel Logs) ---
  const url = request.nextUrl.pathname
  if (!url.startsWith('/_next')) {
    console.log(`[Middleware] Path: ${url}`)
    console.log(`[Middleware] Cookie Count: ${request.cookies.getAll().length}`)
    
    if (user) {
      console.log(`[Middleware] ✅ User found: ${user.email}`)
    } else {
      console.log(`[Middleware] ❌ No User. Error: ${error?.message}`)
      
      // LOG THE RAW COOKIE HEADER (Safe to see if it exists)
      const rawCookie = request.headers.get('cookie')
      console.log(`[Middleware] Raw Cookie Header: ${rawCookie ? 'PRESENT' : 'MISSING'}`)
    }
  }
  // -------------------------------------------

  // 4. Protect Dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // If we are blocking the user, log it!
    console.log(`[Middleware] 🚫 Redirecting guest from ${url} to /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|login|api).*)',
  ],
}