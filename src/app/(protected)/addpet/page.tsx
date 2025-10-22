'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Species, Sex } from '@prisma/client'

export default function AddPet() {
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>(Species.PERSIAN)
  const [breed, setBreed] = useState('')
  const [sex, setSex] = useState<Sex>(Sex.UNKNOWN)
  const [birthdate, setBirthdate] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [neutered, setNeutered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [feedingTime,setFeedingTime] = useState('')
  const [feedingFrequency,setFeedingFrequency] = useState('')
  const [litterChangeTime,setLitterChangeTime] = useState('')
  const [brushFrequencyPerWeek,setBrushFrequencyPerWeek] = useState('')

  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setMessage('')

  try {
    const response = await fetch('/api/pets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        species,
        breed: breed || undefined,
        sex,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        neutered,
        feedingTime,
        feedingFrequency,
        litterChangeTime,
        brushFrequencyPerWeek,
      }),
    })

    if (response.ok) {
      router.push('/dashboard')
    } else {
      const errorData = await response.json()
      setMessage(errorData.error || 'Failed to add pet')
    }
  } catch (error) {
    console.error('Error adding pet:', error)
    setMessage('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}
const validateFeedingTime = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 5) {
      input.setCustomValidity('Your cat needs to be fed 1-5 times per day. Please choose a reasonable number!')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateFeedingFrequency = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 24) {
      input.setCustomValidity('Time between feedings should be 0-24 hours. Your kitty needs regular meals!')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateWeight = (input: HTMLInputElement) => {
    const value = parseFloat(input.value)
    if (input.value && (value < 0.1 || value > 20)) {
      input.setCustomValidity('Cat weight should be between 1-20 kg. Is your cat a Lion?')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateName = (input: HTMLInputElement) => {
    if (input.value.length < 2) {
      input.setCustomValidity('Your pet needs a proper name with at least 2 characters!')
    } else if (input.value.length > 50) {
      input.setCustomValidity('That name is too long! Keep it under 20 characters please.')
    } else {
      input.setCustomValidity('')
    }
  }


  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="font-bold  text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              ← Back
            </Link>
            <h1 className="text-3xl pt-5 font-bold text-gray-900">
              Add a New Cat 🐱
            </h1>
            <p className="text-gray-600 mt-2">
              Tell us about your furry friend!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Whiskers"
                maxLength={20}
                minLength={2}
                value={name}
                onInput={(e) => validateName(e.currentTarget)}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
             <div>
              <label htmlFor="feedingTime" className="block text-sm font-medium text-gray-700 mb-2">
                Amount of times fed per day
              </label>
              <input
                type="number"
                id="feedingTime"
                required
                max={5}
                min={1}
                onInput={(e) => validateFeedingTime(e.currentTarget)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1"
                value={feedingTime}
                onChange={(e) => setFeedingTime(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="feedingFrequency" className="block text-sm font-medium text-gray-700 mb-2">
                Time between feeding (in hours)
              </label>
              <input
                type="number"
                id="feedingFrequency"
                required
                max={24}
                onInput={(e) => validateFeedingFrequency(e.currentTarget)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 5"
                value={feedingFrequency}
                onChange={(e) => setFeedingFrequency(e.target.value)}
              />
            </div>
           
            


            <div>
  <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
    Species *
  </label>
  <select
    id="species"
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    value={species}
    onChange={(e) => setSpecies(e.target.value as Species)}
  >
    <option value={Species.RAGDOLL}>Ragdoll</option>
    <option value={Species.SIAMESE}>Siamese</option>
    <option value={Species.BRITISH_SHORTHAIR}>British Shorthair</option>
    <option value={Species.PERSIAN}>Persian</option>
  </select>
</div>

            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                Breed (optional)
              </label>
              <input
                type="text"
                id="breed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mixed, Ragdoll"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                Sex
              </label>
              <select
                id="sex"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
              >
                <option value={Sex.MALE}>Male</option>
                <option value={Sex.FEMALE}>Female</option>
                <option value={Sex.UNKNOWN}>Unknown</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
                Birthdate (optional)
              </label>
              <input
                type="date"
                id="birthdate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={birthdate}
                max={new Date().toISOString().split('T')[0]}
                min={'1990-01-01'}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg, optional)
              </label>
              <input
                type="number"
                id="weightKg"
                step="0.1"
                min={1}
                max={20}
                onInput={(e) => validateWeight(e.currentTarget)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 4.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="neutered"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 text-lg bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Cat...' : 'Add Cat 🐾'}
              </button>
              
              <Link 
                href="/dashboard"
                className="px-6 py-3 font-bold  text-lg bg-gray-400 hover:bg-gray-300 text-white font-bold py-2 px-4 border-b-4 border-gray-600 hover:border-gray-400 rounded"
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