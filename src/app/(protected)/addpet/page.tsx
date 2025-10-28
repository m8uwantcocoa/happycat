'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Species, Sex } from '@prisma/client'

export default function AddPet() {
  // form state
  const [name, setName] = useState('')
  const [species, setSpecies] = useState<Species>(Species.PERSIAN)
  const [breed, setBreed] = useState('')
  const [sex, setSex] = useState<Sex>(Sex.UNKNOWN)
  const [birthdate, setBirthdate] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [neutered, setNeutered] = useState(false)
  const [feedingTime, setFeedingTime] = useState('')
  const [feedingFrequency, setFeedingFrequency] = useState('')
  const [litterChangeTime, setLitterChangeTime] = useState('')
  const [brushFrequencyPerWeek, setBrushFrequencyPerWeek] = useState('')

  // ui state
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [aiSpeciesHelp, setAiSpeciesHelp] = useState('')
  const [aiBreedInfo, setAiBreedInfo] = useState('')
  const [aiNameIdeas, setAiNameIdeas] = useState<string[]>([])
  const [aiCarePlanReview, setAiCarePlanReview] = useState('')
  const [afterSubmitPlan, setAfterSubmitPlan] = useState('')
  const [showPostCreateScreen, setShowPostCreateScreen] = useState(false)

  const router = useRouter()

  // ---------------- VALIDATION HELPERS ----------------
  const validateFeedingTime = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 5) {
      input.setCustomValidity('Your cat needs to be fed 1–5 times per day.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateFeedingFrequency = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (value < 1 || value > 24) {
      input.setCustomValidity('Feeding interval must be 1–24 hours.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateWeight = (input: HTMLInputElement) => {
    const value = parseFloat(input.value)
    if (input.value && (value < 0.5 || value > 20)) {
      input.setCustomValidity('Weight should be between 0.5–20 kg.')
    } else {
      input.setCustomValidity('')
    }
  }

  const validateName = (input: HTMLInputElement) => {
    if (input.value.length < 2) {
      input.setCustomValidity('Your pet needs a proper name (min 2 chars).')
    } else if (input.value.length > 50) {
      input.setCustomValidity('That name is too long! Keep it short.')
    } else {
      input.setCustomValidity('')
    }
  }

  // ---------------- AI HELPERS ----------------
  const handleGenerateSummary = async () => {
    const res = await fetch('/api/aisummary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        species,
        breed,
        sex,
        birthdate,
        weightKg,
        neutered,
        feedingTime,
        feedingFrequency,
      }),
    })
    const data = await res.json()
    setAiSummary(data.summary)
  }

  const handleSuggestNames = async () => {
    const res = await fetch('/api/ainames', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sex, species }),
    })
    const data = await res.json()
    const ideas = data.names.split(',').map((n: string) => n.trim())
    setAiNameIdeas(ideas)
  }

  const handleBreedInfo = async () => {
    if (!breed) return
    const res = await fetch('/api/ai-breed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ breed, species }),
    })
    const data = await res.json()
    setAiBreedInfo(data.info)
  }

  const handleSpeciesHelp = async () => {
    const res = await fetch('/api/ai-species', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ breed, name }),
    })
    const data = await res.json()
    setAiSpeciesHelp(data.help)
  }

  const handleCarePlanReview = async () => {
    const res = await fetch('/api/aicareevaluator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        species,
        sex,
        weightKg,
        neutered,
        feedingTime,
        feedingFrequency,
        brushFrequencyPerWeek,
        litterChangeTime,
      }),
    })
    const data = await res.json()
    setAiCarePlanReview(data.result)
  }

  const generateAfterSubmitPlan = async (newPetName: string) => {
    const res = await fetch('/api/ai-aftercreate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newPetName || name,
        species,
      }),
    })
    const data = await res.json()
    setAfterSubmitPlan(data.plan)
  }

  // ---------------- FORM SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setAfterSubmitPlan('')
    setShowPostCreateScreen(false)

    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        await generateAfterSubmitPlan(name)
        setShowPostCreateScreen(true)
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

  // ---------------- POST CREATE SCREEN ----------------
  if (showPostCreateScreen) {
    return (
      <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {name} has been added 🐾
            </h1>
            <p className="text-gray-700 mb-4">
              {afterSubmitPlan ||
                'Your cat is now in your dashboard. Track feeding, water, play and more in Care Tracker.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- MAIN FORM ----------------
  return (
    <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-sm bg-blue-400 hover:bg-blue-300 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded"
            >
              ← Back
            </Link>
            <h1 className="text-3xl pt-5 font-bold text-gray-900">
              Add a New Cat 🐱
            </h1>
            <p className="text-gray-600 mt-2">Tell us about your furry friend!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME + AI NAME IDEAS */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Pet Name *
                </label>
                <button
                  type="button"
                  onClick={handleSuggestNames}
                  className="text-[11px] bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-2 rounded"
                >
                  Suggest names
                </button>
              </div>
              <input
                type="text"
                id="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Whiskers"
                maxLength={20}
                minLength={2}
                value={name}
                onInput={(e) => validateName(e.currentTarget)}
                onChange={(e) => setName(e.target.value)}
              />
              {aiNameIdeas.length > 0 && (
                <div className="text-xs text-gray-600 mt-2 flex flex-wrap gap-2">
                  {aiNameIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setName(idea)}
                      className="px-2 py-1 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-blue-800"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FEEDING */}
            <div>
              <label htmlFor="feedingTime" className="text-sm font-medium text-gray-700 mb-2 block">
                Amount of times fed per day
              </label>
              <input
                type="number"
                id="feedingTime"
                required
                max={5}
                min={1}
                onInput={(e) => validateFeedingTime(e.currentTarget)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 2"
                value={feedingTime}
                onChange={(e) => setFeedingTime(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="feedingFrequency" className="text-sm font-medium text-gray-700 mb-2 block">
                Time between feeding (hours)
              </label>
              <input
                type="number"
                id="feedingFrequency"
                required
                max={24}
                min={1}
                onInput={(e) => validateFeedingFrequency(e.currentTarget)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 8"
                value={feedingFrequency}
                onChange={(e) => setFeedingFrequency(e.target.value)}
              />
            </div>

            {/* SPECIES + AI HELP */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="species" className="text-sm font-medium text-gray-700">
                  Species *
                </label>
                <button
                  type="button"
                  onClick={handleSpeciesHelp}
                  className="text-[11px] bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded"
                >
                  Don’t see your type?
                </button>
              </div>
              <select
                id="species"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
              >
                <option value={Species.RAGDOLL}>Ragdoll</option>
                <option value={Species.SIAMESE}>Siamese</option>
                <option value={Species.BRITISH_SHORTHAIR}>British Shorthair</option>
                <option value={Species.PERSIAN}>Persian</option>
              </select>
              {aiSpeciesHelp && <p className="text-xs text-gray-600 mt-2">{aiSpeciesHelp}</p>}
            </div>

            {/* BREED + INFO */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="breed" className="text-sm font-medium text-gray-700">
                  Breed (optional)
                </label>
                <button
                  type="button"
                  disabled={!breed}
                  onClick={handleBreedInfo}
                  className="text-[11px] bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 py-1 px-2 rounded"
                >
                  Describe breed
                </button>
              </div>
              <input
                type="text"
                id="breed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Mixed, Ragdoll"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
              {aiBreedInfo && <p className="text-xs text-gray-600 mt-2">{aiBreedInfo}</p>}
            </div>

            {/* SEX */}
            <div>
              <label htmlFor="sex" className="text-sm font-medium text-gray-700 mb-2 block">
                Sex
              </label>
              <select
                id="sex"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
              >
                <option value={Sex.MALE}>Male</option>
                <option value={Sex.FEMALE}>Female</option>
                <option value={Sex.UNKNOWN}>Unknown</option>
              </select>
            </div>

            {/* CARE PLAN REVIEW */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-blue-900">Care plan check</p>
                <button
                  type="button"
                  onClick={handleCarePlanReview}
                  className="text-[11px] bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                >
                  Ask AI
                </button>
              </div>
              {aiCarePlanReview && (
                <p className="text-xs text-blue-900 mt-2 whitespace-pre-line">{aiCarePlanReview}</p>
              )}
            </div>

            {/* AI SUMMARY PREVIEW */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-2 rounded"
              >
                Cat summary preview
              </button>
              {aiSummary && <p className="text-sm text-gray-700 mt-2">{aiSummary}</p>}
            </div>

            {/* SUBMIT */}
            {message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 text-lg bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-600 hover:border-blue-400 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Cat...' : 'Add Cat 🐾'}
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3 text-lg bg-gray-400 hover:bg-gray-300 text-white font-bold border-b-4 border-gray-600 hover:border-gray-400 rounded"
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
