'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { GuestPet, GuestCareLog } from '@/types/guestpet'
import { Sex, CareType } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'happycat_guest'

interface GuestContextType {
  pets: GuestPet[]
  careLogs: GuestCareLog[]
  isLoaded: boolean
  addCareLog: (petId: string, careType: CareType, note?: string) => void
  createPet: (petData: any) => GuestPet
  updatePet: (id: string, updates: Partial<GuestPet>) => void
  clearAllData: () => void
}

const GuestContext = createContext<GuestContextType | null>(null)

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<GuestPet[]>([])
  const [careLogs, setCareLogs] = useState<GuestCareLog[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const { pets: storedPets, careLogs: storedLogs } = JSON.parse(stored)
        setPets(storedPets.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          birthdate: p.birthdate ? new Date(p.birthdate) : null,
        })))
        setCareLogs(storedLogs.map((log: any) => ({
          ...log,
          at: new Date(log.at),
        })))
      } catch (e) { console.error(e) }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pets, careLogs }))
    }
  }, [pets, careLogs, isLoaded])

  const addCareLog = (petId: string, careType: CareType, note?: string) => {
    const newLog: GuestCareLog = {
      id: uuidv4(),
      petId,
      type: careType,
      at: new Date(),
      note: note || "Logged via Guest Mode",
    }
    setCareLogs(prev => [...prev, newLog])
  }

  const createPet = (petData: any) => {
    const now = new Date()
    const newPet: GuestPet = {
      id: uuidv4(),
      ...petData,
      sex: petData.sex || Sex.UNKNOWN,
      neutered: petData.neutered || false,
      createdAt: now,
      updatedAt: now,
    }
    setPets(prev => [...prev, newPet])
    return newPet
  }

  const updatePet = (id: string, updates: Partial<GuestPet>) => {
    setPets(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
  }

  const clearAllData = () => {
    setPets([])
    setCareLogs([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(() => ({
    pets, careLogs, isLoaded, addCareLog, createPet, updatePet, clearAllData
  }), [pets, careLogs, isLoaded])

  return <GuestContext.Provider value={value}>{children}</GuestContext.Provider>
}

export const useGuestStore = () => {
  const context = useContext(GuestContext)
  if (!context) throw new Error('useGuestStore must be used within GuestProvider')
  return context
}