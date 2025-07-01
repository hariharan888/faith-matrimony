import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile'
import { UserService } from '@/lib/services/user'
import { profileSections, ProfileSectionKey } from '@/lib/profile-config'

interface RouteParams {
  params: Promise<{
    section: string
  }>
}

// Ensure all responses are JSON
function jsonResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { 
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { section } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404)
    }

    const sectionKey = section as ProfileSectionKey
    
    if (!profileSections[sectionKey]) {
      return jsonResponse({ error: 'Invalid section' }, 400)
    }

    const body = await request.json()
    
    // Validate the data against the section schema
    try {
      await profileSections[sectionKey].validationSchema.validate(body, { abortEarly: false })
    } catch (validationError: unknown) {
      const error = validationError as { errors?: string[] }
      return jsonResponse({ 
        error: 'Validation failed', 
        details: error.errors || [] 
      }, 400)
    }

    // Ensure profile exists
    const profile = await ProfileService.getProfileByUserId(user.id)
    if (!profile) {
      await ProfileService.createProfile({ userId: user.id })
    }

    // Update the profile section
    await ProfileService.updateProfileSection(user.id, sectionKey, body)
    
    // Get updated profile data
    const updatedProfile = await ProfileService.getProfileByUserId(user.id)
    const completionPercentage = await ProfileService.getProfileCompletionPercentage(user.id)
    const nextSection = await ProfileService.getNextIncompleteSection(user.id)
    
    return jsonResponse({
      profile: updatedProfile,
      completionPercentage,
      nextSection,
      success: true
    })
  } catch (error) {
    const { section } = await params
    console.error(`Profile ${section} PUT error:`, error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { section } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404)
    }

    const sectionKey = section as ProfileSectionKey
    
    if (!profileSections[sectionKey]) {
      return jsonResponse({ error: 'Invalid section' }, 400)
    }

    const profile = await ProfileService.getProfileByUserId(user.id)
    
    if (!profile) {
      return jsonResponse({ 
        sectionData: {},
        isEmpty: true
      })
    }

    // Extract section-specific data from the profile
    const sectionFields = profileSections[sectionKey].fields
    const sectionData: Record<string, unknown> = {}
    
    sectionFields.forEach(field => {
      sectionData[field] = (profile as Record<string, unknown>)[field]
    })

    return jsonResponse({
      sectionData,
      isEmpty: false
    })
  } catch (error) {
    const { section } = await params
    console.error(`Profile ${section} GET error:`, error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
} 