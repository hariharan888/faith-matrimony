'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { profileSections, fieldSelectOptions } from '@/lib/profile-config'

interface SpiritualDetailsFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
}

export function SpiritualDetailsForm({ initialData, onSubmit, isSubmitting = false }: SpiritualDetailsFormProps) {
  const [churchAddress, setChurchAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(profileSections.spiritual.validationSchema),
    defaultValues: initialData || {}
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.churchAddress) {
        setChurchAddress(initialData.churchAddress)
      }
    }
  }, [initialData, reset])

  const handleAddressChange = (field: string, value: string) => {
    const newAddress = { ...churchAddress, [field]: value }
    setChurchAddress(newAddress)
    setValue('churchAddress', newAddress)
  }

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit({ ...data, churchAddress })
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spiritual Details</CardTitle>
        <CardDescription>
          Tell us about your spiritual journey and church background
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Spiritual Status - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="areYouSaved">Are You Saved? *</Label>
              <Select
                {...register('areYouSaved')}
                options={fieldSelectOptions.areYouSaved}
                placeholder="Select"
              />
              {errors.areYouSaved?.message && (
                <p className="text-sm text-red-600">{String(errors.areYouSaved.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areYouBaptized">Are You Baptized? *</Label>
              <Select
                {...register('areYouBaptized')}
                options={fieldSelectOptions.areYouBaptized}
                placeholder="Select"
              />
              {errors.areYouBaptized?.message && (
                <p className="text-sm text-red-600">{String(errors.areYouBaptized.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areYouAnointed">Are You Anointed? *</Label>
              <Select
                {...register('areYouAnointed')}
                options={fieldSelectOptions.areYouAnointed}
                placeholder="Select"
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
                <Label htmlFor="churchStreet">Street</Label>
                <Input
                  id="churchStreet"
                  value={churchAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Church street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchCity">City</Label>
                <Input
                  id="churchCity"
                  value={churchAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="Church city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churchState">State</Label>
                <select
                  id="churchState"
                  value={churchAddress.state}
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
                <Label htmlFor="churchPincode">Pincode</Label>
                <Input
                  id="churchPincode"
                  value={churchAddress.pincode}
                  onChange={(e) => handleAddressChange('pincode', e.target.value)}
                  placeholder="Church pincode"
                />
              </div>
            </div>
            {errors.churchAddress?.message && (
              <p className="text-sm text-red-600">{String(errors.churchAddress.message)}</p>
            )}
          </div>

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