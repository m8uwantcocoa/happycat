import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatSpeciesName } from '@/lib/pets'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPetCareStatus, analyzeCareNeeds } from '@/lib/caresystem'
import CareTracker from './components/caretracker'
import DeletePetButton from './components/deletebutton'

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

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function getUrgentNeed(careNeeds: any, careStatus: any, pet: any) {
  const needs = careNeeds.needs || {}
  const counts = careNeeds.counts || {}
  
  if (needs.FEED) {
    const lastFeedLog = careStatus?.todayLogs?.filter((log: any) => log.type === 'FEED')
      .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
    
    let canFeed = true
    
    if (lastFeedLog) {
      const lastFeedTimeFromDB = new Date(lastFeedLog.at).getTime()
      const nextFeedTime = lastFeedTimeFromDB + pet.feedingFrequency * 60 * 60 * 1000
      
      if (Date.now() < nextFeedTime) {
        canFeed = false
      }
    }
    
    if ((counts.FEED || 0) >= pet.feedingTime) {
      canFeed = false
    }
    
    if (canFeed) {
      return { emoji: '🍽️', text: 'HUNGRY!', color: 'bg-red-100' }
    }
  }
  
  if (needs.WATER && (counts.WATER || 0) < 1) {
    return { emoji: '💧', text: 'THIRSTY!', color: 'bg-blue-100' }
  }
  
  if (needs.LITTER && (counts.LITTER || 0) < 1) {
    return { emoji: '🧹', text: 'DIRTY LITTER!', color: 'bg-yellow-100' }
  }
  
  if (needs.PLAY) {
    const lastPlayLog = careStatus?.todayLogs?.filter((log: any) => log.type === 'PLAY')
      .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
    
    let canPlay = true
    
    if (lastPlayLog) {
      const lastPlayTimeFromDB = new Date(lastPlayLog.at).getTime()
      const nextPlayTime = lastPlayTimeFromDB + 3 * 60 * 60 * 1000
      
      if (Date.now() < nextPlayTime) {
        canPlay = false
      }
    }
    
    if (canPlay && (counts.PLAY || 0) < 2) {
      return { emoji: '🎾', text: 'WANTS TO PLAY!', color: 'bg-green-100' }
    }
  }
  
  if (needs.BRUSH && (counts.BRUSH || 0) < 1) {
    return { emoji: '🪮', text: 'NEEDS BRUSHING!', color: 'bg-purple-100' }
  }
  
  if (needs.NAILS && (counts.NAILS || 0) < 1) {
    return { emoji: '✂️', text: 'NAILS TOO LONG!', color: 'bg-indigo-100' }
  }
  
  if (needs.VACCINE && (counts.VACCINE || 0) < 1) {
    return { emoji: '💉', text: 'VACCINE DUE!', color: 'bg-gray-100' }
  }
  
  return null
}

export default async function PetDetailPage(props: PageProps) {
  const params = await props.params;

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id: params.id, // Using the awaited ID
      userId: user.id 
    }
  })

  if (!pet) {
    notFound()
  }

  const careStatus = await getPetCareStatus(pet.id)
  const careNeeds = analyzeCareNeeds(careStatus)
  const urgentNeed = getUrgentNeed(careNeeds, careStatus, pet)

  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-2xl mx-auto pt-2">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              href="/dashboard"
              className="text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              ← Back
            </Link>
            <div className="flex gap-2">                
                <DeletePetButton petId={pet.id} />
            </div>
          </div>
          
          {/* Pet Image */}
          <div className="text-center mb-8">
            {urgentNeed && (
              <div className={`w-14 h-14 mr-55 mx-auto mb-2 animate-pulse hover:animate-bounce rounded-full overflow-hidden shadow-lg ${urgentNeed.color} flex items-center justify-center relative`}>
                <span className="text-2xl">{urgentNeed.emoji}</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                  {urgentNeed.text}
                </div>
              </div>
            )}            
            <div className="w-32 h-32 mx-auto mb-4 hover:animate-spin rounded-full overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
              <img
                src={getSpeciesImage(pet.species)}
                alt={`${formatSpeciesName(pet.species)} cat`}
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

          {/* Pet details */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pet Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <span className="font-medium text-gray-700">Breed:</span>
                <p className="text-gray-900">{formatSpeciesName(pet.species)}</p>
              </div>

              {pet.birthdate ? (
                <div>
                  <span className="font-medium text-gray-700">Birthday:</span>
                  <p className="text-gray-900">{new Date(pet.birthdate).toLocaleDateString()}</p>
                </div>
              ) : (
                <div><span className="font-medium text-gray-700">Birthday:</span>
                  <p className="text-gray-900">UNKNOWN</p></div>
              )}

              <div>
                <span className="font-medium text-gray-700">Sex:</span>
                <p className="text-gray-900">{pet.sex}</p>
              </div>

              {pet.breed ? (
                <div>
                  <span className="font-medium text-gray-700">Mixed:</span>
                  <p className="text-gray-900">{pet.breed}</p>
                </div>
              ) : (
                <div><span className="font-semibold text-gray-700">Pure breed</span>
                  <p className="text-gray-900"></p></div>
              )}

              {pet.weightKg ? (
                <div>
                  <span className="font-medium text-gray-700">Weight:</span>
                  <p className="text-gray-900">{pet.weightKg.toString()}kg</p>
                </div>
              ) : (
                <div><span className="font-medium text-gray-700">Weight:</span>
                  <p className="text-gray-900">UNKNOWN</p></div>
              )}

              <div>
                <span className="font-medium text-gray-700">Neutered:</span>
                <p className="text-gray-900">{pet.neutered ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <CareTracker
            petId={pet.id}
            petName={pet.name}
            careStatus={careStatus}
            careNeeds={careNeeds}
            pet={pet}
          />
        </div>
      </div>
    </div>
  )
}