import { createClient } from '@/lib/supabase/server'
import { getUserPets, formatSpeciesName } from '@/lib/pets'
import Link from 'next/link'

function getSpeciesImage(species: string): string {
  const imageMap: { [key: string]: string } = {
    'RAGDOLL': '/ragdoll.png',
    'SIAMESE': '/siamese.png',
    'BRITISH_SHORTHAIR': '/britishshort.png',
    'PERSIAN': '/persian.png'
  }
  
  return imageMap[species] || '/ragdoll.png' // Default to ragdoll if species not found
}


export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Not authenticated</div>
  }

  // Get user's pets using your existing Pet model
  const pets = await getUserPets(user.id)
  const hasPets = pets.length > 0

  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      
      <div className="max-w-4xl pt-25 mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome! 🐱
              </h1>
              <p className="text-gray-600 mt-2">
                Hello {user.email}
              </p>
            </div>
            <Link 
              href="/auth/signout" 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </Link>
          </div>

          {hasPets ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Your Pets ({pets.length})
                </h2>
                <Link 
                  href="/addpet"
                  className="px-6 py-2 bg-blue-500 hover:animte-pulse focus:animate-ping hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                >
                  Add Cat 🐈‍⬛
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <div 
                    key={pet.id} 
                    className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl p-6 shadow-md"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {pet.name} 🐾
                    </h3>
                    <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
                      <img
                        src={getSpeciesImage(pet.species)}
                        alt={`${formatSpeciesName(pet.species)} cat`}
                        className="w-full h-full object-cover"
                      />
                    </div>                  
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Species:</strong> {formatSpeciesName(pet.species)}</p>
                      {pet.breed && <p><strong>Breed:</strong> {pet.breed}</p>}
                      <p><strong>Sex:</strong> {pet.sex}</p>
                      {pet.birthdate && (
                        <p><strong>Birthday:</strong> {new Date(pet.birthdate).toLocaleDateString()}</p>
                      )}
                      {pet.weightKg && <p><strong>Weight:</strong> {pet.weightKg}kg</p>}
                      <p><strong>Neutered:</strong> {pet.neutered ? 'Yes' : 'No'}</p>
                      <p><strong>Added:</strong> {new Date(pet.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <Link 
                      href={`/dashboard/pets/${pet.id}`}
                      className="mt-4 hover:animate-pulse focus:animate-ping inline-block px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                    >
                      Select pet
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐱</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No pets yet!
              </h2>
              <p className="text-gray-600 mb-8">
                Let's add your first furry friend to get started with HappyCat
              </p>
              <Link 
                href="/addpet/"
                className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              >
                Add Your First Pet 🐈‍⬛
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}