import { prisma } from './prisma'
import { CareType, CareLog } from '@prisma/client'

// Care requirements using your existing enum values
export const CARE_REQUIREMENTS = {
  [CareType.FEED]: { intervalHours: 6, maxPerDay: 2 },
  [CareType.WATER]: { intervalHours: 24, maxPerDay: 1 },
  [CareType.NAILS]: { intervalDays: 7, maxPerDay: 1 },
  [CareType.LITTER]: { intervalHours: 8, maxPerDay: 1 },
  [CareType.BRUSH]: { intervalDays: 2, maxPerDay: 1 },
  [CareType.VACCINE]: { intervalDays: 365, maxPerDay: 1 },
  [CareType.TREAT]: { maxPerDay: 5 },
  [CareType.PLAY]: { maxPerDay: 2, minPerDay: 1 }
}

// Get pet's recent care logs to determine what they need
export async function getPetCareStatus(petId: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get recent care logs
  const recentLogs = await prisma.careLog.findMany({
    where: {
      petId,
      at: { gte: weekAgo }
    },
    orderBy: { at: 'desc' }
  })

  // Get today's logs for daily counters
  const todayLogs = recentLogs.filter((log: CareLog) => 
    log.at >= today
  )

  // Get latest mood log
  const latestMood = await prisma.moodLog.findFirst({
    where: { petId },
    orderBy: { date: 'desc' }
  })

  return {
    recentLogs,
    todayLogs,
    currentMood: latestMood?.score || 3 // default mood 3/5
  }
}

// Check what care the pet needs right now
export function analyzeCareNeeds(careStatus: any) {
  const now = new Date()
  const { recentLogs, todayLogs } = careStatus
  
  const needs: Partial<Record<CareType, boolean>> = {}
  const counts: Partial<Record<CareType, number>> = {}

  // Count today's activities - using actual enum values
  const careTypes = Object.values(CareType)
  
  careTypes.forEach((careType: CareType) => {
    counts[careType] = todayLogs.filter((log: CareLog) => log.type === careType).length
  })

  // Check feeding (every 6 hours, max 2 per day)
  const lastFeed = recentLogs.find((log: CareLog) => log.type === CareType.FEED)
  const hoursSinceLastFeed = lastFeed 
    ? (now.getTime() - lastFeed.at.getTime()) / (1000 * 60 * 60)
    : 999

  needs[CareType.FEED] = hoursSinceLastFeed >= 6 && (counts[CareType.FEED] || 0) < 2

  // Check water (daily)
  needs[CareType.WATER] = (counts[CareType.WATER] || 0) < 1

  // Check litter (can be done multiple times per day)
  const lastLitter = recentLogs.find((log: CareLog) => log.type === CareType.LITTER)
  const hoursSinceLastLitter = lastLitter
    ? (now.getTime() - lastLitter.at.getTime()) / (1000 * 60 * 60)
    : 999
  
  needs[CareType.LITTER] = hoursSinceLastLitter >= 8

  // Check nails (weekly)
  const lastNails = recentLogs.find((log: CareLog) => log.type === CareType.NAILS)
  const daysSinceLastNails = lastNails
    ? (now.getTime() - lastNails.at.getTime()) / (1000 * 60 * 60 * 24)
    : 999

  needs[CareType.NAILS] = daysSinceLastNails >= 7

  // Check brushing (every 2 days)
  const lastBrush = recentLogs.find((log: CareLog) => log.type === CareType.BRUSH)
  const daysSinceLastBrush = lastBrush
    ? (now.getTime() - lastBrush.at.getTime()) / (1000 * 60 * 60 * 24)
    : 999

  needs[CareType.BRUSH] = daysSinceLastBrush >= 2

  // Check vaccine (yearly)
  const lastVaccine = recentLogs.find((log: CareLog) => log.type === CareType.VACCINE)
  const daysSinceLastVaccine = lastVaccine
    ? (now.getTime() - lastVaccine.at.getTime()) / (1000 * 60 * 60 * 24)
    : 999

  needs[CareType.VACCINE] = daysSinceLastVaccine >= 365

  // Check treats (max 5 per day)
  needs[CareType.TREAT] = (counts[CareType.TREAT] || 0) < 5

  // Check play (1-2 times per day)
  needs[CareType.PLAY] = (counts[CareType.PLAY] || 0) < 2

  return { needs, counts }
}

// Perform care activity using your existing CareLog model
export async function performCareActivity(petId: string, careType: CareType, amountG?: number, note?: string) {
  const now = new Date()
  
  // 1. Log the care activity
  const careLog = await prisma.careLog.create({
    data: {
      petId,
      type: careType,
      at: now,
      amountG: amountG || null,
      note: note || null
    }
  })

  // 2. Update mood based on care type
  let moodChange = 0
  switch (careType) {
    case CareType.BRUSH:
      moodChange = 0.5  // +0.5 mood for brushing
      break
    case CareType.FEED:
      moodChange = 0.2  // Small mood boost for feeding
      break
    case CareType.TREAT:
      moodChange = 1    // +1 mood for treats
      break
    case CareType.PLAY:
      moodChange = 1    // +1 mood for play
      break
  }

  // 3. Update or create today's mood log
  if (moodChange > 0) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const existingMood = await prisma.moodLog.findUnique({
      where: {
        petId_date: {
          petId,
          date: today
        }
      }
    })

    if (existingMood) {
      await prisma.moodLog.update({
        where: { id: existingMood.id },
        data: {
          score: Math.min(5, existingMood.score + moodChange)
        }
      })
    } else {
      await prisma.moodLog.create({
        data: {
          petId,
          date: today,
          score: Math.min(5, 3 + moodChange), // Start from neutral mood 3
          note: `Care activity: ${careType}`
        }
      })
    }
  }

  return careLog
}