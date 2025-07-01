import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile'
import { UserService } from '@/lib/services/user'

// Ensure all responses are JSON
function jsonResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { 
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404)
    }

    const profile = await ProfileService.getProfileByUserId(user.id)
    
    return jsonResponse({
      profile,
      completionPercentage: profile ? await ProfileService.getProfileCompletionPercentage(user.id) : 0,
      nextSection: await ProfileService.getNextIncompleteSection(user.id),
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404)
    }

    // Check if profile already exists
    const existingProfile = await ProfileService.getProfileByUserId(user.id)
    if (existingProfile) {
      return jsonResponse({ error: 'Profile already exists' }, 400)
    }

    const profile = await ProfileService.createProfile({ userId: user.id })
    
    return jsonResponse({ profile })
  } catch (error) {
    console.error('Profile POST error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
} 