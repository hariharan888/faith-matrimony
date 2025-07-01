'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ProfileSectionKey } from '@/lib/profile-config'
import { MyProfileFormProvider, ProfileData } from '@/components/providers/my-profile-form-provider'
import { ProfileFormLayout } from '@/components/my-profile/profile-form-layout'

export default function MyProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNewProfile, setIsNewProfile] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    fetchProfileData()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        
        // If no profile exists or very low completion, start in new profile mode
        if (!data.profile || data.completionPercentage < 90) {
          setIsNewProfile(true)
        }
      } else {
        // Create new profile if doesn't exist
        const createResponse = await fetch('/api/profile', { method: 'POST' })
        if (createResponse.ok) {
          await fetchProfileData()
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSectionSubmit = async (section: ProfileSectionKey, data: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/profile/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setProfileData(result)
      
      // If profile completion reaches 100%, exit new profile mode
      if (result.completionPercentage >= 100) {
        setIsNewProfile(false)
      }
    } catch (error) {
      console.error('Error updating profile section:', error)
      throw error // Re-throw the error so the form container can handle it
    }
  }

  const handleNavigateBack = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading profile data</p>
        </div>
      </div>
    )
  }

  return (
    <MyProfileFormProvider
      initialData={profileData}
      isNewProfile={isNewProfile}
      onSectionSubmit={handleSectionSubmit}
      onNavigateBack={handleNavigateBack}
    >
      <ProfileFormLayout />
    </MyProfileFormProvider>
  )
} 