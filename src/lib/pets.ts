import { prisma } from '@/lib/prisma'
import type { Pet, CreatePetData } from '@/types/pet'
import { Species, Sex } from '@prisma/client'

// Hjälpfunktion för att fixa decimal-problemet på en enskild katt
function normalizePet(pet: any): Pet {
  return {
    ...pet,
    weightKg: pet.weightKg ? pet.weightKg.toNumber() : null
  }
}

async function ensureUserProfile(userId: string) {
  try {
    let profile = await prisma.profile.findUnique({
      where: { id: userId }
    })
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: userId,
        }
      })
    }
    
    return profile
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return null
  }
}

export async function getUserPets(userId: string): Promise<Pet[]> {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // HÄR ÄR FIXEN: Vi mappar över alla katter och gör om Decimal -> Number
    return pets.map(pet => normalizePet(pet))

  } catch (error) {
    console.error('Error fetching user pets:', error)
    return []
  }
}

export async function createPet(userId: string, petData: CreatePetData): Promise<Pet | null> {
  try {
    const profile = await ensureUserProfile(userId)
    if (!profile) {
      throw new Error('Failed to create user profile')
    }
    
    const pet = await prisma.pet.create({
      data: {
        ...petData,
        userId: userId
      }
    })

    return normalizePet(pet)

  } catch (error) {
    console.error('Error creating pet:', error)
    return null
  }
}

export async function getUserPetCount(userId: string): Promise<number> {
  try {
    const count = await prisma.pet.count({
      where: {
        userId: userId
      }
    })
    return count
  } catch (error) {
    console.error('Error counting user pets:', error)
    return 0
  }
}

export function formatSpeciesName(species: Species): string {
  return species.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}