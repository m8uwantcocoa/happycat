import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute top-4 left-0 right-0 overflow-hidden pointer-events-none">
        <div className="text-9xl cat-walk-right">☁️</div>
        <div className="text-7xl cat-walk-left">☁️</div>
        <div className="text-9xl cat-walk-left">☁️</div>
        <div className="text-8xl cat-walk-right" style={{animationDelay: '5s'}}>☁️</div>
      </div>
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <div className="mt-1 text-yellow-200 text-lg animate-bounce ">✨ 🐱 ✨</div>

          <div className="relative">
            <h1 className="text-4xl font-extrabold text-white font-sans drop-shadow-lg">
              Welcome to HappyCat
            </h1>
            <div className="absolute -top-2 -right-2 text-yellow-300 text-2xl animate-pulse">
              ✨
            </div>
            <div className="absolute -bottom-2 -left-2 text-yellow-300 text-2xl animate-pulse">
              ✨
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-100 drop-shadow-sm">
            Keep your furry friends happy and healthy
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                className="group relative w-full flex justify-center py-2 px-4 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 hover:bg-gray-50 hover:animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="transition-opacity font-bold text-white duration-300 group-hover:opacity-0">Sign In 🐈</span>
                <span className="absolute inset-0 flex items-center font-bold text-white justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">Welcome back 🐾</span>

              </Link>
              <Link
                href="/signup"
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="transition-opacity font-bold duration-300 group-hover:opacity-0">Sign Up 🐈‍⬛</span>
                <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 font-bold group-hover:opacity-100">Sign Up ... It's free!</span>
              </Link>
              <Link
                href="/info"
                className="w-full  flex justify-center bg-gradient-to-l from-green-300 via-green-400 to-green-300 py-2 px-4 border border-green-500 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:animate-pulse focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="font-bold text-green-800">What is HappyCat? ℹ️</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 overflow-hidden pointer-events-none">
        <div className="text-3xl cat-walk-right">🐟</div>
        <div className="text-5xl cat-walk-left"style={{animationDelay: '8s'}}>🐈‍⬛</div>
        <div className="text-7xl cat-walk-left">🐈‍⬛</div>
      </div>
    </div>
  )
}