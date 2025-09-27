'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)


  const supabase = createClient()
const handleKeyPress = (e: React.KeyboardEvent) => {
  const capsOn = e.getModifierState && e.getModifierState('CapsLock')
  setCapsLockOn(capsOn)
}
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else if (data.user) {
      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="backdrop-blur-md bg-gradient-to-br from-orange-100/90 via-pink-50/80 to-green-100/90 rounded-xl shadow-2xl p-8 border border-white/30">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white/90"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative"> 
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`relative block w-full px-3 py-2 pr-10 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white/90 ${capsLockOn ? 'border-red-500 ring-red-200 ring-2' : 'border-gray-300'
                    }`} placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}  
                />
                {capsLockOn && (
                  <div className="flex items-center justify-center space-x-2  bg-yellow-100/80 border border-yellow-400 rounded-md animate-pulse">
                    <span className="text-yellow-700 text-sm font-small">
                      ⚠️ Caps Lock is ON
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className='flex items-center text-center '>
              <button type="button" className="text-sm text-blue-600 hover:text-blue-500 font-medium" onClick={() => router.push('/reset-password')}>
                Did you forget your password?{' '}
              </button>
                
            </div>

            {message && (
              <div className="text-sm text-center text-red-600 bg-red-50/80 p-2 rounded">
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-left ">
              <Link 
                href="/"
                className="text-lg font-bold text-blue-600 hover:text-blue-500"
              >
                ← Back 
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}