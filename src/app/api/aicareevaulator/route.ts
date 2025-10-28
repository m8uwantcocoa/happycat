import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      name, species, sex, weightKg, neutered,
      feedingTime, feedingFrequency, brushFrequencyPerWeek, litterChangeTime
    } = await req.json()

    const prompt = `
You are a cat care expert. 
Evaluate this care plan quickly and kindly.
If something seems extreme, warn softly. 
Otherwise, say it looks balanced. <40 words.

name=${name || 'cat'}
species=${species}
sex=${sex}
weightKg=${weightKg || 'unknown'}
feedingTimesPerDay=${feedingTime || 'unknown'}
hoursBetweenFeeding=${feedingFrequency || 'unknown'}
brushFrequencyPerWeek=${brushFrequencyPerWeek || 'unknown'}
litterChangeTime=${litterChangeTime || 'unknown'}
`

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'HappyCat App'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 150,
      }),
    })

    const data = await res.json()
    const result = data.choices?.[0]?.message?.content || 'This care plan looks great!'
    return NextResponse.json({ result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ result: 'Fallback: care plan seems fine!' })
  }
}
