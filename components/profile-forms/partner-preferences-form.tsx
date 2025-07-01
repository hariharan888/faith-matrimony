'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, Textarea } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'
import { FormSubmissionHandler } from '@/types/my-profile'

interface PartnerPreferencesFormProps {
  initialData?: Record<string, unknown>
  onSubmit: FormSubmissionHandler
  isSubmitting?: boolean
}

export function PartnerPreferencesForm({ initialData, onSubmit, isSubmitting = false }: PartnerPreferencesFormProps) {
  // Function to sanitize initial data by converting null values to appropriate defaults
  const sanitizeInitialData = useMemo(() => {
    if (!initialData) return {}
    
    const sanitized: Record<string, unknown> = {}
    
    Object.entries(initialData).forEach(([key, value]) => {
      if (value === null) {
        sanitized[key] = '' // String fields default to empty string
      } else {
        sanitized[key] = value
      }
    })
    
    return sanitized
  }, [initialData])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSections.preferences.validationSchema)
  })

  // Update form when initialData changes
  useEffect(() => {
    if (sanitizeInitialData && Object.keys(sanitizeInitialData).length > 0) {
      reset(sanitizeInitialData)
    }
  }, [sanitizeInitialData, reset])

  const onFormSubmit = async (data: Record<string, unknown>) => {
    try {
      // Only send the preferences section fields
      const preferencesFields = profileSections.preferences.fields
      const filteredData: Record<string, unknown> = {}
      preferencesFields.forEach(field => {
        if (data[field] !== undefined) {
          // Convert age fields to integers
          if (field === 'exMinAge' || field === 'exMaxAge') {
            filteredData[field] = parseInt(data[field] as string, 10)
          } else {
            filteredData[field] = data[field]
          }
        }
      })
      await onSubmit(filteredData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Error will be handled by the parent component with toast
      throw error
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Preferences</CardTitle>
        <CardDescription>
          Share your preferences for your life partner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Age Preferences - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="exMinAge">Minimum Age *</Label>
              <Select
                {...register('exMinAge')}
                options={fieldSelectOptions.exMinAge}
                placeholder="Select minimum age"
              />
              {errors.exMinAge?.message && (
                <p className="text-sm text-red-600">{String(errors.exMinAge.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exMaxAge">Maximum Age *</Label>
              <Select
                {...register('exMaxAge')}
                options={fieldSelectOptions.exMaxAge}
                placeholder="Select maximum age"
              />
              {errors.exMaxAge?.message && (
                <p className="text-sm text-red-600">{String(errors.exMaxAge.message)}</p>
              )}
            </div>
          </div>

          {/* Education & Job Preferences - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="exEducation">Education Preference *</Label>
              <Select
                {...register('exEducation')}
                options={fieldSelectOptions.exEducation}
                placeholder="Select education preference"
              />
              {errors.exEducation?.message && (
                <p className="text-sm text-red-600">{String(errors.exEducation.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exJobType">Job Type Preference *</Label>
              <Select
                {...register('exJobType')}
                options={fieldSelectOptions.exJobType}
                placeholder="Select job type preference"
              />
              {errors.exJobType?.message && (
                <p className="text-sm text-red-600">{String(errors.exJobType.message)}</p>
              )}
            </div>
          </div>

          {/* Income & Complexion Preferences - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="exIncome">Income Preference *</Label>
              <Select
                {...register('exIncome')}
                options={fieldSelectOptions.exIncome}
                placeholder="Select income preference"
              />
              {errors.exIncome?.message && (
                <p className="text-sm text-red-600">{String(errors.exIncome.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exComplexion">Complexion Preference *</Label>
              <Select
                {...register('exComplexion')}
                options={fieldSelectOptions.exComplexion}
                placeholder="Select complexion preference"
              />
              {errors.exComplexion?.message && (
                <p className="text-sm text-red-600">{String(errors.exComplexion.message)}</p>
              )}
            </div>
          </div>

          {/* Other Details - Separate row */}
          <div className="space-y-2">
            <Label htmlFor="exOtherDetails">Additional Details</Label>
            <Textarea
              id="exOtherDetails"
              {...register('exOtherDetails')}
              placeholder="Share any other preferences or requirements for your life partner"
              rows={4}
            />
            {errors.exOtherDetails?.message && (
              <p className="text-sm text-red-600">{String(errors.exOtherDetails.message)}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 