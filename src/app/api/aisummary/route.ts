import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      species,
      breed,
      sex,
      birthdate,
      weightKg,
      neutered,
      feedingTime,
      feedingFrequency,
    } = await request.json()

    const prompt = `
You are HappyCat AI, a friendly cat assistant. 
Summarize this cat in one warm, short sentence (under 25 words). 
Mention its name (if given), sex, and species. 
End with something encouraging or affectionate.
Avoid technical language.

Data:
name=${name || 'unnamed cat'}
species=${species || 'domestic cat'}
breed=${breed || 'unknown'}
sex=${sex || 'unknown'}
birthdate=${birthdate || 'unknown'}
weightKg=${weightKg || 'unknown'}
neutered=${neutered ? 'yes' : 'no'}
feedingTimePerDay=${feedingTime || 'unknown'}
feedingFrequencyHours=${feedingFrequency || 'unknown'}
`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'HappyCat App',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.8,
        max_tokens: 120,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.log(' Summary model failed:', err)
      throw new Error('Model request failed')
    }

    const data = await response.json()
    const aiSummary =
      data.choices?.[0]?.message?.content ||
      `${name || 'This cat'} is a lovely ${species?.toLowerCase() || 'cat'} — sure to bring joy and purrs!`

    return NextResponse.json({ summary: aiSummary })
  } catch (error) {
    console.error('AI Summary route error:', error)
    const fallback = `A sweet ${species?.toLowerCase() || 'cat'} full of personality — you’ll love spending time with ${
      name || 'this furry friend'
    }!`
    return NextResponse.json({ summary: fallback })
  }
}
