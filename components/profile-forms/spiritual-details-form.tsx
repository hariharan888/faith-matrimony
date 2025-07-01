'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'
import { AddressData, FormSubmissionHandler } from '@/types/my-profile'

interface SpiritualDetailsFormProps {
  initialData?: Record<string, unknown>
  onSubmit: FormSubmissionHandler
  isSubmitting?: boolean
}

export function SpiritualDetailsForm({ initialData, onSubmit, isSubmitting = false }: SpiritualDetailsFormProps) {
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

  // Initialize churchAddress from initialData or empty
  const initialAddress = useMemo((): AddressData => {
    if (sanitizeInitialData?.churchAddress && typeof sanitizeInitialData.churchAddress === 'object') {
      const addr = sanitizeInitialData.churchAddress as AddressData
      return {
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || ''
      }
    }
    return {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  }, [sanitizeInitialData])

  const [churchAddress, setChurchAddress] = useState<AddressData>(initialAddress)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(profileSections.spiritual.validationSchema)
  })

  // Update form when initialData changes
  useEffect(() => {
    if (sanitizeInitialData && Object.keys(sanitizeInitialData).length > 0) {
      const newAddress = initialAddress
      setChurchAddress(newAddress)
      
      const formData = {
        ...sanitizeInitialData,
        churchAddress: newAddress
      }
      
      reset(formData)
    }
  }, [sanitizeInitialData, initialAddress, reset])

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...churchAddress, [field]: value }
    setChurchAddress(newAddress)
    
    // Update the form value for validation
    setValue('churchAddress', newAddress, { shouldValidate: true })
  }

  const onFormSubmit = async (data: Record<string, unknown>) => {
    try {
      // Only send the spiritual section fields
      const spiritualFields = profileSections.spiritual.fields
      const filteredData: Record<string, unknown> = {}
      spiritualFields.forEach(field => {
        if (field === 'churchAddress') {
          filteredData[field] = churchAddress
        } else if (data[field] !== undefined) {
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
        <CardTitle>Spiritual Details</CardTitle>
        <CardDescription>
          Information about your spiritual background and church details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Spiritual Status - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="areYouSaved">Are you Saved? *</Label>
              <Select
                {...register('areYouSaved')}
                options={fieldSelectOptions.areYouSaved}
                placeholder="Select yes or no"
              />
              {errors.areYouSaved?.message && (
                <p className="text-sm text-red-600">{String(errors.areYouSaved.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areYouBaptized">Are you Baptized? *</Label>
              <Select
                {...register('areYouBaptized')}
                options={fieldSelectOptions.areYouBaptized}
                placeholder="Select yes or no"
              />
              {errors.areYouBaptized?.message && (
                <p className="text-sm text-red-600">{String(errors.areYouBaptized.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areYouAnointed">Are you Anointed? *</Label>
              <Select
                {...register('areYouAnointed')}
                options={fieldSelectOptions.areYouAnointed}
                placeholder="Select yes or no"
              />
              {errors.areYouAnointed?.message && (
                <p className="text-sm text-red-600">{String(errors.areYouAnointed.message)}</p>
              )}
            </div>
          </div>

          {/* Church Details - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="churchName">Church Name *</Label>
              <Input
                id="churchName"
                {...register('churchName')}
                placeholder="Enter church name"
              />
              {errors.churchName?.message && (
                <p className="text-sm text-red-600">{String(errors.churchName.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="denomination">Denomination *</Label>
              <Select
                {...register('denomination')}
                options={fieldSelectOptions.denomination}
                placeholder="Select denomination"
              />
              {errors.denomination?.message && (
                <p className="text-sm text-red-600">{String(errors.denomination.message)}</p>
              )}
            </div>
          </div>

          {/* Pastor Details - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pastorName">Pastor Name *</Label>
              <Input
                id="pastorName"
                {...register('pastorName')}
                placeholder="Enter pastor's name"
              />
              {errors.pastorName?.message && (
                <p className="text-sm text-red-600">{String(errors.pastorName.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pastorMobileNumber">Pastor Mobile Number *</Label>
              <Input
                id="pastorMobileNumber"
                {...register('pastorMobileNumber')}
                placeholder="Enter pastor's mobile number"
              />
              {errors.pastorMobileNumber?.message && (
                <p className="text-sm text-red-600">{String(errors.pastorMobileNumber.message)}</p>
              )}
            </div>
          </div>

          {/* Church Address */}
          <div className="space-y-4">
            <Label>Church Address *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="churchStreet">Street *</Label>
                <Input
                  id="churchStreet"
                  value={churchAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchCity">City *</Label>
                <Input
                  id="churchCity"
                  value={churchAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchState">State *</Label>
                <Select
                  value={churchAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  options={fieldSelectOptions.state}
                  placeholder="Select State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchPincode">Pincode *</Label>
                <Input
                  id="churchPincode"
                  value={churchAddress.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
            </div>
            {errors.churchAddress && (
              <p className="text-sm text-red-600">
                Please fill all church address fields
              </p>
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