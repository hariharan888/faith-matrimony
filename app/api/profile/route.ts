import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile'
import { UserService } from '@/lib/services/user'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await ProfileService.getProfileByUserId(user.id, true) // Include unverified updates for own profile
    
    return NextResponse.json({
      profile,
      completionPercentage: profile ? await ProfileService.getProfileCompletionPercentage(user.id) : 0,
      nextSection: await ProfileService.getNextIncompleteSection(user.id),
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile already exists
    const existingProfile = await ProfileService.getProfileByUserId(user.id)
    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    const profile = await ProfileService.createProfile({ userId: user.id })
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 