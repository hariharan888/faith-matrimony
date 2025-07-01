'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { ProfileSectionKey } from '@/lib/profile-config'

// Types for the profile form context
export interface ProfileData {
  profile: Record<string, unknown> | null
  completionPercentage: number
  nextSection: ProfileSectionKey | null
}

export interface MyProfileFormContextValue {
  // State
  profileData: ProfileData | null
  loading: boolean
  isNewProfile: boolean
  currentSection: ProfileSectionKey
  submittingSection: string | null
  sectionCompleted: Record<string, boolean>
  hasUnsavedChanges: boolean

  // Actions
  setProfileData: (data: ProfileData | null) => void
  setLoading: (loading: boolean) => void
  setIsNewProfile: (isNew: boolean) => void
  setCurrentSection: (section: ProfileSectionKey) => void
  setSubmittingSection: (section: string | null) => void
  setSectionCompleted: (completed: Record<string, boolean>) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Form submission handler
  handleSectionSubmit: (section: ProfileSectionKey, data: Record<string, unknown>) => Promise<void>
  
  // Navigation
  canNavigateToSection: (section: ProfileSectionKey) => boolean
  handleSectionNavigation: (section: ProfileSectionKey) => void
  handleNavigateBack: () => void
}

const MyProfileFormContext = createContext<MyProfileFormContextValue | null>(null)

export interface MyProfileFormProviderProps {
  children: ReactNode
  onSectionSubmit: (section: ProfileSectionKey, data: Record<string, unknown>) => Promise<void>
  onNavigateBack?: () => void
  initialData?: ProfileData | null
  isNewProfile?: boolean
}

