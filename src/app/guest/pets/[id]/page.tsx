'use client'

import React, { use, useMemo } from 'react'
import { useGuestStore } from '@/lib/gueststorecontext'
import { formatSpeciesName } from '@/lib/pets'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import GuestCareTracker from '@/app/guest/components/GuestCareTracker'

// 1. Re-add the Image Map
function getSpeciesImage(species: string): string {
  const imageMap: { [key: string]: string } = {
    'RAGDOLL': '/ragdoll.png',
    'SIAMESE': '/siamese.png',
    'BRITISH_SHORTHAIR': '/britishshort.png',
    'PERSIAN': '/persian.png',
    'SCOTTISH_FOLD': '/scottishfold.png',
    'SPHYNX': '/sphynx.png',
    'RUSSIAN_BLUE': '/russianblue.png',
    'BIRMAN': '/birman.png',
    'BENGAL': '/bengal.png',
    'ORANGE_TABBY': '/tabbyorange.png',
  }
  return imageMap[species] || '/ragdoll.png'
}

// 2. Add the Urgent Need Logic adapted for local storage logs
function getUrgentNeed(careNeeds: any, todayLogs: any[], pet: any) {
  const needs = careNeeds.needs || {}
  const counts = careNeeds.counts || {}

  if (needs.FEED) {
    const lastFeedLog = [...todayLogs]
      .filter((log: any) => log.type === 'FEED')
      .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]

    let canFeed = true
    if (lastFeedLog) {
      const lastTime = new Date(lastFeedLog.at).getTime()
      const nextTime = lastTime + (pet.feedingFrequency || 0) * 60 * 60 * 1000
      if (Date.now() < nextTime) canFeed = false
    }
    if ((counts.FEED || 0) >= (pet.feedingTime || 0)) canFeed = false
    if (canFeed) return { emoji: '🍽️', text: 'HUNGRY!', color: 'bg-red-100' }
  }

  if (needs.WATER && (counts.WATER || 0) < 1) {
    return { emoji: '💧', text: 'THIRSTY!', color: 'bg-blue-100' }
  }

  

  return null
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function GuestPetDetailPage(props: PageProps) {
  const params = use(props.params)
  const router = useRouter()
  const { pets, careLogs, isLoaded, deletePet } = useGuestStore()

  // Find the pet
  const pet = useMemo(() => 
    pets.find(p => p.id === params.id), 
  [pets, params.id])

  // Today's logs
  const todayLogs = useMemo(() => {
    if (!pet) return []
    const startOfToday = new Date().setHours(0, 0, 0, 0)
    return careLogs.filter(log => 
      log.petId === pet.id && new Date(log.at).getTime() > startOfToday
    )
  }, [careLogs, pet])

  // Care Needs Analysis
  const careNeeds = useMemo(() => {
    if (!pet) return { needs: {}, counts: {} }
    const counts: any = {}
    todayLogs.forEach((log: any) => {
      counts[log.type] = (counts[log.type] || 0) + 1
    })

    return {
      counts,
      needs: {
        FEED: (counts.FEED || 0) < (pet.feedingTime || 1),
        WATER: (counts.WATER || 0) < 1,
        PLAY: (counts.PLAY || 0) < 2,
      }
    }
  }, [todayLogs, pet])

  const urgentNeed = useMemo(() => getUrgentNeed(careNeeds, todayLogs, pet), [careNeeds, todayLogs, pet])

  if (!isLoaded) return <div className="h-screen flex items-center justify-center bg-pink-50">Loading...</div>
  if (!pet) notFound()

  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-2xl mx-auto pt-2">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              href="/guest" 
              className="text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              ← Back
            </Link>
            
          </div>
          
          {/* Pet Header Section with Image and Urgent Need */}
          <div className="text-center mb-8">
            {urgentNeed && (
              <div className={`w-14 h-14 mr-55 mx-auto mb-2 animate-pulse rounded-full overflow-hidden shadow-lg ${urgentNeed.color} flex items-center justify-center relative`}>
                <span className="text-2xl">{urgentNeed.emoji}</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  {urgentNeed.text}
                </div>
              </div>
            )}            
            <div className="w-32 h-32 mx-auto mb-4 hover:animate-spin rounded-full overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center border-4 border-white">
              <img
                src={getSpeciesImage(pet.species)}
                alt={`${formatSpeciesName(pet.species)}`}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {pet.name} 🐾
            </h1>
            <p className="text-xl text-gray-600">
              {formatSpeciesName(pet.species)}
            </p>
            <p className="text-sm text-gray-500">
              {pet.name} is currently ... {urgentNeed ? urgentNeed.text.toLowerCase() : 'doing well!'}
            </p>
          </div>

          {/* Pet details Grid */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 mb-6 shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pet Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="font-medium text-gray-700">Breed:</span>
                <p className="text-gray-900">{formatSpeciesName(pet.species)}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Sex:</span>
                <p className="text-gray-900">{pet.sex}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Weight:</span>
                <p className="text-gray-900">{pet.weightKg ? `${pet.weightKg}kg` : 'UNKNOWN'}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Neutered:</span>
                <p className="text-gray-900">{pet.neutered ? 'Yes' : 'No'}</p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Birthday:</span>
                <p className="text-gray-900">
                  {pet.birthdate ? new Date(pet.birthdate).toLocaleDateString() : 'UNKNOWN'}
                </p>
              </div>

              {pet.breed && (
                <div>
                  <span className="font-medium text-gray-700">Mixed with:</span>
                  <p className="text-gray-900">{pet.breed}</p>
                </div>
              )}
            </div>
          </div>

          <GuestCareTracker 
            petId={pet.id} 
            petName={pet.name} 
            todayLogs={todayLogs} 
            careNeeds={careNeeds} 
            pet={pet}
          />
        </div>
      </div>
    </div>
  )
}