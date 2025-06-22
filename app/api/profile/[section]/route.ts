import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ProfileService } from '@/lib/services/profile'
import { UserService } from '@/lib/services/user'
import { profileSections, ProfileSectionKey } from '@/lib/profile-config'

interface RouteParams {
  params: {
    section: string
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const section = params.section as ProfileSectionKey
    
    if (!profileSections[section]) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate the data against the section schema
    try {
      await profileSections[section].validationSchema.validate(body, { abortEarly: false })
    } catch (validationError: any) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationError.errors 
      }, { status: 400 })
    }

    // Ensure profile exists
    let profile = await ProfileService.getProfileByUserId(user.id)
    if (!profile) {
      profile = await ProfileService.createProfile({ userId: user.id })
    }

    // Update the profile section
    await ProfileService.updateProfileSection(user.id, section, body)
    
    // Get updated profile data
    const updatedProfile = await ProfileService.getProfileByUserId(user.id, true)
    const completionPercentage = await ProfileService.getProfileCompletionPercentage(user.id)
    const nextSection = await ProfileService.getNextIncompleteSection(user.id)
    
    return NextResponse.json({
      profile: updatedProfile,
      completionPercentage,
      nextSection,
      success: true
    })
  } catch (error) {
    console.error(`Profile ${params.section} PUT error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserService.findByUid(session.user.uid)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const section = params.section as ProfileSectionKey
    
    if (!profileSections[section]) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const profile = await ProfileService.getProfileByUserId(user.id, true)
    
    if (!profile) {
      return NextResponse.json({ 
        sectionData: {},
        isEmpty: true
      })
    }

    // Extract section-specific data from the profile
    const sectionFields = profileSections[section].fields
    const sectionData: any = {}
    
    sectionFields.forEach(field => {
      sectionData[field] = (profile as any)[field]
    })

    return NextResponse.json({
      sectionData,
      isEmpty: false
    })
  } catch (error) {
    console.error(`Profile ${params.section} GET error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 