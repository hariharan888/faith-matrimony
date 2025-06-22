'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, Textarea } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'

interface PartnerPreferencesFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
}

export function PartnerPreferencesForm({ initialData, onSubmit, isSubmitting = false }: PartnerPreferencesFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSections.preferences.validationSchema),
    defaultValues: initialData || {}
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
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
              <Input
                id="exMinAge"
                type="number"
                min="18"
                max="80"
                {...register('exMinAge', { valueAsNumber: true })}
                placeholder="Enter minimum age"
              />
              {errors.exMinAge?.message && (
                <p className="text-sm text-red-600">{String(errors.exMinAge.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exMaxAge">Maximum Age *</Label>
              <Input
                id="exMaxAge"
                type="number"
                min="18"
                max="80"
                {...register('exMaxAge', { valueAsNumber: true })}
                placeholder="Enter maximum age"
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
              <Input
                id="exEducation"
                {...register('exEducation')}
                placeholder="Enter education preference"
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