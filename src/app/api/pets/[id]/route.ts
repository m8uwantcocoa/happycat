import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // 2. Context type definition
) {
  try {
    const params = await context.params
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await prisma.pet.count({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (count === 0) {
      return NextResponse.json({ error: 'Pet not found or unauthorized' }, { status: 404 })
    }

    await prisma.pet.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting pet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}