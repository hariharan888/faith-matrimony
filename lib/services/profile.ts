import { prisma } from '@/lib/prisma'
import { Profile, ProfileImage } from '@prisma/client'
import { ProfileSectionKey } from '@/lib/profile-config'

export interface CreateProfileData {
  userId: string
}

export interface UpdateProfileSectionData {
  [key: string]: unknown
}

export interface CreateProfileImageData {
  profileId: string
  data: string
  isPrimary?: boolean
  order?: number
}

export interface PhotoItem {
  data: string
  dimensions?: {
    width: number
    height: number
  }
}

export class ProfileService {
  
  /**
   * Create a new profile for a user
   */
  static async createProfile(data: CreateProfileData): Promise<Profile> {
    return await prisma.profile.create({
      data: {
        userId: data.userId,
      },
    })
  }

  /**
   * Get profile by user ID with images
   */
  static async getProfileByUserId(userId: string): Promise<Profile & { images: ProfileImage[] } | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { images: true },
    })

    return profile
  }

  /**
   * Update a profile section
   */
  static async updateProfileSection(
    userId: string, 
    section: ProfileSectionKey, 
    data: UpdateProfileSectionData
  ): Promise<Profile> {
    // Fields that are relations and should not be included in direct profile updates
    const RELATION_FIELDS = ['images', 'gallery']
    
    // Prepare profile update data
    const profileUpdateData: Record<string, unknown> = {}

    Object.entries(data).forEach(([key, value]) => {
      // Skip relation fields - they need special handling
      if (RELATION_FIELDS.includes(key)) {
        return
      }
      
      // All fields can now be updated directly
      profileUpdateData[key] = value
    })

    console.log('Profile update data:', JSON.stringify(profileUpdateData, null, 2))

    try {
      // Update all fields directly in profile
      const profile = await prisma.profile.update({
        where: { userId },
        data: profileUpdateData,
      })

      // Handle images section separately
      if (section === 'images' && data.gallery && Array.isArray(data.gallery)) {
        await this.updateProfileImages(profile.id, (data.gallery as PhotoItem[]).map((item, index) => ({
          profileId: profile.id,
          data: item.data,
          isPrimary: index === 0, // First image is always primary for now
          order: index,
        })))
      }

      return profile
    } catch (error) {
      console.error('Profile update error:', error)
      console.error('Update data that caused error:', profileUpdateData)
      throw error
    }
  }

  /**
   * Get profile completion percentage
   */
  static async getProfileCompletionPercentage(userId: string): Promise<number> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { images: true },
    })

    if (!profile) return 0

    const requiredFields = [
      'profileCreatedFor', 'name', 'gender', 'dateOfBirth', 'martialStatus', 'education', 'jobType', 
      'jobTitle', 'income', 'height', 'weight', 'complexion', 'mobileNumber',
      'nativePlace', 'motherTongue', 'fatherName', 'fatherOccupation',
      'motherName', 'motherOccupation', 'familyType', 'currentAddress', 'areYouSaved', 'areYouBaptized',
      'areYouAnointed', 'churchName', 'denomination', 'pastorName', 'pastorMobileNumber',
      'churchAddress', 'exMinAge', 'exMaxAge', 'exEducation', 'exJobType', 'exIncome',
      'exComplexion'
    ]

    let completedFields = 0
    requiredFields.forEach(field => {
      const value = (profile as Record<string, unknown>)[field]
      if (value !== null && value !== undefined && value !== '') {
        completedFields++
      }
    })

    // Check if at least one image exists
    const hasImages = profile.images.length > 0
    if (hasImages) completedFields++

    const totalFields = requiredFields.length + 1 // +1 for images
    return Math.round((completedFields / totalFields) * 100)
  }

  /**
   * Get next incomplete section
   */
  static async getNextIncompleteSection(userId: string): Promise<ProfileSectionKey | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { images: true },
    })

    if (!profile) return 'personal'

    const profileData = profile as Record<string, unknown>

    // Check personal section
    const personalFields = ['profileCreatedFor', 'name', 'gender', 'dateOfBirth', 'martialStatus', 'education', 'jobType', 'jobTitle', 'income', 'height', 'weight', 'complexion', 'mobileNumber', 'nativePlace', 'motherTongue']
    const personalComplete = personalFields.every(field => {
      const value = profileData[field]
      return value !== null && value !== undefined && value !== ''
    })
    
    if (!personalComplete) return 'personal'

    // Check family section
    const familyFields = ['fatherName', 'fatherOccupation', 'motherName', 'motherOccupation', 'familyType', 'currentAddress', 'youngerBrothers', 'youngerSisters', 'elderBrothers', 'elderSisters', 'youngerBrothersMarried', 'youngerSistersMarried', 'elderBrothersMarried', 'elderSistersMarried']
    const familyComplete = familyFields.every(field => {
      const value = profileData[field]
      return value !== null && value !== undefined && value !== ''
    })
    
    if (!familyComplete) return 'family'

    // Check spiritual section
    const spiritualFields = ['areYouSaved', 'areYouBaptized', 'areYouAnointed', 'churchName', 'denomination', 'pastorName', 'pastorMobileNumber', 'churchAddress']
    const spiritualComplete = spiritualFields.every(field => {
      const value = profileData[field]
      return value !== null && value !== undefined && value !== ''
    })
    
    if (!spiritualComplete) return 'spiritual'

    // Check preferences section
    const preferencesFields = ['exMinAge', 'exMaxAge', 'exEducation', 'exJobType', 'exIncome', 'exComplexion']
    const preferencesComplete = preferencesFields.every(field => {
      const value = profileData[field]
      return value !== null && value !== undefined && value !== ''
    })
    
    if (!preferencesComplete) return 'preferences'

    // Check images section
    if (profile.images.length === 0) return 'images'

    // Check payment section (always incomplete for now)
    return 'payment'
  }

  /**
   * Mark profile as ready for verification
   */
  static async markProfileReady(userId: string): Promise<Profile> {
    return await prisma.profile.update({
      where: { userId },
      data: { isReady: true },
    })
  }

  /**
   * Check if profile is complete
   */
  static async isProfileComplete(userId: string): Promise<boolean> {
    const nextSection = await this.getNextIncompleteSection(userId)
    return nextSection === null
  }

  /**
   * Profile Image Operations
   */
  static async createProfileImage(data: CreateProfileImageData): Promise<ProfileImage> {
    // If this is set as primary, unset other primary images
    if (data.isPrimary) {
      await prisma.profileImage.updateMany({
        where: { profileId: data.profileId },
        data: { isPrimary: false },
      })
    }

    return await prisma.profileImage.create({
      data,
    })
  }

  static async updateProfileImages(profileId: string, images: CreateProfileImageData[]): Promise<ProfileImage[]> {
    // Delete existing images
    await prisma.profileImage.deleteMany({
      where: { profileId },
    })

    // Create new images
    const createdImages = []
    for (const imageData of images) {
      const image = await prisma.profileImage.create({
        data: {
          profileId,
          data: imageData.data,
          isPrimary: imageData.isPrimary || false,
          order: imageData.order || 0,
        },
      })
      createdImages.push(image)
    }

    return createdImages
  }

  static async deleteProfileImage(id: string): Promise<void> {
    await prisma.profileImage.delete({
      where: { id },
    })
  }

  static async setPrimaryImage(profileId: string, imageId: string): Promise<ProfileImage> {
    // Unset all primary images for this profile
    await prisma.profileImage.updateMany({
      where: { profileId },
      data: { isPrimary: false },
    })

    // Set the selected image as primary
    return await prisma.profileImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    })
  }
} 