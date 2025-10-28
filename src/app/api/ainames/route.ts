import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sex, species } = await req.json()

    if (!species) {
      return NextResponse.json({ error: 'Missing species' }, { status: 400 })
    }

    console.log('Generating names for:', sex, species)

    const freeModels = [
      "google/gemma-2-9b-it:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "microsoft/phi-3-mini-128k-instruct:free",
      "deepseek/deepseek-r1:free",
    ]

    for (const model of freeModels) {
      try {
        console.log(`🧠 Trying model: ${model}`)

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'HappyCat App'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content:
                  `You are HappyCat AI. Generate 5 cute ${sex?.toLowerCase() || ''} ${species.toLowerCase()} cat names. 
Return only the names separated by commas, no numbers or text.`,
              },
            ],
            temperature: 0.8,
            max_tokens: 60,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const names =
            data.choices?.[0]?.message?.content ||
            'Luna, Bella, Nala, Oliver, Milo'

          console.log(`✅ Success with model: ${model}`)
          return NextResponse.json({ names, modelUsed: model })
        } else {
          const errorText = await response.text()
          console.warn(`❌ Model ${model} failed: ${response.status} - ${errorText}`)
          continue
        }
      } catch (modelErr) {
        console.warn(`❌ Model ${model} error:`, modelErr)
        continue
      }
    }

    console.log('⚠️ All models failed, using fallback names.')

    const fallback =
      sex === 'FEMALE'
        ? 'Luna, Bella, Nala, Coco, Daisy'
        : sex === 'MALE'
        ? 'Max, Charlie, Oliver, Leo, Milo'
        : 'Whiskers, Shadow, Sunny, Paws, Snowball'

    return NextResponse.json({ names: fallback, modelUsed: 'fallback' })
  } catch (err) {
    console.error('❌ AI names route error:', err)

    const defaultNames = 'Luna, Bella, Nala, Oliver, Milo'
    return NextResponse.json({ names: defaultNames, modelUsed: 'error-fallback' })
  }
}
