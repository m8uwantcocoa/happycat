import { Species, Sex, CareType } from '@prisma/client'

export interface GuestPet {
  id: string
  name: string
  species: Species
  breed?: string | null
  sex: Sex
  birthdate?: Date | null
  weightKg?: number | null
  neutered: boolean
  feedingFrequency?: number | null
  feedingTime?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface GuestCareLog {
  id: string
  petId: string
  type: CareType
  at: Date
  note?: string
}

export interface CreateGuestPetData {
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