'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { profileSections } from '@/lib/profile-config'
import { PhotoItem, FormSubmissionHandler } from '@/types/my-profile'
import Image from 'next/image'

interface PhotosFormProps {
  initialData?: Record<string, unknown>
  onSubmit: FormSubmissionHandler
  isSubmitting?: boolean
}

// File to base64 conversion with validation
function fileToBase64(
  file: File
): Promise<{ data: string; dimensions: { width: number; height: number } } | null> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'))
      return
    }

    // Convert to base64 directly without image validation first
    const reader = new FileReader()
    
    reader.onloadend = () => {
      const base64String = reader.result as string
      
      // Validate the base64 string
      if (!base64String || !base64String.startsWith('data:image/')) {
        reject(new Error('Invalid image format'))
        return
      }

      // Get image dimensions by creating a temporary image
      const image = new window.Image()
      image.onload = () => {
        const dimensions = { width: image.width, height: image.height }
        console.log('Image loaded successfully:', {
          width: dimensions.width,
          height: dimensions.height,
          dataLength: base64String.length,
          dataPreview: base64String.substring(0, 50) + '...'
        })
        resolve({ data: base64String, dimensions })
      }
      
      image.onerror = () => {
        reject(new Error('Failed to load image for dimension calculation'))
      }
      
      image.src = base64String
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to convert file to base64'))
    }
    
    reader.readAsDataURL(file)
  })
}

export function PhotosForm({ initialData, onSubmit, isSubmitting = false }: PhotosFormProps) {
  const [gallery, setGallery] = useState<PhotoItem[]>([])
  const [profilePictureIndex, setProfilePictureIndex] = useState<number>(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(profileSections.images.validationSchema),
    defaultValues: { gallery: [], profilePictureIndex: 0 }
  })

  useEffect(() => {
    if (initialData) {
      if (initialData.gallery && Array.isArray(initialData.gallery)) {
        setGallery(initialData.gallery as PhotoItem[])
      }
      if (typeof initialData.profilePictureIndex === 'number') {
        setProfilePictureIndex(initialData.profilePictureIndex)
      }
      reset(initialData)
    }
  }, [initialData, reset])

  // Update form data when gallery or profilePictureIndex changes
  useEffect(() => {
    setValue('gallery', gallery, { shouldValidate: true })
    setValue('profilePictureIndex', profilePictureIndex, { shouldValidate: true })
  }, [gallery, profilePictureIndex, setValue])

  const handleFileSelect = async (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 5 - gallery.length)
    console.log('Selected files:', newFiles.length, 'files')
    
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        continue
      }

      try {
        console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)
        const imageData = await fileToBase64(file)
        if (imageData) {
          console.log('Image data created successfully:', {
            dataLength: imageData.data.length,
            dimensions: imageData.dimensions,
            dataPreview: imageData.data.substring(0, 100) + '...'
          })
          setGallery(prev => {
            const newGallery = [...prev, imageData]
            console.log('Updated gallery:', newGallery.length, 'images')
            return newGallery
          })
        }
      } catch (error) {
        console.error('Error processing file:', file.name, error)
        alert(`Error processing file ${file.name}: ${error}`)
      }
    }
  }

  const handleRemovePhoto = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    setGallery(newGallery)
    
    // Adjust profile picture index
    if (profilePictureIndex >= index && profilePictureIndex > 0) {
      setProfilePictureIndex(profilePictureIndex - 1)
    } else if (profilePictureIndex === index && newGallery.length > 0) {
      setProfilePictureIndex(0)
    }
  }

  const handleSetProfilePicture = (index: number) => {
    setProfilePictureIndex(index)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return

    const newGallery = [...gallery]
    const draggedItem = newGallery[draggedIndex]
    
    // Remove dragged item
    newGallery.splice(draggedIndex, 1)
    
    // Insert at new position
    const finalDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newGallery.splice(finalDropIndex, 0, draggedItem)
    
    // Update profile picture index if needed
    if (profilePictureIndex === draggedIndex) {
      setProfilePictureIndex(finalDropIndex)
    } else if (profilePictureIndex > draggedIndex && profilePictureIndex <= dropIndex) {
      setProfilePictureIndex(profilePictureIndex - 1)
    } else if (profilePictureIndex < draggedIndex && profilePictureIndex >= dropIndex) {
      setProfilePictureIndex(profilePictureIndex + 1)
    }
    
    setGallery(newGallery)
    setDraggedIndex(null)
  }

  const onFormSubmit = async () => {
    try {
      console.log('Submitting photos form with gallery:', gallery)
      console.log('Profile picture index:', profilePictureIndex)
      
      // Validate that gallery has at least one image
      if (!gallery || gallery.length === 0) {
        throw new Error('At least one photo is required')
      }
      
      // Only send the gallery data - profilePictureIndex is handled separately in the backend
      const filteredData: Record<string, unknown> = {
        gallery: gallery
      }
      
      console.log('Filtered data for submission:', filteredData)
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
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Upload your photos (max 5 images, each under 5MB). Drag to reorder and select a primary photo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>Upload Photos (Max 5 images, each under 5MB)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                className="hidden"
                id="photo-upload"
                disabled={gallery.length >= 5}
              />
              <label
                htmlFor="photo-upload"
                className={`cursor-pointer ${gallery.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="space-y-2">
                  <div className="text-gray-500">
                    {gallery.length < 5 ? (
                      <>
                        <p>Click to upload or drag and drop images here</p>
                        <p className="text-sm">Maximum 5 images, each under 5MB</p>
                      </>
                    ) : (
                      <p>Maximum 5 images uploaded</p>
                    )}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Gallery Display */}
          {gallery.length > 0 && (
            <div className="space-y-4">
              <Label>Photo Gallery (Drag to reorder)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((photo, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative group border-2 rounded-lg overflow-hidden ${
                      profilePictureIndex === index ? 'border-blue-500' : 'border-gray-200'
                    } cursor-move`}
                  >
                    <div className="relative w-full h-48">
                      <Image
                        src={photo.data}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover"
                        width={100}
                        height={100}
                      />
                      
                      {/* Overlay controls - only visible on hover */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSetProfilePicture(index)}
                              className={`bg-blue-600 hover:bg-blue-700 ${
                                profilePictureIndex === index ? 'bg-green-600 hover:bg-green-700' : ''
                              }`}
                            >
                              {profilePictureIndex === index ? 'Primary' : 'Set Primary'}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemovePhoto(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Primary photo indicator */}
                    {profilePictureIndex === index && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary Photo
                      </div>
                    )}
                    
                    {/* Drag indicator */}
                    <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      Drag to reorder
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                Drag photos to reorder them. Click &quot;Set Primary&quot; to choose your main profile photo.
              </p>
            </div>
          )}

          {errors.gallery && (
            <p className="text-sm text-red-600">{String(errors.gallery.message)}</p>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting || gallery.length === 0}
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