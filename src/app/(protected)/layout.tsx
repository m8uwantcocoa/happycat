import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // We initialize the client here just to keep the session alive (refresh tokens),
  // but we do NOT perform a check or redirect.
  // The Middleware has already verified the user is logged in.
  const supabase = await createClient()

  return (
    <>
      {children}
    </>
  )
}