'use client'

import { useState } from 'react'
import { CareType } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion';

interface CareTrackerProps {
  petId: string
  petName: string
  careStatus: any
  careNeeds: any
  pet:any
}
let lastFeedTime: number
const catFacts: string[] = [
  "Cats have four legs!",
  "Cats sleep in average 16 hours a day.",
  "A cat can jump up to five times its own length.",
  "Cats can't taste sweet things.",
  "Cats purr to calm themselves.",
  "Cats have whiskers on the backs of their front legs too.",
  "Cats can rotate their ears 180 degrees.",
  "Cats spend 70% of their lives sleeping.",
  "A cat's nose print is unique, like a human fingerprint.",
  "Cats can make over 100 different sounds.",
  "A group of cats is called a clowder.",
  "Some cats are allergic to humans.",
  "Cats have 32 muscles in each ear.",
  "Cats can run up to 30 miles per hour.",
  "Cats sleep with one eye open when they're on alert.",
  "Cats have five toes on their front paws and four on their back paws.",
  "The oldest cat ever lived to 38 years.",
  "Cats can drink seawater to survive.",
  "A cat can jump 6 times its body length in one leap.",
  "Cats groom themselves more than any other animal.",
  "Cats can rotate their ears independently.",
  "Some cats are known to chirp at birds.",
  "Cats can make over 100 vocal sounds, dogs only about 10.",
  "Cats' whiskers are roughly as wide as their bodies.",
  "Kittens are born with blue eyes.",
  "Cats can run faster than humans.",
  "Cats can remember things for up to 16 hours.",
  "Some cats like to play fetch.",
  "Cats can sleep anywhere from 12 to 20 hours a day.",
  "Cats use their tails for balance.",
  "Cats have a third eyelid called a haw.",
  "Some cats are ambidextrous, using both paws equally.",
  "Cats can purr while both inhaling and exhaling.",
  "Cats can jump straight up and grab a toy without moving their feet.",
  "Cats can squeeze through any space as long as their head fits.",
  "Cats can dream while they sleep.",
  "Cats can rotate their claws inwards when relaxed.",
  "Some cats can be trained to use the toilet.",
  "Cats' whiskers can detect nearby objects in the dark.",
  "Cats' purring can reduce stress in humans.",
  "Cats have retractable claws.",
  "A cat's tongue has tiny hook-like structures for grooming.",
  "Cats can jump up to 7 times their height.",
  "Some cats enjoy swimming.",
  "Cats can run about 48 km/h in short bursts.",
  "Cats can distinguish colors, but not as vividly as humans.",
  "Cats can be left- or right-pawed.",
  "Cats' noses are very sensitive to scents.",
  "Cats have been domesticated for around 9,000 years.",
  "Cats have a special reflective layer behind their retinas called tapetum lucidum.",
  "Some cats like to hide in boxes.",
  "Cats sometimes knead with their paws when happy.",
  "Cats can recognize their owner's voice.",
  "Cats can meow differently to communicate with humans versus other cats.",
  "Some cats like to play with water.",
  "Cats often land on their feet when they fall.",
  "Cats can be trained to walk on a leash.",
  "Cats have scent glands on their cheeks and forehead.",
  "Cats can sense earthquakes and other vibrations.",
  "Some cats follow a routine very strictly.",
  "Cats sometimes bring 'gifts' like small toys or bugs.",
  "Cats can express affection by slowly blinking at you.",
  "Some cats enjoy listening to music.",
  "Cats can be ticklish on their belly or paws.",
  "Cats love warm places like laptops or sunny spots.",
  "Cats can hide illness very well, so always observe their behavior.",
  "Cats often chase laser pointers for fun.",
  "Cats may knead blankets like their mother did with them.",
  "Cats often sleep curled up to save body heat.",
  "Cats sometimes lick humans to show affection.",
  "Cats can distinguish between different human emotions.",
  "Cats sometimes sleep in the weirdest positions possible.",
  "Cats' tails communicate their mood.",
  "Cats may headbutt to mark territory or show affection.",
  "Cats can climb trees quickly but may have trouble coming down.",
  "Some cats enjoy watching birds from windows.",
  "Cats sometimes meow just to annoy humans.",
  "Cats love boxes, bags, and small spaces.",
  "Some cats have polydactyl (extra) toes.",
  "Cats can jump onto shelves in a single bound.",
  "Cats often knead pillows before lying down.",
  "Some cats enjoy being carried like babies.",
  "Cats may chirp when they see birds outside.",
  "Cats have amazing night vision.",
  "Cats love catnip because it mimics feline pheromones.",
  "Some cats like to sit on keyboards for attention.",
  "Cats often hide when they're scared.",
  "Cats sometimes lick other cats to groom them.",
  "Some cats like belly rubs, others hate them."
];

