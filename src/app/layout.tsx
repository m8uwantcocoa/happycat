import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HappyCat',
  description: 'Keep your furry friends happy and healthy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}