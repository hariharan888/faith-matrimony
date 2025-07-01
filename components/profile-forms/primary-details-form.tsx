'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, Textarea } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'
import { FormSubmissionHandler } from '@/types/my-profile'

interface PrimaryDetailsFormProps {
  initialData?: Record<string, unknown>
  onSubmit: FormSubmissionHandler
  isSubmitting?: boolean
}

export function PrimaryDetailsForm({ initialData, onSubmit, isSubmitting = false }: PrimaryDetailsFormProps) {
  // Function to sanitize initial data by converting null values to appropriate defaults
  const sanitizeInitialData = useMemo(() => {
    if (!initialData) return {}
    
    const sanitized: Record<string, unknown> = {}
    const personalFields = profileSections.personal.fields
    
    Object.entries(initialData).forEach(([key, value]) => {
      // Only include fields that belong to the personal section
      if (personalFields.includes(key)) {
        if (value === null) {
          sanitized[key] = '' // String fields default to empty string
        } else {
          sanitized[key] = value
        }
      }
    })
    
    return sanitized
  }, [initialData])

  // Utility function to format date for HTML date input
  const formatDateForInput = (dateValue: unknown): string => {
    if (!dateValue) return ''
    
    let date: Date
    if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue)
    } else {
      return ''
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return ''
    
    // Format as YYYY-MM-DD for HTML date input
    return date.toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSections.personal.validationSchema),
    mode: 'onChange'
  })

  // Update form when initialData changes
  useEffect(() => {
    if (sanitizeInitialData && Object.keys(sanitizeInitialData).length > 0) {
      const formData = {
        ...sanitizeInitialData,
        dateOfBirth: formatDateForInput(sanitizeInitialData.dateOfBirth)
      }
      
      reset(formData)
    }
  }, [sanitizeInitialData, reset])

  const onFormSubmit = async (data: Record<string, unknown>) => {
    try {
      // Only send the personal section fields
      const personalFields = profileSections.personal.fields
      const filteredData: Record<string, unknown> = {}
      
      personalFields.forEach(field => {
        if (data[field] !== undefined) {
          filteredData[field] = data[field]
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
        <CardTitle>Primary Details</CardTitle>
        <CardDescription>
          Basic information about the person
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Profile Created For & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="profileCreatedFor">Profile Created For *</Label>
              <Select
                {...register('profileCreatedFor')}
                options={fieldSelectOptions.profileCreatedFor}
                placeholder="Select who this profile is for"
              />
              {errors.profileCreatedFor?.message && (
                <p className="text-sm text-red-600">{String(errors.profileCreatedFor.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter full name"
              />
              {errors.name?.message && (
                <p className="text-sm text-red-600">{String(errors.name.message)}</p>
              )}
            </div>
          </div>

          {/* About - Separate row */}
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea
              id="about"
              {...register('about')}
              placeholder="Tell about the person, family background and views"
              rows={4}
            />
            {errors.about?.message && (
              <p className="text-sm text-red-600">{String(errors.about.message)}</p>
            )}
          </div>

          {/* Basic Info - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                {...register('gender')}
                options={fieldSelectOptions.gender}
                placeholder="Select gender"
              />
              {errors.gender?.message && (
                <p className="text-sm text-red-600">{String(errors.gender.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth?.message && (
                <p className="text-sm text-red-600">{String(errors.dateOfBirth.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="martialStatus">Marital Status *</Label>
              <Select
                {...register('martialStatus')}
                options={fieldSelectOptions.martialStatus}
                placeholder="Select marital status"
              />
              {errors.martialStatus?.message && (
                <p className="text-sm text-red-600">{String(errors.martialStatus.message)}</p>
              )}
            </div>
          </div>

          {/* Education & Career - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="education">Education *</Label>
              <Select
                {...register('education')}
                options={fieldSelectOptions.education}
                placeholder="Select education level"
              />
              {errors.education?.message && (
                <p className="text-sm text-red-600">{String(errors.education.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select
                {...register('jobType')}
                options={fieldSelectOptions.jobType}
                placeholder="Select job type"
              />
              {errors.jobType?.message && (
                <p className="text-sm text-red-600">{String(errors.jobType.message)}</p>
              )}
            </div>
          </div>

          {/* Job Title & Income - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
                placeholder="Enter job title or designation"
              />
              {errors.jobTitle?.message && (
                <p className="text-sm text-red-600">{String(errors.jobTitle.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="income">Annual Income *</Label>
              <Select
                {...register('income')}
                options={fieldSelectOptions.income}
                placeholder="Select income range"
              />
              {errors.income?.message && (
                <p className="text-sm text-red-600">{String(errors.income.message)}</p>
              )}
            </div>
          </div>

          {/* Physical Attributes - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="height">Height *</Label>
              <Select
                {...register('height')}
                options={fieldSelectOptions.height}
                placeholder="Select height"
              />
              {errors.height?.message && (
                <p className="text-sm text-red-600">{String(errors.height.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight *</Label>
              <Select
                {...register('weight')}
                options={fieldSelectOptions.weight}
                placeholder="Select weight range"
              />
              {errors.weight?.message && (
                <p className="text-sm text-red-600">{String(errors.weight.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexion">Complexion *</Label>
              <Select
                {...register('complexion')}
                options={fieldSelectOptions.complexion}
                placeholder="Select complexion"
              />
              {errors.complexion?.message && (
                <p className="text-sm text-red-600">{String(errors.complexion.message)}</p>
              )}
            </div>
          </div>

          {/* Contact & Location - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                {...register('mobileNumber')}
                placeholder="Enter mobile number"
              />
              {errors.mobileNumber?.message && (
                <p className="text-sm text-red-600">{String(errors.mobileNumber.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nativePlace">Native Place *</Label>
              <Input
                id="nativePlace"
                {...register('nativePlace')}
                placeholder="Enter native place"
              />
              {errors.nativePlace?.message && (
                <p className="text-sm text-red-600">{String(errors.nativePlace.message)}</p>
              )}
            </div>
          </div>

          {/* Mother Tongue */}
          <div className="space-y-2">
            <Label htmlFor="motherTongue">Mother Tongue *</Label>
            <Select
              {...register('motherTongue')}
              options={fieldSelectOptions.motherTongue}
              placeholder="Select mother tongue"
            />
            {errors.motherTongue?.message && (
              <p className="text-sm text-red-600">{String(errors.motherTongue.message)}</p>
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