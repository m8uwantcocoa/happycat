'use client'

import { useState } from 'react'
import { useGuestStore } from '@/lib/gueststorecontext' // Updated Import
import { CareType } from '@prisma/client'

export default function GuestCareTracker({ petId, petName, todayLogs, careNeeds, pet }: any) {
  const { addCareLog } = useGuestStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const performCare = async (careType: CareType) => {
    setIsProcessing(true)
    addCareLog(petId, careType)
    await new Promise(r => setTimeout(r, 1000)) // Animation delay
    setIsProcessing(false)
  }

  const canFeed = (careNeeds.counts?.FEED || 0) < (pet.feedingTime || 1)
  const canWater = (careNeeds.counts?.WATER || 0) < 1

  return (
    <div className="bg-blue-50 rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => performCare('FEED' as CareType)}
          disabled={!canFeed || isProcessing}
          className={`p-4 rounded-xl font-bold border-b-4 ${
            !canFeed || isProcessing ? 'bg-gray-300 border-gray-400' : 'bg-orange-500 border-orange-700 text-white'
          }`}
        >
          🍽️ Food ({careNeeds.counts.FEED || 0}/{pet.feedingTime || 1})
        </button>

        <button 
          onClick={() => performCare('WATER' as CareType)}
          disabled={!canWater || isProcessing}
          className={`p-4 rounded-xl font-bold border-b-4 ${
            !canWater || isProcessing ? 'bg-gray-300 border-gray-400' : 'bg-blue-500 border-blue-700 text-white'
          }`}
        >
          💧 Water ({careNeeds.counts.WATER || 0}/1)
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="text-4xl animate-bounce">🐱 Updating...</div>
        </div>
      )}
    </div>
  )
}