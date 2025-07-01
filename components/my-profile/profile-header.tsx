'use client'

import { Button } from '@/components/ui/button'
import { useMyProfileForm } from '@/components/providers/my-profile-form-provider'

export function ProfileHeader() {
  const { isNewProfile, handleNavigateBack } = useMyProfileForm()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isNewProfile && (
          <Button variant="outline" size="sm" onClick={handleNavigateBack}>
            Back to Dashboard
          </Button>
        )}
      </div>
      
      {isNewProfile && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Complete all sections step by step. You cannot access other parts of the application until your profile is complete.
          </p>
        </div>
      )}
    </div>
  )
} 