'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGuestStore } from '@/lib/gueststorecontext' // Adjust path as needed
import { Species, Sex } from '@prisma/client'

export default function AddPet() {
  const { createPet } = useGuestStore()
  const router = useRouter()

  // Form State
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>('PERSIAN')
  const [breed, setBreed] = useState('')
  const [sex, setSex] = useState<Sex>('UNKNOWN')
  const [birthdate, setBirthdate] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [neutered, setNeutered] = useState(false)
  const [feedingTime, setFeedingTime] = useState('')
  const [feedingFrequency, setFeedingFrequency] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // app/guest/addpet/page.tsx

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // Call the fixed createPet
    createPet({
      name,
      species,
      breed: breed || undefined,
      sex,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      neutered,
      feedingTime: feedingTime ? parseInt(feedingTime) : undefined,
      feedingFrequency: feedingFrequency ? parseInt(feedingFrequency) : undefined,
    })

    // No need for router.refresh() with local storage
    router.push('/guest')
  } catch (error) {
    setMessage('Failed to save pet.')
    setLoading(false)
  }
}
  // --- Validation Helpers (Keep your existing ones) ---
  const validateFeedingTime = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 5) {
      input.setCustomValidity('Your cat needs to be fed 1-5 times per day.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateFeedingFrequency = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 24) {
      input.setCustomValidity('Time between feedings should be 1-24 hours.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateWeight = (input: HTMLInputElement) => {
    const value = parseFloat(input.value)
    if (input.value && (value < 0.1 || value > 20)) {
      input.setCustomValidity('Cat weight should be between 0.1-20 kg.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateName = (input: HTMLInputElement) => {
    if (input.value.length < 2) {
      input.setCustomValidity('Name must be at least 2 characters!')
    } else {
      input.setCustomValidity('')
    }
  }

  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <Link 
              href="/guest"
              className="text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 rounded"
            >
              ← Back
            </Link>
            <h1 className="text-3xl pt-5 font-bold text-gray-900">
              Add a New Cat 🐱
            </h1>
            <p className="text-gray-600 mt-2 text-sm italic">
              Guest Mode: Your data is saved locally.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Whiskers"
                value={name}
                onInput={(e) => validateName(e.currentTarget)}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* FEEDING INFO GROUP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Times fed/day</label>
                    <input
                        type="number"
                        required
                        max={5}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onInput={(e) => validateFeedingTime(e.currentTarget)}
                        value={feedingTime}
                        onChange={(e) => setFeedingTime(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours between meals</label>
                    <input
                        type="number"
                        required
                        max={24}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onInput={(e) => validateFeedingFrequency(e.currentTarget)}
                        value={feedingFrequency}
                        onChange={(e) => setFeedingFrequency(e.target.value)}
                    />
                </div>
            </div>

            {/* SPECIES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Breed Group *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
              >
                <option value="RAGDOLL">Ragdoll</option>
                <option value="SIAMESE">Siamese</option>
                <option value="BRITISH_SHORTHAIR">British Shorthair</option>
                <option value="PERSIAN">Persian</option>
                <option value="SCOTTISH_FOLD">Scottish Fold</option>
                <option value="SPHYNX">Sphynx</option>
                <option value="RUSSIAN_BLUE">Russian Blue</option>
                <option value="BIRMAN">Birman</option>
                <option value="BENGAL">Bengal</option>
                <option value="ORANGE_TABBY">Orange Housecat</option>
              </select>
            </div>

            {/* WEIGHT & SEX GROUP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onInput={(e) => validateWeight(e.currentTarget)}
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={sex}
                        onChange={(e) => setSex(e.target.value as Sex)}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="UNKNOWN">Unknown</option>
                    </select>
                </div>
            </div>

            {/* NEUTERED */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="neutered"
                className="w-4 h-4 text-blue-600 rounded"
                checked={neutered}
                onChange={(e) => setNeutered(e.target.checked)}
              />
              <label htmlFor="neutered" className="ml-2 text-sm font-medium text-gray-700">
                Neutered/Spayed
              </label>
            </div>

            {message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {message}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-lg bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 border-b-4 border-blue-600 rounded disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Cat 🐾'}
              </button>
              
              <Link 
                href="/guest"
                className="text-lg bg-gray-400 hover:bg-gray-300 text-white font-bold py-3 px-6 border-b-4 border-gray-600 rounded"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}