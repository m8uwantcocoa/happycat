'use client'

import { useState } from 'react'
import { CareType } from '@prisma/client'

interface CareTrackerProps {
  petId: string
  petName: string
  careStatus: any
  careNeeds: any
}

export default function CareTracker({ petId, petName, careStatus, careNeeds }: CareTrackerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Debug: Log the props to see what's missing
  console.log('CareTracker props:', { careStatus, careNeeds })

  // Provide defaults for new pets
  const safeCareCounts = careNeeds?.counts || {}
  const safeCareNeeds = careNeeds?.needs || {}

  const performCare = async (careType: CareType) => {
    setLoading(careType)
    setMessage(null)
    
    try {
      const response = await fetch('/api/care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          petId, 
          careType,
          note: `Care activity performed via app`
        })
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        // Keep spinner active until reload
        window.location.reload()
      } else {
        setMessage(`Error: ${result.error}`)
        setLoading(null) // reset only on error
      }
    } catch (error) {
      console.error('Care error:', error)
      setMessage('Failed to log care activity')
      setLoading(null)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (error) {
      return 'Invalid time'
    }
  }

  const shouldDisableButton = (careType: string) => {
    if (loading === careType) return true
    
    switch (careType) {
      case 'FEED':
        return (safeCareCounts.FEED || 0) >= 2
      case 'TREAT':
        return (safeCareCounts.TREAT || 0) >= 5
      case 'PLAY':
        return (safeCareCounts.PLAY || 0) >= 2
      case 'WATER':
        return (safeCareCounts.WATER || 0) >= 1
      case 'NAILS':
        return (safeCareCounts.NAILS || 0) >= 1
      case 'BRUSH': 
        return (safeCareCounts.BRUSH || 0) >= 1
      case 'LITTER':
        return (safeCareCounts.LITTER || 0) >= 3
      case 'VACCINE':
        return (safeCareCounts.VACCINE || 0) >= 1
      default:
        return false
    }
  }

  const getButtonClass = (baseClass: string, isNeeded: boolean, careType: string) => {
    const isDisabled = shouldDisableButton(careType)
    
    if (isDisabled) {
      return `${baseClass.replace('hover:animate-bounce', '')} opacity-60 cursor-not-allowed bg-gray-400 text-gray-600 border-gray-600`
    }
    if (isNeeded) {
      return `${baseClass} animate-pulse ring-2 ring-red-300`
    }
    return baseClass
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Care Tracking</h2>
      <p className="text-gray-600 mb-2">
        Take care of {petName}'s well-being. Your feline friend depends on you!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        
        <button 
          onClick={() => performCare('FEED' as CareType)}
          disabled={shouldDisableButton('FEED')}
          className={getButtonClass(
            "py-3 px-4 font-semibold hover:animate-bounce text-sm bg-orange-500 hover:bg-orange-400 text-orange-200 font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded",
            safeCareNeeds.FEED,
            'FEED'
          )}
        >
          🍽️ {loading === 'FEED' ? 'Feeding...' : 'Food'}
          <div className="text-xs font-normal">({safeCareCounts.FEED || 0}/2)</div>
          {safeCareNeeds.FEED && <div className="text-xs font-normal text-red-200">HUNGRY!</div>}
        </button>

        <button 
          onClick={() => performCare('WATER' as CareType)}
          disabled={shouldDisableButton('WATER')}
          className={getButtonClass(
            "py-3 px-4 font-semibold hover:animate-bounce text-sm bg-blue-500 hover:bg-blue-400 text-blue-200 font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
            safeCareNeeds.WATER,
            'WATER'
          )}
        >
          💧 {loading === 'WATER' ? 'Giving...' : 'Water'}
          <div className="text-xs font-normal">({safeCareCounts.WATER || 0}/1)</div>
          {safeCareNeeds.WATER && <div className="text-xs font-normal text-red-200">THIRSTY!</div>}
        </button>

        <button 
          onClick={() => performCare('TREAT' as CareType)}
          disabled={shouldDisableButton('TREAT')}
          className={getButtonClass(
            "py-4 px-3 font-semibold hover:animate-bounce text-sm bg-pink-500 hover:bg-pink-400 text-pink-200 font-bold py-2 px-4 border-b-4 border-pink-700 hover:border-pink-500 rounded",
            false,
            'TREAT'
          )}
        >
          🍬 {loading === 'TREAT' ? 'Giving...' : 'Treats'}
          <div className="text-xs font-normal">({safeCareCounts.TREAT || 0}/5)</div>
        </button>

        <button 
          onClick={() => performCare('NAILS' as CareType)}
          disabled={shouldDisableButton('NAILS')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-indigo-500 hover:bg-indigo-400 text-indigo-200 font-bold py-2 px-4 border-b-4 border-indigo-700 hover:border-indigo-500 rounded",
            safeCareNeeds.NAILS,
            'NAILS'
          )}
        >
          ✂️ {loading === 'NAILS' ? 'Trimming...' : 'Trim Nails'}
          <div className="text-xs font-normal">({safeCareCounts.NAILS || 0}/1)</div>
          {safeCareNeeds.NAILS && <div className="text-xs font-normal text-red-200">OVERDUE!</div>}
        </button>

        <button 
          onClick={() => performCare('BRUSH' as CareType)}
          disabled={shouldDisableButton('BRUSH')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-yellow-700 hover:bg-yellow-600 text-yellow-200 font-bold py-2 px-4 border-b-4 border-yellow-900 hover:border-yellow-800 rounded",
            safeCareNeeds.BRUSH,
            'BRUSH'
          )}
        >
          🪮 {loading === 'BRUSH' ? 'Brushing...' : 'Brush Fur'}
          <div className="text-xs font-normal">({safeCareCounts.BRUSH || 0}/1)</div>
          {safeCareNeeds.BRUSH && <div className="text-xs font-normal text-red-200">NEEDS BRUSHING!</div>}
        </button>

        <button 
          onClick={() => performCare('LITTER' as CareType)}
          disabled={shouldDisableButton('LITTER')}
          className={getButtonClass(
            "py-3 px-3 font-semibold hover:animate-bounce text-sm bg-yellow-400 hover:bg-yellow-300 text-yellow-700 font-bold py-2 px-4 border-b-4 border-yellow-600 hover:border-yellow-400 rounded",
            safeCareNeeds.LITTER,
            'LITTER'
          )}
        >
          🧹 {loading === 'LITTER' ? 'Cleaning...' : 'Clean Litter'}
          <div className="text-xs font-normal">({safeCareCounts.LITTER || 0}/3)</div>
          {safeCareNeeds.LITTER && <div className="text-xs font-normal text-red-800">DIRTY!</div>}
        </button>

        <button 
          onClick={() => performCare('PLAY' as CareType)}
          disabled={shouldDisableButton('PLAY')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-teal-400 hover:bg-teal-300 text-teal-700 font-bold py-2 px-4 border-b-4 border-teal-600 hover:border-teal-400 rounded",
            safeCareNeeds.PLAY,
            'PLAY'
          )}
        >
          🎾 {loading === 'PLAY' ? 'Playing...' : 'Play'}
          <div className="text-xs font-normal">({safeCareCounts.PLAY || 0}/2)</div>
          {safeCareNeeds.PLAY && <div className="text-xs font-normal text-red-800">WANTS TO PLAY!</div>}
        </button>

        <button 
          onClick={() => performCare('VACCINE' as CareType)}
          disabled={shouldDisableButton('VACCINE')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-gray-400 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 border-b-4 border-gray-600 hover:border-gray-400 rounded",
            safeCareNeeds.VACCINE,
            'VACCINE'
          )}
        >
          💉 {loading === 'VACCINE' ? 'Vaccinating...' : 'Vaccination'}
          <div className="text-xs font-normal">({safeCareCounts.VACCINE || 0}/1)</div>
          {safeCareNeeds.VACCINE && <div className="text-xs font-normal text-red-800">DUE!</div>}
        </button>

      </div>

      <div className="mt-4 text-xs text-gray-600">
        <h3 className="font-medium mb-2">Today's Care Activities:</h3>
        {careStatus?.todayLogs?.length > 0 ? (
          careStatus.todayLogs.slice(0, 5).map((log: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span>{log.type.toLowerCase()}</span>
              <span>{formatTime(log.at)}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No care activities today yet.</p>
        )}
      </div>

      {/* Full-screen overlay with cat + spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 opacity-25">
          <div className="relative flex items-center justify-center">
            {/* Spinner */}
            <div className="absolute w-32 h-32 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            {/* Cat emoji */}
            <span className="text-7xl">🐱</span>
          </div>
        </div>
      )}
    </div>
  )
}