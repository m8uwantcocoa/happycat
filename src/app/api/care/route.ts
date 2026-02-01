import { NextRequest, NextResponse } from 'next/server'
import { createClientWithCookieAccess } from '@/lib/supabase/server'
import { performCareActivity } from '@/lib/caresystem'
import { prisma } from '@/lib/prisma'
import { CareType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientWithCookieAccess()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { petId, careType, amountG, note } = await request.json()

    if (!petId || !careType) {
      return NextResponse.json({ error: 'Pet ID and care type required' }, { status: 400 })
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: user.id
      }
    })

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
    }

    const result = await performCareActivity(petId, careType as CareType, amountG, note)

    return NextResponse.json({ 
      success: true, 
      careLog: result,
      message: `Successfully logged ${careType.toLowerCase()} for ${pet.name}!`
    })
  } catch (error) {
    console.error('Care activity error:', error)
    return NextResponse.json({ error: 'Failed to perform care activity' }, { status: 500 })
  }
}