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
  const [loadingSpeciesHelp, setLoadingSpeciesHelp] = useState(false)
  const [showPostCreateScreen, setShowPostCreateScreen] = useState(false)

  // validation UI state
  const [weightError, setWeightError] = useState<string | null>(null)
  const [weightWarning, setWeightWarning] = useState<string | null>(null)
  const [birthdateError, setBirthdateError] = useState<string | null>(null)
  const [birthdateWarning, setBirthdateWarning] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [feedingTimeError, setFeedingTimeError] = useState<string | null>(null)
  const [feedingFrequencyError, setFeedingFrequencyError] = useState<string | null>(null)
  const [brushError, setBrushError] = useState<string | null>(null)
  const [litterError, setLitterError] = useState<string | null>(null)

  const router = useRouter()

  // ---------------- Validation config ----------------
  const MIN_PLAUSIBLE_KG = 0.3
  const WARNING_KG = 12.0
  const ABSOLUTE_MAX_KG = 25.0
  const MIN_ALLOWED_YEAR = 1987  // user note said 1995 earlier; keeping your 1987 constant
  const ABSOLUTE_MAX_AGE = 38
  const SENIOR_AGE_WARNING = 12
  const MIN_WEEKLY = 1
  const MAX_WEEKLY = 7
  // ---------------------------------------------------

  // ---------------- VALIDATION HELPERS ----------------
  const validateFeedingTime = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    const freq = Math.max(1, Math.min(24, parseInt(feedingFrequency) || 1))
    const maxMealsFromHours = Math.max(1, Math.floor(24 / freq))

    if (Number.isNaN(value)) {
      const msg = 'Enter meals/day as a number.'
      input.setCustomValidity(msg)
      setFeedingTimeError(msg)
      return
    }
    if (value < 1 || value > 24) {
      const msg = 'Meals/day must be 1–24.'
      input.setCustomValidity(msg)
      setFeedingTimeError(msg)
      return
    }
    if (value > maxMealsFromHours) {
      const msg = `With ${freq}h between meals, max meals/day is ${maxMealsFromHours}.`
      input.setCustomValidity(msg)
      setFeedingTimeError(msg)
      return
    }
    input.setCustomValidity('')
    setFeedingTimeError(null)
  }

  const validateFeedingFrequency = (input: HTMLInputElement) => {
    const value = parseInt(input.value)
    if (Number.isNaN(value)) {
      const msg = 'Enter hours between meals as a number.'
      input.setCustomValidity(msg)
      setFeedingFrequencyError(msg)
      return
    }
    if (value < 1 || value > 24) {
      const msg = 'Feeding interval must be 1–24 hours.'
      input.setCustomValidity(msg)
      setFeedingFrequencyError(msg)
      return
    }
    input.setCustomValidity('')
    setFeedingFrequencyError(null)

    // keep meals/day constraint in sync
    const mealsEl = document.getElementById('feedingTime') as HTMLInputElement | null
    if (mealsEl) validateFeedingTime(mealsEl)
  }

  const validateWeight = (input: HTMLInputElement) => {
    const raw = input.value
    if (!raw) {
      input.setCustomValidity('')
      setWeightError(null)
      setWeightWarning(null)
      return
    }

    const value = parseFloat(raw)
    if (Number.isNaN(value)) {
      const msg = 'Please enter a valid number for weight.'
      input.setCustomValidity(msg)
      setWeightError(msg)
      setWeightWarning(null)
      return
    }

    const kg = value
    if (kg <= 0 || kg < MIN_PLAUSIBLE_KG) {
      const msg = `That weight (${kg} kg) is unrealistically low for a cat.`
      input.setCustomValidity(msg)
      setWeightError(msg)
      setWeightWarning(null)
      return
    }

    if (kg > ABSOLUTE_MAX_KG) {
      const msg = `That weight (${kg} kg) is implausible. Please check units or value.`
      input.setCustomValidity(msg)
      setWeightError(msg)
      setWeightWarning(null)
      return
    }

    if (kg > WARNING_KG) {
      const warn = `Unusually heavy for a cat (${kg.toFixed(1)} kg). Consider double-checking or add health notes.`
      input.setCustomValidity('')
      setWeightError(null)
      setWeightWarning(warn)
      return
    }

    input.setCustomValidity('')
    setWeightError(null)
    setWeightWarning(null)
  }

  const validateName = (input: HTMLInputElement) => {
    if (input.value.length < 2) {
      const msg = 'Your pet needs a proper name (min 2 chars).'
      input.setCustomValidity(msg)
      setNameError(msg)
    } else if (input.value.length > 50) {
      const msg = 'That name is too long! Keep it short.'
      input.setCustomValidity(msg)
      setNameError(msg)
    } else {
      input.setCustomValidity('')
      setNameError(null)
    }
  }

  const validateBirthdate = (input: HTMLInputElement) => {
    const raw = input.value
    if (!raw) {
      input.setCustomValidity('')
      setBirthdateError(null)
      setBirthdateWarning(null)
      return
    }

    const dt = new Date(raw)
    if (Number.isNaN(dt.getTime())) {
      const msg = 'Enter a valid date.'
      input.setCustomValidity(msg)
      setBirthdateError(msg)
      setBirthdateWarning(null)
      return
    }

    const year = dt.getFullYear()
    const now = new Date()
    const currentYear = now.getFullYear()
    const age = currentYear - year

    if (dt > now) {
      const msg = 'Birth date cannot be in the future.'
      input.setCustomValidity(msg)
      setBirthdateError(msg)
      setBirthdateWarning(null)
      return
    }

    if (year < MIN_ALLOWED_YEAR) {
      const msg = `Birth year before ${MIN_ALLOWED_YEAR} is not allowed.`
      input.setCustomValidity(msg)
      setBirthdateError(msg)
      setBirthdateWarning(null)
      return
    }

    if (age >= ABSOLUTE_MAX_AGE) {
      const msg = `Age ${age} is implausible for a cat (>= ${ABSOLUTE_MAX_AGE}).`
      input.setCustomValidity(msg)
      setBirthdateError(msg)
      setBirthdateWarning(null)
      return
    }

    if (age > SENIOR_AGE_WARNING) {
      const warn = `Unusually old (${age} yrs). Please confirm.`
      input.setCustomValidity('')
      setBirthdateError(null)
      setBirthdateWarning(warn)
      return
    }

    input.setCustomValidity('')
    setBirthdateError(null)
    setBirthdateWarning(null)
  }

  const validateBrushPerWeek = (input: HTMLInputElement) => {
    const v = parseInt(input.value)
    if (Number.isNaN(v)) {
      const msg = 'Enter brushing per week as a number.'
      input.setCustomValidity(msg)
      setBrushError(msg)
      return
    }
    if (v < MIN_WEEKLY || v > MAX_WEEKLY) {
      const msg = `Brushing must be ${MIN_WEEKLY}–${MAX_WEEKLY} times/week.`
      input.setCustomValidity(msg)
      setBrushError(msg)
      return
    }
    input.setCustomValidity('')
    setBrushError(null)
  }

  const validateLitterPerWeek = (input: HTMLInputElement) => {
    const v = parseInt(input.value)
    if (Number.isNaN(v)) {
      const msg = 'Enter litter changes per week as a number.'
      input.setCustomValidity(msg)
      setLitterError(msg)
      return
    }
    if (v < MIN_WEEKLY || v > MAX_WEEKLY) {
      const msg = `Litter changes must be ${MIN_WEEKLY}–${MAX_WEEKLY} times/week.`
      input.setCustomValidity(msg)
      setLitterError(msg)
      return
    }
    input.setCustomValidity('')
    setLitterError(null)
  }

  // ---------------- AI HELPERS ----------------
  const handleGenerateSummary = async () => {
    const res = await fetch('/api/aisummary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, species, breed, sex, birthdate, weightKg, neutered, feedingTime, feedingFrequency,
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

  const handleCarePlanReview = async () => {
    const res = await fetch('/api/aicare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, species, sex, weightKg, neutered, feedingTime, feedingFrequency, brushFrequencyPerWeek, litterChangeTime,
      }),
    })
    const data = await res.json()
    setAiCarePlanReview(data.result)
  }

  const generateAfterSubmitPlan = async (newPetName: string) => {
    const res = await fetch('/api/ai-aftercreate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPetName || name, species }),
    })
    const data = await res.json()
    setAfterSubmitPlan(data.plan)
  }

  const handleSpeciesHelp = async () => {
    try {
      setLoadingSpeciesHelp(true)
      const res = await fetch('/api/ai-species', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breed: breed || 'mixed breed', name: name || 'your cat' }),
      })
      const data = await res.json()
      setAiSpeciesHelp(data.help)
    } catch (error) {
      console.error('Error getting species help:', error)
      setAiSpeciesHelp("If your cat type isn't listed, choose the closest match. Persian works for most long-haired cats, British Shorthair for stocky cats, Siamese for slim cats, and Ragdoll for large, fluffy cats.")
    } finally {
      setLoadingSpeciesHelp(false)
    }
  }

  // ---------------- FORM SUBMIT ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validate related fields just before submit
    const mealsEl = document.getElementById('feedingTime') as HTMLInputElement | null
    const freqEl = document.getElementById('feedingFrequency') as HTMLInputElement | null
    const brushEl = document.getElementById('brushFrequencyPerWeek') as HTMLInputElement | null
    const litterEl = document.getElementById('litterChangeTime') as HTMLInputElement | null
    mealsEl && validateFeedingTime(mealsEl)
    freqEl && validateFeedingFrequency(freqEl)
    brushEl && validateBrushPerWeek(brushEl)
    litterEl && validateLitterPerWeek(litterEl)

    if (
      weightError ||
      birthdateError ||
      nameError ||
      feedingTimeError ||
      feedingFrequencyError ||
      brushError ||
      litterError
    ) {
      setMessage('Please fix highlighted issues before saving.')
      return
    }

    setLoading(true)
    setMessage('')
    setAfterSubmitPlan('')

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
          feedingTime: feedingTime ? parseInt(feedingTime) : undefined,
          feedingFrequency: feedingFrequency ? parseInt(feedingFrequency) : undefined,
          litterChangeTime: litterChangeTime ? parseInt(litterChangeTime) : undefined,
          brushFrequencyPerWeek: brushFrequencyPerWeek ? parseInt(brushFrequencyPerWeek) : undefined,
        }),
      })

      if (!response.ok) {
        let errText = 'Failed to add pet'
        try {
          const errJson = await response.json()
          errText = errJson?.error ?? errJson?.message ?? JSON.stringify(errJson)
        } catch (err) {
          errText = response.statusText || errText
        }
        setMessage(errText)
        setLoading(false)
        return
      }

      generateAfterSubmitPlan(name).catch((err) => console.warn('After-create plan failed', err))
      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding pet:', error)
      setMessage('Something went wrong. Please try again.')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const formHasBlockingErrors = Boolean(
    weightError ||
    birthdateError ||
    nameError ||
    feedingTimeError ||
    feedingFrequencyError ||
    brushError ||
    litterError
  )

  // ---------------- POST CREATE SCREEN (unused if navigating immediately) ----------------
  if (showPostCreateScreen) {
    return (
      <div className="min-h-screen bg-[url('/happycat-background.png')] bg-cover bg-center bg-no-repeat relative p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {name} has been added 🐾
            </h1>
            <p className="text-gray-700 mb-4">
              {afterSubmitPlan || 'Your cat is now in your dashboard. Track feeding, water, play and more in Care Tracker.'}
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* NAME + AI NAME IDEAS */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Pet Name *
                </label>
                <button
                  type="button"
                  onClick={handleSuggestNames}
                  className="text-[11px] bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                >
                  Suggest names
                </button>
              </div>
              <input
                type="text"
                id="name"
                required
                aria-invalid={Boolean(nameError)}
                className={`w-full px-3 py-2 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Whiskers"
                maxLength={20}
                minLength={2}
                value={name}
                onInput={(e) => validateName(e.currentTarget)}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
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

            {/* SPECIES + AI HELP */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="species" className="text-sm font-medium text-gray-700">
                  Cat Type *
                </label>
                {/* Optional helper trigger
                <button
                  type="button"
                  onClick={handleSpeciesHelp}
                  className="text-[11px] bg-blue-500 hover:bg-blue-400 text-white font-bold py-1 px-2 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                >
                  Help me choose
                </button> */}
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

            {/* BREED */}
            <div>
              <label htmlFor="breed" className="text-sm font-medium text-gray-700 mb-2 block">
                Specific Breed <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                id="breed"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Mixed, Maine Coon, etc."
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
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

            {/* BIRTHDATE */}
            <div>
              <label htmlFor="birthdate" className="text-sm font-medium text-gray-700 mb-2 block">
                Birthday <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="date"
                id="birthdate"
                aria-invalid={Boolean(birthdateError)}
                className={`w-full px-3 py-2 border ${birthdateError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={birthdate}
                onChange={(e) => {
                  setBirthdate(e.target.value)
                  validateBirthdate(e.currentTarget)
                }}
                onBlur={(e) => validateBirthdate(e.currentTarget)}
              />
              {birthdateError && <p className="text-xs text-red-600 mt-1">{birthdateError}</p>}
              {!birthdateError && birthdateWarning && <p className="text-xs text-yellow-700 mt-1">{birthdateWarning}</p>}
            </div>

            {/* WEIGHT */}
            <div>
              <label htmlFor="weightKg" className="text-sm font-medium text-gray-700 mb-2 block">
                Weight (kg) <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="number"
                id="weightKg"
                step="0.1"
                min="0.5"
                max="15"
                placeholder="e.g. 4.2"
                aria-invalid={Boolean(weightError)}
                className={`w-full px-3 py-2 border ${weightError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                value={weightKg}
                onInput={(e) => validateWeight(e.currentTarget)}
                onChange={(e) => setWeightKg(e.target.value)}
              />
              {weightError && <p className="text-xs text-red-600 mt-1">{weightError}</p>}
              {!weightError && weightWarning && <p className="text-xs text-yellow-700 mt-1">{weightWarning}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Typical range: 3–5kg for most cats
              </p>
            </div>

            {/* NEUTERED */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="neutered"
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={neutered}
                  onChange={(e) => setNeutered(e.target.checked)}
                />
                <label htmlFor="neutered" className="text-sm font-medium text-gray-700">
                  Neutered/Spayed
                </label>
              </div>
            </div>

            {/* FEEDING SCHEDULE */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-orange-900 mb-3">Feeding Schedule</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="feedingTime" className="text-sm font-medium text-gray-700 mb-2 block">
                    Meals per day *
                  </label>
                  <input
                    type="number"
                    id="feedingTime"
                    required
                    max={24}
                    min={1}
                    onInput={(e) => validateFeedingTime(e.currentTarget)}
                    className={`w-full px-3 py-2 border ${feedingTimeError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                    placeholder="e.g., 2"
                    value={feedingTime}
                    onChange={(e) => {
                      const n = Math.max(1, Math.min(24, parseInt(e.target.value) || 1))
                      setFeedingTime(n.toString())
                    }}
                    onBlur={(e) => validateFeedingTime(e.currentTarget)}
                    aria-invalid={Boolean(feedingTimeError)}
                  />
                  {feedingTimeError && <p className="text-xs text-red-600 mt-1">{feedingTimeError}</p>}
                </div>

                <div>
                  <label htmlFor="feedingFrequency" className="text-sm font-medium text-gray-700 mb-2 block">
                    Hours between meals *
                  </label>
                  <input
                    type="number"
                    id="feedingFrequency"
                    required
                    max={24}
                    min={1}
                    onInput={(e) => validateFeedingFrequency(e.currentTarget)}
                    className={`w-full px-3 py-2 border ${feedingFrequencyError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                    placeholder="e.g., 8"
                    value={feedingFrequency}
                    onChange={(e) => setFeedingFrequency(e.target.value)}
                    onBlur={(e) => validateFeedingFrequency(e.currentTarget)}
                    aria-invalid={Boolean(feedingFrequencyError)}
                  />
                  {feedingFrequencyError && <p className="text-xs text-red-600 mt-1">{feedingFrequencyError}</p>}
                  {!feedingFrequencyError && feedingFrequency && (
                    <p className="text-[11px] text-gray-600 mt-1">
                      With {feedingFrequency}h between meals, max meals/day is {Math.max(1, Math.floor(24 / Math.max(1, Math.min(24, parseInt(feedingFrequency) || 1))))}.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CARE ROUTINE */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-3">Care Routine</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brushFrequencyPerWeek" className="text-sm font-medium text-gray-700 mb-2 block">
                    Brushing (per week)
                  </label>
                  <input
                    type="number"
                    id="brushFrequencyPerWeek"
                    min={MIN_WEEKLY}
                    max={MAX_WEEKLY}
                    className={`w-full px-3 py-2 border ${brushError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                    placeholder="e.g., 3"
                    value={brushFrequencyPerWeek}
                    onInput={(e) => validateBrushPerWeek(e.currentTarget)}
                    onBlur={(e) => validateBrushPerWeek(e.currentTarget)}
                    onChange={(e) => setBrushFrequencyPerWeek(e.target.value)}
                    aria-invalid={Boolean(brushError)}
                  />
                  {brushError && <p className="text-xs text-red-600 mt-1">{brushError}</p>}
                </div>

                <div>
                  <label htmlFor="litterChangeTime" className="text-sm font-medium text-gray-700 mb-2 block">
                    Litter changes (per week)
                  </label>
                  <input
                    type="number"
                    id="litterChangeTime"
                    min={MIN_WEEKLY}
                    max={MAX_WEEKLY}
                    className={`w-full px-3 py-2 border ${litterError ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                    placeholder="e.g., 2"
                    value={litterChangeTime}
                    onInput={(e) => validateLitterPerWeek(e.currentTarget)}
                    onBlur={(e) => validateLitterPerWeek(e.currentTarget)}
                    onChange={(e) => setLitterChangeTime(e.target.value)}
                    aria-invalid={Boolean(litterError)}
                  />
                  {litterError && <p className="text-xs text-red-600 mt-1">{litterError}</p>}
                </div>
              </div>
            </div>

            {/* CARE PLAN REVIEW */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-blue-900">Care plan review</p>
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
                Generate cat summary
              </button>
              {aiSummary && <p className="text-sm text-gray-700 mt-2">{aiSummary}</p>}
            </div>

            {/* ERROR MESSAGE */}
            {message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || formHasBlockingErrors}
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
