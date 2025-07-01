'use client'

import { ProfileHeader } from './profile-header'
import { ProgressDisplay } from './progress-display'
import { SectionNavigation } from './section-navigation'

export function Sidebar() {
  return (
    <div className="lg:w-80 space-y-6">
      <ProfileHeader />
      <ProgressDisplay />
      <SectionNavigation />
    </div>
  )
} 