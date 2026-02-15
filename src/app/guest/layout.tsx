import { GuestProvider } from '@/lib/gueststorecontext'
export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestProvider>
      {children}
    </GuestProvider>
  )
}