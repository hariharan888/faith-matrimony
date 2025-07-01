'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PROFILE_SECTIONS_ORDER, ProfileSectionKey, profileSections } from '@/lib/profile-config'
import { PrimaryDetailsForm } from './profile-forms/primary-details-form'
import { FamilyDetailsForm } from './profile-forms/family-details-form'
import { SpiritualDetailsForm } from './profile-forms/spiritual-details-form'
import { PartnerPreferencesForm } from './profile-forms/partner-preferences-form'
import { PhotosForm } from './profile-forms/photos-form'

interface ProfileFormContainerProps {
  initialData?: Record<string, unknown> | null
  completionPercentage: number
  isNewProfile: boolean
  onSectionSubmit: (section: ProfileSectionKey, data: Record<string, unknown>) => Promise<void>
  onNavigateBack?: () => void
}

export function ProfileFormContainer({
  initialData,
  completionPercentage,
  isNewProfile,
  onSectionSubmit,
  onNavigateBack
}: ProfileFormContainerProps) {
  const [currentSection, setCurrentSection] = useState<ProfileSectionKey>('personal')
  const [submittingSection, setSubmittingSection] = useState<string | null>(null)
  const [sectionCompleted, setSectionCompleted] = useState<Record<string, boolean>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    // Initialize section completion status based on initial data
    if (initialData) {
      const completed: Record<string, boolean> = {}
      PROFILE_SECTIONS_ORDER.forEach(section => {
        const sectionFields = profileSections[section].fields
        const isComplete = sectionFields.every((field: string) => {
          const value = initialData[field]
          return value !== null && value !== undefined && value !== ''
        })
        completed[section] = isComplete
      })
      setSectionCompleted(completed)
    }
  }, [initialData])

  const handleSectionSubmit = async (section: ProfileSectionKey, data: Record<string, unknown>) => {
    setSubmittingSection(section)
    try {
      console.log('Submitting section:', section)
      await onSectionSubmit(section, data)
      setSectionCompleted(prev => ({ ...prev, [section]: true }))
      setHasUnsavedChanges(false)
      
      // Show success toast
      console.log('Showing success toast for:', section)
      toast.success(`${profileSections[section].title} saved successfully!`)
      
      // Only move to next section if submission was successful
      if (isNewProfile) {
        const currentIndex = PROFILE_SECTIONS_ORDER.indexOf(section)
        const nextSection = PROFILE_SECTIONS_ORDER[currentIndex + 1]
        if (nextSection) {
          setCurrentSection(nextSection)
        }
      }
    } catch (error) {
      console.error('Section submission error:', error)
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to save section'
      console.log('Showing error toast for:', section)
      toast.error(`Failed to save ${profileSections[section].title}: ${errorMessage}`)
      // Don't update section completion or move to next section on error
      // The error will be handled by the form component
    } finally {
      setSubmittingSection(null)
    }
  }

  const canNavigateToSection = (section: ProfileSectionKey) => {
    if (!isNewProfile) return true // Update mode allows free navigation
    
    const sectionIndex = PROFILE_SECTIONS_ORDER.indexOf(section)
    const currentIndex = PROFILE_SECTIONS_ORDER.indexOf(currentSection)
    
    // Can navigate to completed sections or current section
    return sectionIndex <= currentIndex || sectionCompleted[section]
  }

  const handleSectionNavigation = (section: ProfileSectionKey) => {
    if (!canNavigateToSection(section)) return
    
    // In new profile mode, warn about unsaved changes
    if (isNewProfile && hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave this section?')
      if (!confirmed) return
    }
    
    setCurrentSection(section)
    setHasUnsavedChanges(false)
  }

  const renderCurrentForm = () => {
    const commonProps = {
      initialData: initialData || undefined,
      isSubmitting: submittingSection === currentSection,
      onSubmit: (data: Record<string, unknown>) => handleSectionSubmit(currentSection, data)
    }

    switch (currentSection) {
      case 'personal':
        return <PrimaryDetailsForm {...commonProps} />
      case 'family':
        return <FamilyDetailsForm {...commonProps} />
      case 'spiritual':
        return <SpiritualDetailsForm {...commonProps} />
      case 'preferences':
        return <PartnerPreferencesForm {...commonProps} />
      case 'images':
        return <PhotosForm {...commonProps} />
      case 'payment':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Payment form coming soon...</p>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('Test toast clicked')
                      toast.success('Test success toast!')
                    }}
                  >
                    Test Toast
                  </Button>
                  {!isNewProfile && onNavigateBack && (
                    <Button variant="outline" size="sm" onClick={onNavigateBack}>
                      Back to Dashboard
                    </Button>
                  )}
                </div>
              </div>
              
              {isNewProfile && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Complete all sections step by step. You cannot access other parts of the application until your profile is complete.
                  </p>
                </div>
              )}
            </div>

            {/* Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profile Completion</span>
                    <span className="text-sm text-gray-600">{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Section Navigation */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Sections</h3>
                <div className="space-y-2">
                  {PROFILE_SECTIONS_ORDER.map((section, index) => {
                    const isActive = section === currentSection
                    const isComplete = sectionCompleted[section]
                    const canNavigate = canNavigateToSection(section)
                    
                    return (
                      <button
                        key={section}
                        onClick={() => handleSectionNavigation(section)}
                        disabled={!canNavigate}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                          ${isActive 
                            ? 'bg-blue-100 text-blue-900 border border-blue-300 cursor-pointer' 
                            : isComplete 
                              ? 'bg-green-50 text-green-800 hover:bg-green-100 cursor-pointer' 
                              : canNavigate 
                                ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                                : 'text-gray-400 cursor-not-allowed'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {index + 1}. {profileSections[section].title}
                          </span>
                          {isComplete && <span className="text-green-600">✓</span>}
                          {isActive && <span className="text-blue-600">→</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderCurrentForm()}
          </div>
        </div>
      </div>
    </div>
  )
} 