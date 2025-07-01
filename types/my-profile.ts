import { ProfileSectionKey } from '@/lib/profile-config'

// Core profile data structure
export interface ProfileFormData {
  profile: Record<string, unknown> | null
  completionPercentage: number
  nextSection: ProfileSectionKey | null
}

// Address structure used across forms
export interface AddressData {
  street: string
  city: string
  state: string
  pincode: string
}

// Primary details form specific types
export interface PrimaryDetailsFormData {
  profileCreatedFor: string
  name: string
  about?: string
  gender: string
  dateOfBirth: string
  martialStatus: string
  education: string
  jobType: string
  jobTitle: string
  income: string
  height: string
  weight: string
  complexion: string
  mobileNumber: string
  currentAddress: AddressData
  nativePlace: string
  motherTongue: string
}

// Family details form specific types
export interface FamilyDetailsFormData {
  fatherName: string
  fatherOccupation: string
  motherName: string
  motherOccupation: string
  familyType: string
  currentAddress: AddressData
  youngerBrothers: number
  youngerSisters: number
  elderBrothers: number
  elderSisters: number
  youngerBrothersMarried: number
  youngerSistersMarried: number
  elderBrothersMarried: number
  elderSistersMarried: number
}

// Spiritual details form specific types
export interface SpiritualDetailsFormData {
  areYouSaved: string
  areYouBaptized: string
  areYouAnointed: string
  churchName: string
  denomination: string
  pastorName: string
  pastorMobileNumber: string
  churchAddress: AddressData
}

// Partner preferences form specific types
export interface PartnerPreferencesFormData {
  exMinAge: number
  exMaxAge: number
  exEducation: string
  exJobType: string
  exIncome: string
  exComplexion: string
  exOtherDetails?: string
}

// Photo form specific types
export interface PhotoFormData {
  gallery: PhotoItem[]
  profilePictureIndex: number
}

export interface PhotoItem {
  data: string
  dimensions: {
    width: number
    height: number
  }
}

// Form submission handler type
export type FormSubmissionHandler<T = Record<string, unknown>> = (data: T) => Promise<void>

// Progress display props
export interface ProgressDisplayProps {
  completionPercentage: number
}

// Section navigation props
export interface SectionNavigationProps {
  sections: ProfileSectionKey[]
}

// Form container props
export interface FormContainerProps {
  className?: string
} 