import { prisma } from './prisma'
import { CareType, CareLog } from '@prisma/client'

export async function getPetCareStatus(petId: string) {
  const now = new Date()
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const recentLogs = await prisma.careLog.findMany({
    where: {
      petId,
      at: { gte: yearAgo } // Get logs from past year
    },
    orderBy: { at: 'desc' }
  })

  const todayLogs = recentLogs.filter(log => log.at >= today)
  const weekLogs = recentLogs.filter(log => log.at >= weekAgo)
  const monthLogs = recentLogs.filter(log => log.at >= monthAgo)
  const yearLogs = recentLogs.filter(log => log.at >= yearAgo)

  let mood = 3 // Base mood
  
  const todayFeed = todayLogs.filter(log => log.type === 'FEED').length
  const todayWater = todayLogs.filter(log => log.type === 'WATER').length
  const todayPlay = todayLogs.filter(log => log.type === 'PLAY').length
  
  if (todayFeed === 0) mood -= 2
  else if (todayFeed === 1) mood -= 1
  else if (todayFeed >= 2) mood += 1
  
  if (todayWater === 0) mood -= 1
  if (todayPlay === 0) mood -= 1
  else if (todayPlay >= 2) mood += 1

  mood = Math.max(1, Math.min(5, mood))

  return {
    currentMood: mood,
    todayLogs,
    weekLogs,
    monthLogs,
    yearLogs,
    recentLogs
  }
}

export function analyzeCareNeeds(careStatus: any) {
  const { todayLogs, weekLogs, monthLogs, yearLogs } = careStatus
  
  const todayCount = (type: CareType) => todayLogs.filter((log: CareLog) => log.type === type).length
  const weekCount = (type: CareType) => weekLogs.filter((log: CareLog) => log.type === type).length
  const monthCount = (type: CareType) => monthLogs.filter((log: CareLog) => log.type === type).length
  const yearCount = (type: CareType) => yearLogs.filter((log: CareLog) => log.type === type).length

  const counts = {
    FEED: todayCount('FEED'),
    WATER: todayCount('WATER'),
    TREAT: todayCount('TREAT'),
    PLAY: todayCount('PLAY'),
    LITTER: todayCount('LITTER'),
    
    NAILS: weekCount('NAILS'),      // Per week
    BRUSH: Math.floor(monthCount('BRUSH') / 2), // Every 2 weeks
    VACCINE: yearCount('VACCINE'),  // Per year
  }

  const needs = {
    // Daily needs
    FEED: counts.FEED < 2,
    WATER: counts.WATER < 1,
    PLAY: counts.PLAY < 1,
    LITTER: counts.LITTER < 1,
    
    // Periodic needs
    NAILS: counts.NAILS === 0,      // Need nails if none this week
    BRUSH: monthCount('BRUSH') === 0, // Need brush if none this month
    VACCINE: counts.VACCINE === 0,  // Need vaccine if none this year
    
    // Treats are optional
    TREAT: false
  }

  return { counts, needs }
}
export async function performCareActivity(petId: string, careType: CareType, amountG?: number, note?: string) {
  const now = new Date()
  
  const careLog = await prisma.careLog.create({
    data: {
      petId,
      type: careType,
      at: now,
      amountG: amountG || null,
      note: note || null
    }
  })

  let moodChange = 0
  switch (careType) {
    case CareType.BRUSH:
      moodChange = 0.5  
      break
    case CareType.FEED:
      moodChange = 0.2  
      break
    case CareType.TREAT:
      moodChange = 1    
      break
    case CareType.PLAY:
      moodChange = 1    
      break
  }

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