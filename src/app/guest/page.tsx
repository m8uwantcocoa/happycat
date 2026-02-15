"use client";

import { useGuestStore } from '@/lib/gueststorecontext'
import { formatSpeciesName } from '@/lib/pets'
import Link from 'next/link'
import { Trash2 } from 'lucide-react';

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

export default function GuestDashboard() {
  const { pets, isLoaded, clearAllData } = useGuestStore()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-bounce text-4xl">🐱</div>
      </div>
    )
  }

  const hasPets = pets.length > 0

  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-4xl pt-25 mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, Guest! 🐾
              </h1>
              <p className="text-gray-600 mt-2 text-pretty">
                Welcome to guest mode, your data is stored locally and functionality is limited, don't forget to sign up!
              </p>
              
            </div>
            
          </div>

          {hasPets ? (
            <div>
              <div className="flex justify-start mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Your Cats ({pets.length})
                </h2>
              </div>
              <div className="flex justify-end items-center mb-6">
               
                <Link 
                  href="/guest/addpet"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold border-b-4 border-blue-700 hover:border-blue-500 rounded transition-all"
                >
                  Add Cat 
                </Link>
                <button 
              onClick={clearAllData}
              className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold border-b-4 border-red-700 hover:border-red-500 rounded transition-all"
            >
              <Trash2 size={24} /> 
            </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <div 
                    key={pet.id} 
                    className="bg-gradient-to-br hover:-translate-y-2 hover:scale-[1.03] hover:shadow-xl transition-all duration-300 
                    from-orange-100 to-pink-100 rounded-xl p-6 shadow-md"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                      {pet.name} 🐾
                    </h3>
                    
                    <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden shadow-md bg-white flex items-center justify-center">
                      <img
                        src={getSpeciesImage(pet.species)}
                        alt={`${pet.species} cat`}
                        className="w-full h-full object-cover"
                      />
                    </div>                  
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Breed:</strong> {formatSpeciesName(pet.species)}</p>
                      {pet.breed && <p><strong>Mixed:</strong> {pet.breed}</p>}
                      <p><strong>Sex:</strong> {pet.sex}</p>
                      {pet.birthdate && (
                        <p><strong>Birthday:</strong> {new Date(pet.birthdate).toLocaleDateString()}</p>
                      )}
                      {pet.weightKg && <p><strong>Weight:</strong> {pet.weightKg}kg</p>}
                      <p><strong>Neutered:</strong> {pet.neutered ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <Link 
                      href={`/guest/pets/${pet.id}`}
                      className="mt-6 w-full text-center block px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold border-b-4 border-blue-700 hover:border-blue-500 rounded transition-all"
                    >
                      Select Cat
                    </Link>
                    
                  </div>
                ))}
              </div>
              <div className="mt-8  bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
                <p className="text-lg  font-bold text-gray-900 flex justify-center ">Click the Join button and sign up for the full experience!</p>
                <div className="flex justify-center "><Link 
                  href="/signup"
                  className="  px-6 m-2 py-2 bg-green-500 hover:bg-green-400 text-white font-bold border-b-4 border-green-700 hover:border-green-500 rounded transition-all"
                  >Join!</Link></div>
                
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
                href="/guest/addpet"
                className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold border-b-4 border-blue-700 hover:border-blue-500 rounded transition-all"
              >
                Add Your First Pet 
              </Link>
              <div className="mt-30  bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700">
                <p className="text-lg  font-bold text-gray-900 flex justify-center ">Click the Join button and sign up for the full experience!</p>
                <div className="flex justify-center "><Link 
                  href="/signup"
                  className="  px-6 m-2 py-2 bg-green-500 hover:bg-green-400 text-white font-bold border-b-4 border-green-700 hover:border-green-500 rounded transition-all"
                  >Join!</Link></div>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}