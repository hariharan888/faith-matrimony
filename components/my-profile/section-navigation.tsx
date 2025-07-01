'use client'

import { Card, CardContent } from '@/components/ui/card'
import { PROFILE_SECTIONS_ORDER, profileSections } from '@/lib/profile-config'
import { useMyProfileForm } from '@/components/providers/my-profile-form-provider'

export function SectionNavigation() {
  const { 
    currentSection, 
    sectionCompleted, 
    canNavigateToSection, 
    handleSectionNavigation 
  } = useMyProfileForm()

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Sections</h3>
        <div className="space-y-2">
          {PROFILE_SECTIONS_ORDER.map((section, index) => {
            const isActive = section === currentSection
            const isComplete = sectionCompleted[section]
            const canNavigate = canNavigateToSection(section)
            
            return (
              <button
                key={section}
                onClick={() => handleSectionNavigation(section)}
                disabled={!canNavigate}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-900 border border-blue-300 cursor-pointer' 
                    : isComplete 
                      ? 'bg-green-50 text-green-800 hover:bg-green-100 cursor-pointer' 
                      : canNavigate 
                        ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                        : 'text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {index + 1}. {profileSections[section].title}
                  </span>
                  {isComplete && <span className="text-green-600">✓</span>}
                  {isActive && <span className="text-blue-600">→</span>}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 