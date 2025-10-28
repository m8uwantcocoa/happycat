'use client'

import { useState } from 'react'

interface PetChatProps {
  petName: string
  petSpecies: string
  pet: any // Add the full pet object
}

export default function PetChat({ petName, petSpecies, pet }: PetChatProps) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversation: messages,
          petName: petName,
          petSpecies: petSpecies,
          petDetails: {
            name: pet.name,
            species: petSpecies,
            breed: pet.breed || 'Mixed',
            sex: pet.sex,
            neutered: pet.neutered,
            birthdate: pet.birthdate,
            weightKg: pet.weightKg,
            age: pet.birthdate ? Math.floor((Date.now() - new Date(pet.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setMessages(data.conversation)
        setInput('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('Failed to get response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Ask about {petName}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`p-3 rounded-lg ${
            msg.role === 'user' 
              ? 'bg-blue-100 text-blue-900 ml-8' 
              : 'bg-gray-100 text-gray-900 mr-8'
          }`}>
            <strong>{msg.role === 'user' ? 'You' : 'Cat Expert'}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask about ${petName}'s care...`}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Try asking: "How much should {petName} weigh?" or "What should I feed my {pet.sex} {petSpecies}?"
      </div>
    </div>
  )
}