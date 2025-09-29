import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { formatSpeciesName } from '@/lib/pets'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPetCareStatus, analyzeCareNeeds } from '@/lib/caresystem'  // Add this import
import CareTracker from './components/caretracker'
// Helper function for pet image
function getSpeciesImage(species: string): string {
  const imageMap: { [key: string]: string } = {
    'RAGDOLL': '/ragdoll.png',
    'SIAMESE': '/siamese.png',
    'BRITISH_SHORTHAIR': '/britishshort.png',
    'PERSIAN': '/persian.png'
  }
  
  return imageMap[species] || '/ragdoll.png'
}

interface PageProps {
  params: {
    id: string
  }
}
function getUrgentNeed(careNeeds: any) {
  const needs = careNeeds.needs || {}
  
  // Priority order - most urgent first
  if (needs.FEED) return { emoji: '🍽️', text: 'HUNGRY!', color: 'bg-red-100' }
  if (needs.WATER) return { emoji: '💧', text: 'THIRSTY!', color: 'bg-blue-100' }
  if (needs.LITTER) return { emoji: '🧹', text: 'DIRTY LITTER!', color: 'bg-yellow-100' }
  if (needs.PLAY) return { emoji: '🎾', text: 'WANTS TO PLAY!', color: 'bg-green-100' }
  if (needs.BRUSH) return { emoji: '🪮', text: 'NEEDS BRUSHING!', color: 'bg-purple-100' }
  if (needs.NAILS) return { emoji: '✂️', text: 'NAILS TOO LONG!', color: 'bg-indigo-100' }
  if (needs.VACCINE) return { emoji: '💉', text: 'VACCINE DUE!', color: 'bg-gray-100' }
  
  // If no urgent needs, return null (no circle)
  return null
}
export default async function PetDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }

  // Get the specific pet by ID and make sure it belongs to the current user
  const pet = await prisma.pet.findFirst({
    where: {
      id: params.id,
      userId: user.id // Security: only show pets that belong to this user
    }
  })

  // If pet doesn't exist or doesn't belong to user, show 404
  if (!pet) {
    notFound()
  }const careStatus = await getPetCareStatus(pet.id)
  const careNeeds = analyzeCareNeeds(careStatus)
    const urgentNeed = getUrgentNeed(careNeeds)


  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-2xl mx-auto pt-2">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Pet header with image */}
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
              {pet.name} is currently feeling ... {careStatus.currentMood}
            </p>
          </div>

          {/* Pet details */}
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 mb-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">Pet Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {/* Row 1 */}
                          <div>
                              <span className="font-medium text-gray-700">Species:</span>
                              <p className="text-gray-900">{formatSpeciesName(pet.species)}</p>
                          </div>

                          {pet.birthdate ? (
                              <div>
                                  <span className="font-medium text-gray-700">Birthday:</span>
                                  <p className="text-gray-900">{new Date(pet.birthdate).toLocaleDateString()}</p>
                              </div>
                          ) : (
                              <div></div> // Empty cell if no birthday
                          )}

                          <div>
                              <span className="font-medium text-gray-700">Sex:</span>
                              <p className="text-gray-900">{pet.sex}</p>
                          </div>

                          {/* Row 2 */}
                          {pet.breed ? (
                              <div>
                                  <span className="font-medium text-gray-700">Breed:</span>
                                  <p className="text-gray-900">{pet.breed}</p>
                              </div>
                          ) : (
                              <div></div> // Empty cell if no breed
                          )}

                          {pet.weightKg ? (
                              <div>
                                  <span className="font-medium text-gray-700">Weight:</span>
                                  <p className="text-gray-900">{pet.weightKg}kg</p>
                              </div>
                          ) : (
                              <div></div> // Empty cell if no weight
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
          {/* Action buttons */}
          
        </div>
      </div>
    </div>
  )
}