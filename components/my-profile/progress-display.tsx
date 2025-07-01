'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useMyProfileForm } from '@/components/providers/my-profile-form-provider'

export function ProgressDisplay() {
  const { profileData } = useMyProfileForm()
  
  const completionPercentage = profileData?.completionPercentage ?? 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-gray-600">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </div>
      </CardContent>
    </Card>
  )
} 