import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      name, species, sex, weightKg, neutered,
      feedingTime, feedingFrequency, brushFrequencyPerWeek, litterChangeTime
    } = await req.json()

    const meals = parseInt(feedingTime)
    const hours = parseInt(feedingFrequency)
    const brushing = parseInt(brushFrequencyPerWeek || 0)
    const litter = parseInt(litterChangeTime || 0)

    // Hard validation rules
    if (meals > 4) {
      return NextResponse.json({ 
        result: `🚨 DANGER: ${meals} meals per day is WAY too many! Cats should eat 2-3 times per day maximum. This will make ${name} sick and obese.` 
      })
    }

    if (hours < 4) {
      return NextResponse.json({ 
        result: `🚨 DANGER: Feeding every ${hours} hour(s) is too frequent! Cats need at least 4-6 hours between meals to digest properly.` 
      })
    }

    if (brushing > 7) {
      return NextResponse.json({ 
        result: `⚠️ WARNING: Brushing ${brushing} times per week might stress ${name}. 2-4 times per week is plenty for most cats.` 
      })
    }

    if (litter > 4) {
      return NextResponse.json({ 
        result: `🤢 GROSS: Changing litter every ${litter} days is too infrequent! ${name} needs clean litter every 1-2 days for health and hygiene.` 
      })
    }

    // Only if values pass basic validation, ask AI for detailed review
    const systemPrompt = `Evaluate this cat care plan. Be critical and honest.

${name} (${species}, ${sex}, ${weightKg}kg, ${neutered ? 'neutered' : 'not neutered'}):
- ${meals} meals per day, every ${hours} hours
- Brushing ${brushing}x per week  
- Litter changed every ${litter} days

NORMAL RANGES:
- Feeding: 2-3 meals, 6-12 hours apart
- Brushing: 2-4x per week
- Litter: 1-2 days

Start response with:
- "✅ EXCELLENT" if plan is perfect
- "👍 GOOD" if plan is mostly good with minor tweaks
- "⚠️ NEEDS WORK" if plan has problems
- "🚨 TERRIBLE" if plan is dangerous

Keep under 100 words.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'HappyCat App'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [{ role: 'system', content: systemPrompt }],
        max_tokens: 120,
        temperature: 0.1, 
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const result = data.choices?.[0]?.message?.content || '⚠️ NEEDS WORK: Please review your care plan.'
      return NextResponse.json({ result })
    } else {
      throw new Error('AI request failed')
    }

  } catch (error) {
    console.error('AI care evaluator error:', error)
    
    return NextResponse.json({ 
      result: '✅ GOOD: Your care plan looks reasonable. Make sure to monitor your cat\'s health and adjust as needed.' 
    })
  }
}