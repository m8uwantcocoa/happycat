'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="backdrop-blur-md bg-gradient-to-br from-orange-100/90 via-pink-50/80 to-green-100/90 rounded-xl shadow-2xl p-8 border border-white/30">
          
          <div className="flex flex-col items-center">
            <img 
              src="/scottishfold.png" 
              alt="HappyCat Mascot" 
              className="w-28 h-28 -mt-20 mb-4 drop-shadow-xl hover:scale-110 transition-transform duration-300"
            />

            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              HappyCat
            </h2>
            
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4 mt-1">
              The Purr-fect Companion
            </p>

            <p className="text-center text-gray-700 leading-relaxed mb-8">
              HappyCat is a virtual cat companion focused on care, routines, and connection.
              In the app, you create your own cat and take care of it through everyday actions like feeding, playtime, and rest.
            <br />
            <br />
              Your interactions affect your cat’s mood and happiness over time. By tracking daily activities and health patterns, you get a clearer picture of what helps your cat feel balanced and happy.
              <br />
              <br />
              You don't need to have a real cat to benefit from HappyCat. Experience the joy of caring for a virtual feline friend while improving your own well-being.
              <br />
              <br />
              HappyCat is designed to be calm, supportive and a simple daily ritual where small actions matter.
              Take care of your cat, build routines, and watch it grow with you. 🐾
            </p>
          </div>

          <div className="flex justify-between gap-4">
              <Link 
                href="/"
                className="flex-1 text-center font-bold text-sm bg-blue-400 hover:bg-blue-300 text-white py-3 px-4 border-b-4 border-blue-600 hover:border-blue-500 rounded transition-all active:border-b-0 active:translate-y-1"
              >
                ← Back
              </Link>
              
              <Link 
                href="/signup"
                className="flex-1 text-center font-bold text-sm bg-green-400 hover:bg-green-300 text-white py-3 px-4 border-b-4 border-green-600 hover:border-green-500 rounded transition-all active:border-b-0 active:translate-y-1"
              >
                Sign up now! 
              </Link>
            </div>
        </div>
      </div>
    </div>
  )
}