export function MyProfileFormProvider({ 
  children, 
  onSectionSubmit,
  onNavigateBack,
  initialData = null,
  isNewProfile = false
}: MyProfileFormProviderProps) {
  // State management
  const [profileData, setProfileData] = useState<ProfileData | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [isNewProfileState, setIsNewProfile] = useState(isNewProfile)
  const [currentSection, setCurrentSection] = useState<ProfileSectionKey>('personal')
  const [submittingSection, setSubmittingSection] = useState<string | null>(null)
  const [sectionCompleted, setSectionCompleted] = useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Function to determine which sections are completed based on profile data
  const determineSectionCompletion = useCallback((data: ProfileData | null) => {
    if (!data?.profile) return {}
    
    const profile = data.profile
    const completed: Record<string, boolean> = {}
    
    // Check personal section
    const personalFields = ['profileCreatedFor', 'name', 'gender', 'dateOfBirth', 'martialStatus', 'education', 'jobType', 'jobTitle', 'income', 'height', 'weight', 'complexion', 'mobileNumber', 'nativePlace', 'motherTongue']
    completed.personal = personalFields.every(field => profile[field])
    
    // Check family section
    const familyFields = ['fatherName', 'fatherOccupation', 'motherName', 'motherOccupation', 'familyType', 'currentAddress', 'youngerBrothers', 'youngerSisters', 'elderBrothers', 'elderSisters', 'youngerBrothersMarried', 'youngerSistersMarried', 'elderBrothersMarried', 'elderSistersMarried']
    completed.family = familyFields.every(field => profile[field] !== null && profile[field] !== undefined)
    
    // Check spiritual section
    const spiritualFields = ['areYouSaved', 'areYouBaptized', 'areYouAnointed', 'churchName', 'denomination', 'pastorName', 'pastorMobileNumber', 'churchAddress']
    completed.spiritual = spiritualFields.every(field => profile[field])
    
    // Check preferences section
    const preferencesFields = ['exMinAge', 'exMaxAge', 'exEducation', 'exJobType', 'exIncome', 'exComplexion']
    completed.preferences = preferencesFields.every(field => profile[field])
    
    // Check images section - assume completed if profile has any images
    completed.images = false // Will be updated when we have images data
    
    // Payment section is always incomplete for now
    completed.payment = false
    
    return completed
  }, [])

  // Auto-select the next incomplete section on initial load
  useEffect(() => {
    if (initialData) {
      const completionStates = determineSectionCompletion(initialData)
      setSectionCompleted(completionStates)
      
      // Auto-select the next incomplete section if we have nextSection from server
      if (initialData.nextSection) {
        console.log('Setting current section from API nextSection:', initialData.nextSection)
        setCurrentSection(initialData.nextSection)
      } else {
        // Fallback: find first incomplete section
        const sections: ProfileSectionKey[] = ['personal', 'family', 'spiritual', 'preferences', 'images', 'payment']
        const firstIncompleteSection = sections.find(section => !completionStates[section])
        console.log('Fallback: Setting current section to first incomplete:', firstIncompleteSection)
        if (firstIncompleteSection) {
          setCurrentSection(firstIncompleteSection)
        }
      }
      
      console.log('Section completion states:', completionStates)
      console.log('Next section from API:', initialData.nextSection)
    }
  }, [initialData, determineSectionCompletion])

  // Form submission handler
  const handleSectionSubmit = useCallback(async (section: ProfileSectionKey, data: Record<string, unknown>) => {
    setSubmittingSection(section)
    try {
      await onSectionSubmit(section, data)
      setSectionCompleted(prev => ({ ...prev, [section]: true }))
      setHasUnsavedChanges(false)
      
      // Auto-navigate to next section in new profile mode
      if (isNewProfileState) {
        const sections: ProfileSectionKey[] = ['personal', 'family', 'spiritual', 'preferences', 'images', 'payment']
        const currentIndex = sections.indexOf(section)
        const nextSection = sections[currentIndex + 1]
        if (nextSection) {
          setCurrentSection(nextSection)
        }
      }
    } catch (error) {
      console.error('Section submission error:', error)
      throw error
    } finally {
      setSubmittingSection(null)
    }
  }, [onSectionSubmit, isNewProfileState])

  // Navigation helpers
  const canNavigateToSection = useCallback((section: ProfileSectionKey) => {
    if (!isNewProfileState) return true // Update mode allows free navigation
    
    const sections: ProfileSectionKey[] = ['personal', 'family', 'spiritual', 'preferences', 'images', 'payment']
    const sectionIndex = sections.indexOf(section)
    
    // Can navigate to:
    // 1. All completed sections
    // 2. The first uncompleted section
    if (sectionCompleted[section]) {
      return true // Completed sections are always accessible
    }
    
    // Find the first uncompleted section
    const firstUncompletedIndex = sections.findIndex(s => !sectionCompleted[s])
    return sectionIndex === firstUncompletedIndex
  }, [isNewProfileState, sectionCompleted])

  const handleSectionNavigation = useCallback((section: ProfileSectionKey) => {
    if (!canNavigateToSection(section)) return
    
    // In new profile mode, warn about unsaved changes
    if (isNewProfileState && hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this section?')
      if (!confirmed) return
    }
    
    setCurrentSection(section)
    setHasUnsavedChanges(false)
  }, [canNavigateToSection, isNewProfileState, hasUnsavedChanges])

  const handleNavigateBack = useCallback(() => {
    if (onNavigateBack) {
      onNavigateBack()
    }
  }, [onNavigateBack])

  // Update profileData when it changes
  useEffect(() => {
    if (profileData) {
      const completionStates = determineSectionCompletion(profileData)
      setSectionCompleted(completionStates)
    }
  }, [profileData, determineSectionCompletion])

  const contextValue: MyProfileFormContextValue = {
    // State
    profileData,
    loading,
    isNewProfile: isNewProfileState,
    currentSection,
    submittingSection,
    sectionCompleted,
    hasUnsavedChanges,

    // Setters
    setProfileData,
    setLoading,
    setIsNewProfile,
    setCurrentSection,
    setSubmittingSection,
    setSectionCompleted,
    setHasUnsavedChanges,

    // Actions
    handleSectionSubmit,
    canNavigateToSection,
    handleSectionNavigation,
    handleNavigateBack,
  }

  return (
    <MyProfileFormContext.Provider value={contextValue}>
      {children}
    </MyProfileFormContext.Provider>
  )
}

// Custom hook to use the profile form context
export function useMyProfileForm() {
  const context = useContext(MyProfileFormContext)
  if (!context) {
    throw new Error('useMyProfileForm must be used within a MyProfileFormProvider')
  }
  return context
} 