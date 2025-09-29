import { Species, Sex } from '@prisma/client'

export interface Pet {
  id: string
  userId: string
  name: string
  species: Species
  breed?: string | null
  sex: Sex
  birthdate?: Date | null
  weightKg?: number | null
  neutered: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePetData {
  name: string
  species: Species
  breed?: string
  sex?: Sex
  birthdate?: Date
  weightKg?: number
  neutered?: boolean
  feedingFrequency?: number
  feedingTime?: number
}