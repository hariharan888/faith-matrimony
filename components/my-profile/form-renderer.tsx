'use client'

import { Card, CardContent } from '@/components/ui/card'
import { PrimaryDetailsForm } from '@/components/profile-forms/primary-details-form'
import { FamilyDetailsForm } from '@/components/profile-forms/family-details-form'
import { SpiritualDetailsForm } from '@/components/profile-forms/spiritual-details-form'
import { PartnerPreferencesForm } from '@/components/profile-forms/partner-preferences-form'
import { PhotosForm } from '@/components/profile-forms/photos-form'
import { useMyProfileForm } from '@/components/providers/my-profile-form-provider'

export function FormRenderer() {
  const { 
    currentSection, 
    profileData, 
    submittingSection, 
    handleSectionSubmit 
  } = useMyProfileForm()

  const isSubmitting = submittingSection === currentSection
  const initialData = profileData?.profile || undefined

  const commonProps = {
    initialData,
    isSubmitting,
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