export default function CareTracker({ petId, petName, careStatus, careNeeds,pet }: CareTrackerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showCareInfo, setShowCareInfo] = useState(false) // Add this state


  const safeCareCounts = careNeeds?.counts || {}
  const safeCareNeeds = careNeeds?.needs || {}

  const performCare = async (careType: CareType) => {
    setLoading(careType)
    setMessage(null)
    if(careType === 'FEED') {
      lastFeedTime = Date.now();
    }
    try {
      const response = await fetch('/api/care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          petId, 
          careType,
          note: `Care activity performed via app`
        })
      })
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        setLoading("Fantastic! You've cared for your virtual pet. Don't forget to do it in real life too! One-minute break…");

        await wait(6000);

        // Keep spinner active until reload
        window.location.reload()
      } else {
        setMessage(`Error: ${result.error}`)
        setLoading(null) // reset only on error
      }
    } catch (error) {
      console.error('Care error:', error)
      setMessage('Failed to log care activity')
      setLoading(null)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    } catch (error) {
      return 'Invalid time'
    }
  }

const shouldDisableButton = (careType: string) => {
  if (loading === careType) return true
  
  switch (careType) {
    case 'FEED':
      const lastFeedLog = careStatus?.todayLogs?.filter((log: any) => log.type === 'FEED')
        .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
      
      if (lastFeedLog) {
        const lastFeedTimeFromDB = new Date(lastFeedLog.at).getTime()
        const nextFeedTime = lastFeedTimeFromDB + pet.feedingFrequency * 60 * 60 * 1000
        
        if (Date.now() < nextFeedTime) {
          return true
        }
      }
      console.log(pet.feedingTime , pet.feedingFrequency)
      return (safeCareCounts.FEED || 0) >= pet.feedingTime
      
    case 'TREAT':
      const lastTreatLog = careStatus?.todayLogs?.filter((log: any) => log.type === 'TREAT')
        .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
      
      if (lastTreatLog) {
        const lastTreatTimeFromDB = new Date(lastTreatLog.at).getTime()
        const nextTreaTime = lastTreatTimeFromDB + 2 * 60 * 60 * 1000
        
        if (Date.now() < nextTreaTime) {
          return true
        }
      }
      return (safeCareCounts.TREAT || 0) >= 5
    case 'PLAY':
      const lastPlayLog = careStatus?.todayLogs?.filter((log: any) => log.type === 'PLAY')
        .sort((a: any, b: any) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]

      if (lastPlayLog) {
        const lastPlayTimeFromDB = new Date(lastPlayLog.at).getTime()
        const nextPlayTime = lastPlayTimeFromDB + 3 * 60 * 60 * 1000 

        if (Date.now() < nextPlayTime) {
          return true
        }
      }
      return (safeCareCounts.PLAY || 0) >= 2
    case 'WATER':
      return (safeCareCounts.WATER || 0) >= 1
    case 'NAILS':
      return (safeCareCounts.NAILS || 0) >= 1
    case 'BRUSH': 
      return (safeCareCounts.BRUSH || 0) >= 1
    case 'LITTER':
      return (safeCareCounts.LITTER || 0) >= 1
    case 'VACCINE':
      return (safeCareCounts.VACCINE || 0) >= 1
    default:
      return false
  }
}

  const getButtonClass = (baseClass: string, isNeeded: boolean, careType: string) => {
    const isDisabled = shouldDisableButton(careType)
    
    if (isDisabled) {
      return `${baseClass.replace('hover:animate-bounce', '')} opacity-60 cursor-not-allowed bg-gray-400 text-gray-600 border-gray-600`
    }
    if (isNeeded) {
      return `${baseClass} animate-pulse ring-2 ring-red-300`
    }
    return baseClass
  }

