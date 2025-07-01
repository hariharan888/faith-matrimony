'use client'

import { Sidebar } from './sidebar'
import { FormRenderer } from './form-renderer'

export function ProfileFormLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <div className="flex-1">
            <FormRenderer />
          </div>
        </div>
      </div>
    </div>
  )
} 