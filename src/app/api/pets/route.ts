import { createClient } from '@/lib/supabase/server'
import { createPet } from '@/lib/pets'
import { NextRequest, NextResponse } from 'next/server'
import { Species, Sex } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, species, breed, sex, birthdate, weightKg, neutered } = body

    if (!name || !species) {
      return NextResponse.json({ error: 'Pet name and species are required' }, { status: 400 })
    }

    const pet = await createPet(user.id, {
  name,
  species,
  breed,
  sex: sex || Sex.UNKNOWN,
  birthdate: birthdate ? new Date(birthdate) : undefined,
  weightKg,
  neutered: neutered || false,
}) // Remove the user.email parameter

    if (!pet) {
      return NextResponse.json({ error: 'Failed to create pet' }, { status: 500 })
    }

    return NextResponse.json({ pet }, { status: 201 })
  } catch (error) {
    console.error('Error in pets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}