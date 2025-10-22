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

  const supabase = createClient()

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
              HappyCat ??
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              HappyCat is your go-to app for keeping your feline friends happy and healthy! 🐱
                Track their moods, health, and activities all in one place. Whether you have one cat or a whole clowder, HappyCat helps you ensure they lead joyful lives. Sign up today and give your cats the care they deserve! 🐾
            </p>
          </div>

          <div className="text-center ">
              <Link 
                href="/"
                className="font-bold  text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              ← Back
            </Link>
              
              <Link 
                href="/"
                  className="inline-block px-3 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"

              >
                Sign up now! 
              </Link>
            </div>
        </div>
      </div>
    </div>
  )
}