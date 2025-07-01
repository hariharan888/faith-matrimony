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

interface FamilyDetailsFormProps {
  initialData?: Record<string, unknown>
  onSubmit: FormSubmissionHandler
  isSubmitting?: boolean
}

export function FamilyDetailsForm({ initialData, onSubmit, isSubmitting = false }: FamilyDetailsFormProps) {
  // Function to sanitize initial data by converting null values to appropriate defaults
  const sanitizeInitialData = useMemo(() => {
    if (!initialData) return {}
    
    const sanitized: Record<string, unknown> = {}
    
    Object.entries(initialData).forEach(([key, value]) => {
      if (value === null) {
        // Convert null values to appropriate defaults
        if (key.includes('Brothers') || key.includes('Sisters')) {
          sanitized[key] = 0 // Number fields default to 0
        } else {
          sanitized[key] = '' // String fields default to empty string
        }
      } else {
        sanitized[key] = value
      }
    })
    
    return sanitized
  }, [initialData])

  // Initialize currentAddress from initialData or empty
  const initialAddress = useMemo((): AddressData => {
    if (sanitizeInitialData?.currentAddress && typeof sanitizeInitialData.currentAddress === 'object') {
      const addr = sanitizeInitialData.currentAddress as AddressData
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

  const [currentAddress, setCurrentAddress] = useState<AddressData>(initialAddress)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSections.family.validationSchema)
  })

  useEffect(() => {
    if (sanitizeInitialData && Object.keys(sanitizeInitialData).length > 0) {
      const newAddress = initialAddress
      setCurrentAddress(newAddress)
      
      // Only reset if we have meaningful data
      const formData = {
        ...sanitizeInitialData,
        currentAddress: newAddress
      }
      
      reset(formData)
    }
  }, [sanitizeInitialData, initialAddress, reset])

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    const newAddress = { ...currentAddress, [field]: value }
    setCurrentAddress(newAddress)
  }

  const onFormSubmit = async (data: Record<string, unknown>) => {
    try {
      // Only send the family section fields
      const familyFields = profileSections.family.fields
      const filteredData: Record<string, unknown> = {}
      familyFields.forEach(field => {
        if (data[field] !== undefined) {
          // Convert integer fields to integers
          if (field.includes('Brothers') || field.includes('Sisters')) {
            filteredData[field] = parseInt(data[field] as string, 10) || 0
          } else {
            filteredData[field] = data[field]
          }
        }
      })
      filteredData.currentAddress = currentAddress
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
        <CardTitle>Family Details</CardTitle>
        <CardDescription>
          Information about your family background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Parent Details - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father&apos;s Name *</Label>
              <Input
                id="fatherName"
                {...register('fatherName')}
                placeholder="Enter father's name"
              />
              {errors.fatherName?.message && (
                <p className="text-sm text-red-600">{String(errors.fatherName.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherOccupation">Father&apos;s Occupation *</Label>
              <Input
                id="fatherOccupation"
                {...register('fatherOccupation')}
                placeholder="Enter father's occupation"
              />
              {errors.fatherOccupation?.message && (
                <p className="text-sm text-red-600">{String(errors.fatherOccupation.message)}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother&apos;s Name *</Label>
              <Input
                id="motherName"
                {...register('motherName')}
                placeholder="Enter mother's name"
              />
              {errors.motherName?.message && (
                <p className="text-sm text-red-600">{String(errors.motherName.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherOccupation">Mother&apos;s Occupation *</Label>
              <Input
                id="motherOccupation"
                {...register('motherOccupation')}
                placeholder="Enter mother's occupation"
              />
              {errors.motherOccupation?.message && (
                <p className="text-sm text-red-600">{String(errors.motherOccupation.message)}</p>
              )}
            </div>
          </div>

          {/* Family Type */}
          <div className="space-y-2">
            <Label htmlFor="familyType">Family Type *</Label>
            <Select
              {...register('familyType')}
              options={fieldSelectOptions.familyType}
              placeholder="Select family type"
            />
            {errors.familyType?.message && (
              <p className="text-sm text-red-600">{String(errors.familyType.message)}</p>
            )}
          </div>

          {/* Current Address */}
          <div className="space-y-4">
            <Label>Current Address *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street *</Label>
                <Input
                  id="street"
                  value={currentAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={currentAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={currentAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  options={fieldSelectOptions.state}
                  placeholder="Select State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={currentAddress.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
            </div>
            {errors.currentAddress && (
              <p className="text-sm text-red-600">
                Please fill all address fields
              </p>
            )}
          </div>

          {/* Sibling Details - 4 columns */}
          <div className="space-y-4">
            <Label>Sibling Details</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youngerBrothers">Younger Brothers</Label>
                <Input
                  id="youngerBrothers"
                  type="number"
                  min="0"
                  {...register('youngerBrothers', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerBrothers?.message && (
                  <p className="text-sm text-red-600">{String(errors.youngerBrothers.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youngerSisters">Younger Sisters</Label>
                <Input
                  id="youngerSisters"
                  type="number"
                  min="0"
                  {...register('youngerSisters', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerSisters?.message && (
                  <p className="text-sm text-red-600">{String(errors.youngerSisters.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderBrothers">Elder Brothers</Label>
                <Input
                  id="elderBrothers"
                  type="number"
                  min="0"
                  {...register('elderBrothers', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderBrothers?.message && (
                  <p className="text-sm text-red-600">{String(errors.elderBrothers.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderSisters">Elder Sisters</Label>
                <Input
                  id="elderSisters"
                  type="number"
                  min="0"
                  {...register('elderSisters', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderSisters?.message && (
                  <p className="text-sm text-red-600">{String(errors.elderSisters.message)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Married Sibling Details - 4 columns */}
          <div className="space-y-4">
            <Label>Married Sibling Details</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youngerBrothersMarried">Younger Brothers Married</Label>
                <Input
                  id="youngerBrothersMarried"
                  type="number"
                  min="0"
                  {...register('youngerBrothersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerBrothersMarried?.message && (
                  <p className="text-sm text-red-600">{String(errors.youngerBrothersMarried.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youngerSistersMarried">Younger Sisters Married</Label>
                <Input
                  id="youngerSistersMarried"
                  type="number"
                  min="0"
                  {...register('youngerSistersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerSistersMarried?.message && (
                  <p className="text-sm text-red-600">{String(errors.youngerSistersMarried.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderBrothersMarried">Elder Brothers Married</Label>
                <Input
                  id="elderBrothersMarried"
                  type="number"
                  min="0"
                  {...register('elderBrothersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderBrothersMarried?.message && (
                  <p className="text-sm text-red-600">{String(errors.elderBrothersMarried.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderSistersMarried">Elder Sisters Married</Label>
                <Input
                  id="elderSistersMarried"
                  type="number"
                  min="0"
                  {...register('elderSistersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderSistersMarried?.message && (
                  <p className="text-sm text-red-600">{String(errors.elderSistersMarried.message)}</p>
                )}
              </div>
            </div>
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