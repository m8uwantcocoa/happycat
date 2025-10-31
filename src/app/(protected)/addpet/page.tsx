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

  // validation UI state (added)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [weightWarning, setWeightWarning] = useState<string | null>(null)
  const [birthdateError, setBirthdateError] = useState<string | null>(null)
  const [birthdateWarning, setBirthdateWarning] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const router = useRouter()

  // ---------------- Validation config (tweak here if needed) ----------------
  const MIN_PLAUSIBLE_KG = 0.3   // below this -> implausible for a living kitten
  const WARNING_KG = 12.0        // above this -> warning (non-blocking)
  const ABSOLUTE_MAX_KG = 25.0   // above this -> block (prevents 200kg)
  const MIN_ALLOWED_YEAR = 1987  // user requested: don't accept born before 1995 (you changed it)
  const ABSOLUTE_MAX_AGE = 38    // block if age >= 30 (you changed it)
  const SENIOR_AGE_WARNING = 12  // warn if older than this
  // ------------------------------------------------------------------------

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

  /**
   * Enhanced validateWeight:
   * - keeps your setCustomValidity behavior for native HTML validity
   * - also sets React state for inline UI (error/warning)
   * - blocks absurd values like 200kg by using ABSOLUTE_MAX_KG
   */
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

    // value is in kg (your field label says kg)
    const kg = value

    // absolute impossible / too small
    if (kg <= 0 || kg < MIN_PLAUSIBLE_KG) {
      const msg = `That weight (${kg} kg) is unrealistically low for a cat.`
      input.setCustomValidity(msg)
      setWeightError(msg)
      setWeightWarning(null)
      return
    }

    // absolute impossible / too large (blocks things like 200kg)
    if (kg > ABSOLUTE_MAX_KG) {
      const msg = `That weight (${kg} kg) is implausible. Please check units or value.`
      input.setCustomValidity(msg)
      setWeightError(msg)
      setWeightWarning(null)
      return
    }

    // a strong but non-blocking warning for heavy cats
    if (kg > WARNING_KG) {
      const warn = `Unusually heavy for a cat (${kg.toFixed(1)} kg). Consider double-checking or add health notes.`
      input.setCustomValidity('') // allow submit (unless other errors exist)
      setWeightError(null)
      setWeightWarning(warn)
      return
    }

    // within normal range
    input.setCustomValidity('')
    setWeightError(null)
    setWeightWarning(null)
  }

  /**
   * validateName: keep existing logic but also reflect in state for disabling submit
   * (you already call this onInput in your form).
   */
  const validateName = (input: HTMLInputElement) => {
    if (input.value.length < 2) {
      input.setCustomValidity('Your pet needs a proper name (min 2 chars).')
      setNameError('Your pet needs a proper name (min 2 chars).')
    } else if (input.value.length > 50) {
      input.setCustomValidity('That name is too long! Keep it short.')
      setNameError('That name is too long! Keep it short.')
    } else {
      input.setCustomValidity('')
      setNameError(null)
    }
  }

  /**
   * validateBirthdate: new function that checks:
   * - correct date format / not empty (optional field)
   * - not in the future
   * - not before MIN_ALLOWED_YEAR (user requested blocking before 1995)
   * - age < ABSOLUTE_MAX_AGE (block)
   * - warn if older than SENIOR_AGE_WARNING
   */
  const validateBirthdate = (input: HTMLInputElement) => {
    const raw = input.value
    if (!raw) {
      // optional field - clear errors if empty
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

    // ok
    input.setCustomValidity('')
    setBirthdateError(null)
    setBirthdateWarning(null)
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

    // Do one last validation round before trying to submit
    if (weightError || birthdateError || nameError) {
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

      // If API returned a non-2xx, try to surface the server message
      if (!response.ok) {
        let errText = 'Failed to add pet'
        try {
          const errJson = await response.json()
          // server might return { error: '...' } or other shapes
          errText = errJson?.error ?? errJson?.message ?? JSON.stringify(errJson)
        } catch (err) {
          // fallback to status text
          errText = response.statusText || errText
        }
        setMessage(errText)
        setLoading(false)
        return
      }

      // success: optionally fetch the after-create plan but don't block navigation
      // start it but don't await if you want instant navigation:
      generateAfterSubmitPlan(name).catch((err) => console.warn('After-create plan failed', err))

      // navigate to dashboard right away
      router.push('/dashboard')

    } catch (error) {
      console.error('Error adding pet:', error)
      setMessage('Something went wrong. Please try again.')
      setLoading(false)
    } finally {
      // if you navigated away above, this component unmounts; safe to keep
      setLoading(false)
    }
  }

  // helper: whether form is allowed to submit
  const formHasBlockingErrors = Boolean(weightError || birthdateError || nameError)

  // ---------------- POST CREATE SCREEN (not used when we navigate immediately) ----------------
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
                Typical range: 3-5kg for most cats
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
                    max={5}
                    min={1}
                    onInput={(e) => validateFeedingTime(e.currentTarget)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 2"
                    value={feedingTime}
                    onChange={(e) => {
                      // Prevent negative values and enforce minimum of 1
                      const value = Math.max(1, parseInt(e.target.value) || 1)
                      setFeedingTime(value.toString())
                    }}
                    onBlur={(e) => {
                      // Ensure value is at least 1 when user leaves field
                      if (!e.target.value || parseInt(e.target.value) < 1) {
                        setFeedingTime('1')
                        e.target.value = '1'
                      }
                    }}
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 8"
                    value={feedingFrequency}
                    onChange={(e) => setFeedingFrequency(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* CARE ROUTINE */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-3">Care Routine</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brushFrequencyPerWeek" className="text-sm font-medium text-gray-700 mb-2 block">
                    Brushing per week
                  </label>
                  <input
                    type="number"
                    id="brushFrequencyPerWeek"
                    min="0"
                    max="14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 3"
                    value={brushFrequencyPerWeek}
                    onChange={(e) => setBrushFrequencyPerWeek(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="litterChangeTime" className="text-sm font-medium text-gray-700 mb-2 block">
                    Days between litter changes
                  </label>
                  <input
                    type="number"
                    id="litterChangeTime"
                    min="1"
                    max="7"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 2"
                    value={litterChangeTime}
                    onChange={(e) => setLitterChangeTime(e.target.value)}
                  />
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
