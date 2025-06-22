'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { profileSections } from '@/lib/profile-config'

interface PhotosFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isSubmitting?: boolean
}

// File to base64 conversion with validation
function fileToBase64(
  file: File
): Promise<{ data: string; dimensions: { width: number; height: number } } | null> {
  return new Promise((resolve, reject) => {
    // First validate if it's an image
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      const dimensions = { width: image.width, height: image.height }

      // Image is valid, now convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        URL.revokeObjectURL(objectUrl) // Clean up
        resolve({ data: reader.result as string, dimensions })
      }
      reader.onerror = () => {
        URL.revokeObjectURL(objectUrl) // Clean up
        reject(new Error('Failed to convert file to base64'))
      }
      reader.readAsDataURL(file)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl) // Clean up
      reject(new Error('Invalid image file'))
    }

    image.src = objectUrl
  })
}

export function PhotosForm({ initialData, onSubmit, isSubmitting = false }: PhotosFormProps) {
  const [gallery, setGallery] = useState<any[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const {
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(profileSections.images.validationSchema),
    defaultValues: initialData || { gallery: [], profilePictureIndex: 0 }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setGallery(initialData.gallery || [])
      setPrimaryImageIndex(initialData.profilePictureIndex || 0)
    }
  }, [initialData, reset])

  const handleFileSelect = async (files: FileList) => {
    const newImages: any[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        continue
      }

      try {
        const imageData = await fileToBase64(file)
        if (imageData) {
          newImages.push(imageData)
        }
      } catch (error) {
        alert(`Error processing file ${file.name}: ${error}`)
      }
    }

    setGallery(prev => [...prev, ...newImages])
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
    
    // Update primary index if needed
    if (primaryImageIndex === draggedIndex) {
      setPrimaryImageIndex(finalDropIndex)
    } else if (primaryImageIndex > draggedIndex && primaryImageIndex <= dropIndex) {
      setPrimaryImageIndex(primaryImageIndex - 1)
    } else if (primaryImageIndex < draggedIndex && primaryImageIndex >= dropIndex) {
      setPrimaryImageIndex(primaryImageIndex + 1)
    }
    
    setGallery(newGallery)
    setDraggedIndex(null)
  }

  const handleRemoveImage = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index)
    setGallery(newGallery)
    
    // Adjust primary index
    if (primaryImageIndex >= index && primaryImageIndex > 0) {
      setPrimaryImageIndex(primaryImageIndex - 1)
    } else if (primaryImageIndex === index && newGallery.length > 0) {
      setPrimaryImageIndex(0)
    }
  }

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index)
  }

  const onFormSubmit = async () => {
    try {
      await onSubmit({
        gallery,
        profilePictureIndex: primaryImageIndex
      })
    } catch (error) {
      console.error('Form submission error:', error)
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
              <Label>Your Photos (Drag to reorder)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {gallery.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-move ${
                      primaryImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.data}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {primaryImageIndex === index && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      {primaryImageIndex !== index && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSetPrimary(index)}
                          className="text-xs"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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