const getRandomFact = () => {
  const index = Math.floor(Math.random() * catFacts.length);
  return catFacts[index];
};

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Care Tracking</h2>

        <button 
          onClick={() => setShowCareInfo(true)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:scale-110 rounded-full p-2 transition-all duration-200 cursor-pointer"
          title="Information about care tracking"
        >
          ℹ️
        </button>
      </div>

      {showCareInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900">🐱 Cat Care Guide</h2>
          <button 
            onClick={() => setShowCareInfo(false)}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
      </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3 flex items-center">
                    🍽️ Feeding
                  </h3>
                  <p className="text-orange-700 mb-2">
                    Feed your cat <strong>{pet.feedingTime} times per day</strong>, with <strong>{pet.feedingFrequency} hours</strong> between meals.
                  </p>
                  <p className="text-orange-600 text-sm">
                    Regular feeding schedules help maintain your cat's digestive health and energy levels.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                    💧 Water
                  </h3>
                  <p className="text-blue-700 mb-2">
                    Fresh water should be available <strong>once per day</strong> minimum.
                  </p>
                  <p className="text-blue-600 text-sm">
                    Cats need constant access to clean water for proper hydration and kidney health.
                  </p>
                </div>

                <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-800 mb-3 flex items-center">
                    🍬 Treats
                  </h3>
                  <p className="text-pink-700 mb-2">
                    Give treats <strong>up to 5 times per day</strong> with <strong>2-hour cooldowns</strong>.
                  </p>
                  <p className="text-pink-600 text-sm">
                    Treats should be given in moderation to prevent overfeeding and maintain a healthy diet.
                  </p>
                </div>

                <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                  <h3 className="text-xl font-semibold text-teal-800 mb-3 flex items-center">
                    🎾 Play
                  </h3>
                  <p className="text-teal-700 mb-2">
                    Interactive play <strong>up to 2 times per day</strong> with <strong>3-hour cooldowns</strong>.
                  </p>
                  <p className="text-teal-600 text-sm">
                    Regular play sessions keep cats mentally stimulated and physically active.
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center">
                    🧹 Litter Box
                  </h3>
                  <p className="text-yellow-700 mb-2">
                    Clean the litter box <strong>up to 3 times per day</strong> for optimal hygiene.
                  </p>
                  <p className="text-yellow-600 text-sm">
                    A clean litter box prevents health issues and keeps your cat comfortable.
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
                    🪮 Brushing
                  </h3>
                  <p className="text-purple-700 mb-2">
                    Brush your cat's fur <strong>once per day</strong> to prevent matting.
                  </p>
                  <p className="text-purple-600 text-sm">
                    Regular brushing reduces shedding and helps detect skin problems early.
                  </p>
                </div>

                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-3 flex items-center">
                    ✂️ Nail Trimming
                  </h3>
                  <p className="text-indigo-700 mb-2">
                    Trim nails <strong>once per day</strong> when needed to prevent overgrowth.
                  </p>
                  <p className="text-indigo-600 text-sm">
                    Regular nail trims prevent scratching damage and keep your cat comfortable.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    💉 Vaccinations
                  </h3>
                  <p className="text-gray-700 mb-2">
                    Keep vaccinations <strong>up to date</strong> for your cat's health protection.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Regular vaccinations protect against serious diseases and infections.
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center">
                  💡 Important Tips
                </h2>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Each activity has daily limits and cooldown periods to simulate realistic care
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Red indicators and pulsing buttons show when your cat urgently needs care
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <strong>Remember to care for your real pet too, not just the virtual one!</strong>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Regular care keeps your feline friend happy, healthy, and well-behaved
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Disabled buttons mean you've already provided enough care for now
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowCareInfo(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Got it! 🐾
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-2">
        Take care of {petName}'s well-being. Your feline friend depends on you!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        
        <button 
          onClick={() => performCare('FEED' as CareType)}
          disabled={shouldDisableButton('FEED')}
          className={getButtonClass(
            "py-3 px-4 font-semibold hover:animate-bounce text-sm bg-orange-500 hover:bg-orange-400 text-orange-200 font-bold py-2 px-4 border-b-4 border-orange-700 hover:border-orange-500 rounded",
            safeCareNeeds.FEED,
            'FEED'
          )}
        >
          🍽️ {loading === 'FEED' ? 'Feeding...' : 'Food'}
          <div className="text-xs font-normal">({safeCareCounts.FEED || 0}/ {pet.feedingTime})</div>
          {safeCareNeeds.FEED && !shouldDisableButton('FEED') && <div className="text-xs font-normal text-red-200">HUNGRY!</div>}
        </button>

        <button 
          onClick={() => performCare('WATER' as CareType)}
          disabled={shouldDisableButton('WATER')}
          className={getButtonClass(
            "py-3 px-4 font-semibold hover:animate-bounce text-sm bg-blue-500 hover:bg-blue-400 text-blue-200 font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
            safeCareNeeds.WATER,
            'WATER'
          )}
        >
          💧 {loading === 'WATER' ? 'Giving...' : 'Water'}
          <div className="text-xs font-normal">({safeCareCounts.WATER || 0}/1)</div>
          {safeCareNeeds.WATER && !shouldDisableButton('WATER') && <div className="text-xs font-normal text-red-200">THIRSTY!</div>}
        </button>

        <button 
          onClick={() => performCare('TREAT' as CareType)}
          disabled={shouldDisableButton('TREAT')}
          className={getButtonClass(
            "py-4 px-3 font-semibold hover:animate-bounce text-sm bg-pink-500 hover:bg-pink-400 text-pink-200 font-bold py-2 px-4 border-b-4 border-pink-700 hover:border-pink-500 rounded",
            false,
            'TREAT'
          )}
        >
          🍬 {loading === 'TREAT' ? 'Giving...' : 'Treats'}
          <div className="text-xs font-normal">({safeCareCounts.TREAT || 0}/5)</div>
        </button>

        <button 
          onClick={() => performCare('NAILS' as CareType)}
          disabled={shouldDisableButton('NAILS')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-indigo-500 hover:bg-indigo-400 text-indigo-200 font-bold py-2 px-4 border-b-4 border-indigo-700 hover:border-indigo-500 rounded",
            safeCareNeeds.NAILS,
            'NAILS'
          )}
        >
          ✂️ {loading === 'NAILS' ? 'Trimming...' : 'Trim Nails'}
          <div className="text-xs font-normal">({safeCareCounts.NAILS || 0}/1)</div>
          {safeCareNeeds.NAILS && !shouldDisableButton('NAILS') && <div className="text-xs font-normal text-red-200">OVERDUE!</div>}
        </button>

        <button 
          onClick={() => performCare('BRUSH' as CareType)}
          disabled={shouldDisableButton('BRUSH')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-yellow-700 hover:bg-yellow-600 text-yellow-200 font-bold py-2 px-4 border-b-4 border-yellow-900 hover:border-yellow-800 rounded",
            safeCareNeeds.BRUSH,
            'BRUSH'
          )}
        >
          🪮 {loading === 'BRUSH' ? 'Brushing...' : 'Brush Fur'}
          <div className="text-xs font-normal">({safeCareCounts.BRUSH || 0}/1)</div>
          {safeCareNeeds.BRUSH && !shouldDisableButton('BRUSH') && <div className="text-xs font-normal text-red-200">NEEDS BRUSHING!</div>}
        </button>

        <button 
          onClick={() => performCare('LITTER' as CareType)}
          disabled={shouldDisableButton('LITTER')}
          className={getButtonClass(
            "py-3 px-3 font-semibold hover:animate-bounce text-sm bg-yellow-400 hover:bg-yellow-300 text-yellow-700 font-bold py-2 px-4 border-b-4 border-yellow-600 hover:border-yellow-400 rounded",
            safeCareNeeds.LITTER,
            'LITTER'
          )}
        >
          🧹 {loading === 'LITTER' ? 'Cleaning...' : 'Clean Litter'}
          <div className="text-xs font-normal">({safeCareCounts.LITTER || 0}/3)</div>
          {safeCareNeeds.LITTER && !shouldDisableButton('LITTER') && <div className="text-xs font-normal text-red-800">DIRTY!</div>}
        </button>

        <button 
          onClick={() => performCare('PLAY' as CareType)}
          disabled={shouldDisableButton('PLAY')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-teal-400 hover:bg-teal-300 text-teal-700 font-bold py-2 px-4 border-b-4 border-teal-600 hover:border-teal-400 rounded",
            safeCareNeeds.PLAY,
            'PLAY'
          )}
        >
          🎾 {loading === 'PLAY' ? 'Playing...' : 'Play'}
          <div className="text-xs font-normal">({safeCareCounts.PLAY || 0}/2)</div>
          {safeCareNeeds.PLAY && !shouldDisableButton('PLAY') && <div className="text-xs font-normal text-red-800">WANTS TO PLAY!</div>}
        </button>

        <button 
          onClick={() => performCare('VACCINE' as CareType)}
          disabled={shouldDisableButton('VACCINE')}
          className={getButtonClass(
            "py-2 px-3 font-semibold hover:animate-bounce text-sm bg-gray-400 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 border-b-4 border-gray-600 hover:border-gray-400 rounded",
            safeCareNeeds.VACCINE,
            'VACCINE'
          )}
        >
          💉 {loading === 'VACCINE' ? 'Vaccinating...' : 'Vaccination'}
          <div className="text-xs font-normal">({safeCareCounts.VACCINE || 0}/1)</div>
          {safeCareNeeds.VACCINE && !shouldDisableButton('VACCINE') && <div className="text-xs font-normal text-red-800">DUE!</div>}
        </button>

      </div>

      <div className="mt-4 text-xs text-gray-600">
        <h3 className="font-medium mb-2">Today's Care Activities:</h3>
        {careStatus?.todayLogs?.length > 0 ? (
          careStatus.todayLogs.slice(0, 5).map((log: any, index: number) => (
            <div key={index} className="flex justify-between">
              <span>{log.type.toLowerCase()}</span>
              <span>{formatTime(log.at)}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No care activities today yet.</p>
        )}
      </div>

      
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center 
                    bg-gradient-to-t from-blue-300 to-green-300 bg-opacity-25
                    transition-all duration-500 ease-in-out
                    ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className={`relative flex flex-col items-center justify-center space-y-4
                        transform transition-transform duration-500 ease-in-out
                        ${loading ? 'scale-100' : 'scale-95'}`}>
          <div className="absolute w-32 h-32 border-8 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          
          <span className="text-7xl animate-bounce z-10">🐱</span>
          
          <p className="text-center text-lg font-semibold z-10 text-gray-900 mt-36">
            Fantastic! You've cared for your virtual pet. Don't forget to do it in real life too! <br />
            😸 One-minute break… 
          </p>
        </div>

        <div className="fixed bottom-4 w-full text-center font-bold italic text-m text-gray-700 z-10 ">
          Did you know: "{getRandomFact()}"
        </div>
      </div>

    </div>
  )
}