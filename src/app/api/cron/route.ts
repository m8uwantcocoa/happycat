import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json(
      { success: true, message: 'Database pinged successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Ping error:', error)
    return NextResponse.json(
      { error: 'Failed to ping database' },
      { status: 500 }
    )
  }
}