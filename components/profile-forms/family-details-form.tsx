'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'

interface FamilyDetailsFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
}

export function FamilyDetailsForm({ initialData, onSubmit, isSubmitting = false }: FamilyDetailsFormProps) {
  const [currentAddress, setCurrentAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(profileSections.family.validationSchema),
    defaultValues: initialData || {}
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.currentAddress) {
        setCurrentAddress(initialData.currentAddress)
      }
    }
  }, [initialData, reset])

  const handleAddressChange = (field: string, value: string) => {
    const newAddress = { ...currentAddress, [field]: value }
    setCurrentAddress(newAddress)
    setValue('currentAddress', newAddress)
  }

  // Watch sibling counts to validate married counts
  const youngerBrothers = watch('youngerBrothers') || 0
  const youngerSisters = watch('youngerSisters') || 0
  const elderBrothers = watch('elderBrothers') || 0
  const elderSisters = watch('elderSisters') || 0

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit({ ...data, currentAddress })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Details</CardTitle>
        <CardDescription>
          Family background information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Father Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                {...register('fatherName')}
                placeholder="Enter father's name"
              />
              {errors.fatherName && (
                <p className="text-sm text-red-600">{errors.fatherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherOccupation">Father's Occupation *</Label>
              <Select
                {...register('fatherOccupation')}
                options={fieldSelectOptions.fatherOccupation}
                placeholder="Select father's occupation"
              />
              {errors.fatherOccupation && (
                <p className="text-sm text-red-600">{errors.fatherOccupation.message}</p>
              )}
            </div>
          </div>

          {/* Mother Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother's Name *</Label>
              <Input
                id="motherName"
                {...register('motherName')}
                placeholder="Enter mother's name"
              />
              {errors.motherName && (
                <p className="text-sm text-red-600">{errors.motherName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherOccupation">Mother's Occupation *</Label>
              <Select
                {...register('motherOccupation')}
                options={fieldSelectOptions.motherOccupation}
                placeholder="Select mother's occupation"
              />
              {errors.motherOccupation && (
                <p className="text-sm text-red-600">{errors.motherOccupation.message}</p>
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
            {errors.familyType && (
              <p className="text-sm text-red-600">{errors.familyType.message}</p>
            )}
          </div>

          {/* Current Address */}
          <div className="space-y-4">
            <Label>Current Address *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={currentAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={currentAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={currentAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select State</option>
                  {fieldSelectOptions.state.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={currentAddress.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Pincode"
                />
              </div>
            </div>
            {errors.currentAddress?.message && (
              <p className="text-sm text-red-600">{String(errors.currentAddress.message)}</p>
            )}
          </div>

          {/* Siblings Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Siblings Information</h3>
            
            {/* Total Siblings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youngerBrothers">Younger Brothers *</Label>
                <Input
                  id="youngerBrothers"
                  type="number"
                  min="0"
                  max="20"
                  {...register('youngerBrothers', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerBrothers && (
                  <p className="text-sm text-red-600">{errors.youngerBrothers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youngerSisters">Younger Sisters *</Label>
                <Input
                  id="youngerSisters"
                  type="number"
                  min="0"
                  max="20"
                  {...register('youngerSisters', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerSisters && (
                  <p className="text-sm text-red-600">{errors.youngerSisters.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderBrothers">Elder Brothers *</Label>
                <Input
                  id="elderBrothers"
                  type="number"
                  min="0"
                  max="20"
                  {...register('elderBrothers', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderBrothers && (
                  <p className="text-sm text-red-600">{errors.elderBrothers.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderSisters">Elder Sisters *</Label>
                <Input
                  id="elderSisters"
                  type="number"
                  min="0"
                  max="20"
                  {...register('elderSisters', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderSisters && (
                  <p className="text-sm text-red-600">{errors.elderSisters.message}</p>
                )}
              </div>
            </div>

            {/* Married Siblings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youngerBrothersMarried">Younger Brothers Married *</Label>
                <Input
                  id="youngerBrothersMarried"
                  type="number"
                  min="0"
                  max={youngerBrothers}
                  {...register('youngerBrothersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerBrothersMarried && (
                  <p className="text-sm text-red-600">{errors.youngerBrothersMarried.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="youngerSistersMarried">Younger Sisters Married *</Label>
                <Input
                  id="youngerSistersMarried"
                  type="number"
                  min="0"
                  max={youngerSisters}
                  {...register('youngerSistersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.youngerSistersMarried && (
                  <p className="text-sm text-red-600">{errors.youngerSistersMarried.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderBrothersMarried">Elder Brothers Married *</Label>
                <Input
                  id="elderBrothersMarried"
                  type="number"
                  min="0"
                  max={elderBrothers}
                  {...register('elderBrothersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderBrothersMarried && (
                  <p className="text-sm text-red-600">{errors.elderBrothersMarried.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="elderSistersMarried">Elder Sisters Married *</Label>
                <Input
                  id="elderSistersMarried"
                  type="number"
                  min="0"
                  max={elderSisters}
                  {...register('elderSistersMarried', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.elderSistersMarried && (
                  <p className="text-sm text-red-600">{errors.elderSistersMarried.message}</p>
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