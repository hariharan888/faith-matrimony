import { prisma } from '@/lib/prisma'
import { Profile, ProfileImage, FieldUpdate } from '@prisma/client'
import { ProfileSectionKey, TEXT_FIELDS_REQUIRING_VERIFICATION } from '@/lib/profile-config'

export interface CreateProfileData {
  userId: string
}

export interface UpdateProfileSectionData {
  [key: string]: any
}

export interface CreateFieldUpdateData {
  userId: string
  fieldName: string
  fieldValue: string
}

export interface CreateProfileImageData {
  profileId: string
  data: string
  isPrimary?: boolean
  order?: number
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
  static async getProfileByUserId(userId: string, includeUnverifiedUpdates = false): Promise<Profile & { images: ProfileImage[] } | null> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { images: true },
    })

    if (!profile) return null

    // If requesting own profile, merge unverified field updates
    if (includeUnverifiedUpdates) {
      const fieldUpdates = await prisma.fieldUpdate.findMany({
        where: { 
          userId,
          isApproved: false 
        },
      })

      // Merge field updates into profile data
      const updatedProfile = { ...profile }
      fieldUpdates.forEach(update => {
        if (TEXT_FIELDS_REQUIRING_VERIFICATION.includes(update.fieldName)) {
          (updatedProfile as any)[update.fieldName] = update.fieldValue
        }
      })

      return updatedProfile
    }

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
    // Separate text fields that require verification from regular fields
    const regularFields: any = {}
    const textFields: any = {}

    Object.entries(data).forEach(([key, value]) => {
      if (TEXT_FIELDS_REQUIRING_VERIFICATION.includes(key)) {
        textFields[key] = value
      } else {
        regularFields[key] = value
      }
    })

    // Update regular fields directly in profile
    let profile = await prisma.profile.update({
      where: { userId },
      data: regularFields,
    })

    // Handle text fields that require verification
    for (const [fieldName, fieldValue] of Object.entries(textFields)) {
      await this.createOrUpdateFieldUpdate(userId, fieldName, String(fieldValue))
    }

    return profile
  }

  /**
   * Create or update a field update
   */
  static async createOrUpdateFieldUpdate(
    userId: string, 
    fieldName: string, 
    fieldValue: string
  ): Promise<FieldUpdate> {
    const existingUpdate = await prisma.fieldUpdate.findFirst({
      where: { 
        userId,
        fieldName,
        isApproved: false 
      },
    })

    if (existingUpdate) {
      return await prisma.fieldUpdate.update({
        where: { id: existingUpdate.id },
        data: { fieldValue },
      })
    } else {
      return await prisma.fieldUpdate.create({
        data: {
          userId,
          fieldName,
          fieldValue,
        },
      })
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
      'currentAddress', 'nativePlace', 'motherTongue', 'fatherName', 'fatherOccupation',
      'motherName', 'motherOccupation', 'familyType', 'areYouSaved', 'areYouBaptized',
      'areYouAnointed', 'churchName', 'denomination', 'pastorName', 'pastorMobileNumber',
      'churchAddress', 'exMinAge', 'exMaxAge', 'exEducation', 'exJobType', 'exIncome',
      'exComplexion'
    ]

    let completedFields = 0
    requiredFields.forEach(field => {
      if ((profile as any)[field]) {
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

    // Check personal section
    const personalFields = ['profileCreatedFor', 'name', 'gender', 'dateOfBirth', 'martialStatus', 'education', 'jobType', 'jobTitle', 'income', 'height', 'weight', 'complexion', 'mobileNumber', 'currentAddress', 'nativePlace', 'motherTongue']
    const personalComplete = personalFields.every(field => (profile as any)[field])
    if (!personalComplete) return 'personal'

    // Check family section
    const familyFields = ['fatherName', 'fatherOccupation', 'motherName', 'motherOccupation', 'familyType', 'youngerBrothers', 'youngerSisters', 'elderBrothers', 'elderSisters', 'youngerBrothersMarried', 'youngerSistersMarried', 'elderBrothersMarried', 'elderSistersMarried']
    const familyComplete = familyFields.every(field => (profile as any)[field] !== null && (profile as any)[field] !== undefined)
    if (!familyComplete) return 'family'

    // Check spiritual section
    const spiritualFields = ['areYouSaved', 'areYouBaptized', 'areYouAnointed', 'churchName', 'denomination', 'pastorName', 'pastorMobileNumber', 'churchAddress']
    const spiritualComplete = spiritualFields.every(field => (profile as any)[field])
    if (!spiritualComplete) return 'spiritual'

    // Check preferences section
    const preferencesFields = ['exMinAge', 'exMaxAge', 'exEducation', 'exJobType', 'exIncome', 'exComplexion']
    const preferencesComplete = preferencesFields.every(field => (profile as any)[field])
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

  /**
   * Admin operations for field updates
   */
  static async approveFieldUpdate(updateId: string): Promise<void> {
    const fieldUpdate = await prisma.fieldUpdate.findUnique({
      where: { id: updateId },
    })

    if (!fieldUpdate) {
      throw new Error('Field update not found')
    }

    // Update the profile with the approved value
    await prisma.profile.update({
      where: { userId: fieldUpdate.userId },
      data: {
        [fieldUpdate.fieldName]: fieldUpdate.fieldValue,
      },
    })

    // Mark the field update as approved
    await prisma.fieldUpdate.update({
      where: { id: updateId },
      data: { isApproved: true },
    })
  }

  static async rejectFieldUpdate(updateId: string): Promise<void> {
    await prisma.fieldUpdate.delete({
      where: { id: updateId },
    })
  }

  static async getPendingFieldUpdates(): Promise<FieldUpdate[]> {
    return await prisma.fieldUpdate.findMany({
      where: { isApproved: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
} 