import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, conversation = [], petName, petSpecies } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create a comprehensive system message with pet info
    const systemPrompt = `You are a helpful cat care assistant for ${petName || 'this cat'}, a ${petSpecies || 'domestic'} cat. 

Give brief, practical advice about cat care, behavior, and health specific to this pet. Always mention the cat's name when giving advice. Do not give veterinary medical advice - always say "contact your vet" for health concerns.

Keep responses under 50 words and be friendly and encouraging.`

    // Try multiple free models in order of reliability
    const freeModels = [
      "google/gemma-2-9b-it:free",              // Usually most reliable
      "meta-llama/llama-3.2-3b-instruct:free", // Good backup
      "microsoft/phi-3-mini-128k-instruct:free", // Another option
      "deepseek/deepseek-r1:free",              // DeepSeek alternative
    ]

    for (const model of freeModels) {
      try {
        console.log(`Trying model: ${model}`)
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'HappyCat App'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              ...conversation.slice(-2), // Only last 2 messages to reduce tokens
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 200, // Keep it small for free tier
          })
        })

        if (response.ok) {
          const data = await response.json()
          const aiResponse = data.choices[0]?.message?.content || "I'm here to help with cat care!"

          console.log(`✅ Success with model: ${model}`)
          
          return NextResponse.json({ 
            response: aiResponse,
            conversation: [
              ...conversation,
              { role: "user", content: message },
              { role: "assistant", content: aiResponse }
            ],
            modelUsed: model // So you know which one worked
          })
        } else {
          const errorText = await response.text()
          console.log(`❌ Model ${model} failed: ${response.status} - ${errorText}`)
          continue // Try next model
        }
      } catch (modelError) {
        console.log(`❌ Model ${model} error:`, modelError.message)
        continue // Try next model
      }
    }

    // If ALL models failed, return a helpful fallback
    console.log('All AI models failed, using fallback response')
    
    const catAdvice = getCatAdvice(message, petName, petSpecies)
    
    return NextResponse.json({ 
      response: catAdvice + " (AI models temporarily busy - using built-in cat knowledge)",
      conversation: [
        ...conversation,
        { role: "user", content: message },
        { role: "assistant", content: catAdvice }
      ],
      modelUsed: "fallback"
    })

  } catch (error) {
    console.error('Complete API failure:', error)
    return NextResponse.json({ 
      response: "I'm having connection issues, but I'm here to help with cat care questions!",
      conversation: [
        ...conversation,
        { role: "user", content: message || "error" },
        { role: "assistant", content: "Connection error - please try again" }
      ]
    })
  }
}

// Updated fallback function with pet info
function getCatAdvice(message: string, petName?: string, petSpecies?: string): string {
  const lowerMessage = message.toLowerCase()
  const name = petName || 'your cat'
  const species = petSpecies || 'cat'
  
  if (lowerMessage.includes('feed') || lowerMessage.includes('food')) {
    return `For ${name}, feed 2-3 times daily with high-quality ${species.toLowerCase()} food. Always provide fresh water!`
  }
  if (lowerMessage.includes('play') || lowerMessage.includes('toy')) {
    return `${name} needs 10-15 minutes of active play several times daily. Try feather wands or laser pointers for your ${species.toLowerCase()}!`
  }
  if (lowerMessage.includes('water') || lowerMessage.includes('drink')) {
    return `Fresh water should be available 24/7 for ${name}. Many ${species.toLowerCase()} cats prefer running water from fountains.`
  }
  if (lowerMessage.includes('litter') || lowerMessage.includes('box')) {
    return `Clean ${name}'s litter box daily. Most ${species.toLowerCase()} cats prefer unscented, clumping litter.`
  }
  if (lowerMessage.includes('brush') || lowerMessage.includes('groom')) {
    return `For ${name}, brush daily if long-haired, or 2-3 times per week if short-haired to prevent matting.`
  }
  if (lowerMessage.includes('sick') || lowerMessage.includes('health')) {
    return `Watch ${name} for changes in eating, drinking, or bathroom habits. When in doubt, consult your vet about your ${species.toLowerCase()}!`
  }
  
  return `I'm here to help with ${name}'s care! Ask me about feeding, grooming, play time, litter boxes, or health concerns for your ${species.toLowerCase()}.`
}