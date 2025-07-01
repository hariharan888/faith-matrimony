# Faith Matrimony - Project Requirements Document (PRD)

## 1. Project Overview

### 1.1 Project Name
Faith Matrimony - Christian Matrimony Application

### 1.2 Project Description
A comprehensive matrimony application designed specifically for the Christian faith community. The platform enables users to create detailed profiles, browse potential matches, and interact with other users in a secure, faith-based environment.

### 1.3 Target Audience
- Christian individuals seeking marriage partners
- Families looking for suitable matches for their children
- Church communities and religious organizations

### 1.4 Core Value Proposition
- Faith-focused matching based on spiritual compatibility
- Comprehensive profile system with detailed personal, family, and spiritual information
- Advanced filtering and search capabilities
- Secure and verified user profiles with admin oversight
- User-friendly interface with step-by-step profile creation
- Offline payment processing with admin approval system

## 2. Technical Architecture

### 2.1 Technology Stack
- **Frontend**: Next.js 15.3.4 with React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Form Management**: React Hook Form with Yup validation
- **Language**: TypeScript
- **Infinite Scrolling**: React Intersection Observer
- **Image Gallery**: Custom carousel component

### 2.2 Database Schema

#### User Model
```prisma
model User {
  id                    String    @id @default(cuid())
  uid                   String    @unique
  email                 String    @unique
  name                  String?
  picture               String?
  emailVerified         Boolean   @default(false)
  lastLoggedInAt        DateTime?
  loginCount            Int       @default(0)
  isActive              Boolean   @default(true)
  isBlocked             Boolean   @default(false)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  isVerified            Boolean   @default(false)
  profile               Profile?
  payments              Payment[]
  userInteractions      Interaction[] @relation("UserInteractions")
  subjectInteractions   Interaction[] @relation("SubjectInteractions")
  settings              UserSettings?
}
```

#### Profile Model
```prisma
model Profile {
  id                     String         @id @default(cuid())
  userId                 String         @unique
  isReady                Boolean        @default(false)
  isPaymentApproved      Boolean        @default(false)
  paymentApprovedAt      DateTime?
  paymentApprovedBy      String?
  createdAt              DateTime       @default(now())
  updatedAt              DateTime       @updatedAt
  lastActiveAt           DateTime       @default(now())
  
  // Primary Details
  name                   String?
  about                  String?
  gender                 String?
  dateOfBirth            String?
  martialStatus          String?
  education              String?
  jobType                String?
  jobTitle               String?
  income                 String?
  height                 String?
  weight                 String?
  complexion             String?
  mobileNumber           String?
  currentAddress         Json?
  nativePlace            String?
  motherTongue           String?
  profileCreatedFor      String?
  
  // Family Details
  fatherName             String?
  fatherOccupation       String?
  motherName             String?
  motherOccupation       String?
  familyType             String?
  youngerBrothers        Int?
  youngerSisters         Int?
  elderBrothers          Int?
  elderSisters           Int?
  youngerBrothersMarried Int?
  youngerSistersMarried  Int?
  elderBrothersMarried   Int?
  elderSistersMarried    Int?
  
  // Spiritual Details
  areYouSaved            String?
  areYouBaptized         String?
  areYouAnointed         String?
  churchName             String?
  denomination           String?
  pastorName             String?
  pastorMobileNumber     String?
  churchAddress          Json?
  
  // Partner Preferences
  exMinAge               Int?
  exMaxAge               Int?
  exEducation            String?
  exJobType              String?
  exIncome               String?
  exComplexion           String?
  exOtherDetails         String?
  
  // Relations
  images                 ProfileImage[]
  user                   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([gender, isReady, isPaymentApproved])
  @@index([createdAt, isReady, isPaymentApproved])
  @@index([lastActiveAt, isReady, isPaymentApproved])
}
```

#### ProfileImage Model
```prisma
model ProfileImage {
  id        String   @id @default(cuid())
  profileId String
  data      String   // Base64 encoded image
  isPrimary Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  @@index([profileId, order])
}
```

#### Payment Model
```prisma
model Payment {
  id                String        @id @default(cuid())
  userId            String
  amount            Decimal       @db.Decimal(10,2)
  currency          String        @default("INR")
  status            PaymentStatus @default(PENDING)
  userNotes         String?       // User's notes about the payment (re-editable)
  userClickedPaid   Boolean       @default(false)
  userClickedAt     DateTime?     // When user clicked "I have paid"
  adminNotes        String?       // Admin's notes about the payment
  submittedAt       DateTime      @default(now())
  approvedAt        DateTime?
  approvedBy        String?       // Admin ID who approved
  rejectedAt        DateTime?
  rejectedBy        String?       // Admin ID who rejected
  rejectionReason   String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  user              User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum PaymentStatus {
  PENDING
  USER_CLAIMED_PAID
  APPROVED
  REJECTED
}
```

#### Interaction Model
```prisma
model Interaction {
  id              String          @id @default(cuid())
  userId          String          // User performing the action
  subjectId       String          // User being acted upon
  type            InteractionType
  status          InteractionStatus @default(ACTIVE)
  message         String?         // Optional message (for interests)
  metadata        Json?           // Additional data (view timestamps, etc.)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  respondedAt     DateTime?       // When status was changed from pending
  
  user            User            @relation("UserInteractions", fields: [userId], references: [id], onDelete: Cascade)
  subject         User            @relation("SubjectInteractions", fields: [subjectId], references: [id], onDelete: Cascade)
  
  @@unique([userId, subjectId, type])
  @@index([userId, type])
  @@index([subjectId, type])
  @@index([type, status, createdAt])
}

enum InteractionType {
  INTEREST_SENT
  SHORTLIST
  BLOCK
  PROFILE_VIEW
}

enum InteractionStatus {
  ACTIVE          // For shortlists, blocks, and profile views
  PENDING         // For interests awaiting response
  ACCEPTED        // For accepted interests
  DECLINED        // For declined interests
  WITHDRAWN       // For withdrawn interests
  INACTIVE        // For removed shortlists or unblocked users
}
```

#### ProfileFilter Model (New)
```prisma
model ProfileFilter {
  id              String    @id @default(cuid())
  userId          String
  name            String    // Filter name
  filters         Json      // Stored filter criteria
  isDefault       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isDefault])
}
```

#### UserSettings Model (New)
```prisma
model UserSettings {
  id                          String    @id @default(cuid())
  userId                      String    @unique
  showImagesAfterInterest     Boolean   @default(false)
  showPhoneAfterInterest      Boolean   @default(false)
  isProfileHidden             Boolean   @default(false)
  profileHiddenAt             DateTime?
  createdAt                   DateTime  @default(now())
  updatedAt                   DateTime  @updatedAt
  
  user                        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 3. Core Features

### 3.1 User Authentication & Management
- **Registration/Login**: Google OAuth-based authentication with NextAuth.js
- **Profile Verification**: Admin verification system for user profiles
- **User Status Management**: Active/blocked user states
- **Session Management**: Secure session handling with middleware

### 3.2 Profile Management System

#### 3.2.1 Profile Creation Flow
- **Mandatory Profile Creation**: Users must complete profile before accessing dashboard
- **Step-by-Step Process**: 6 sections with progressive completion
- **Progress Tracking**: Visual progress indicator
- **Data Persistence**: Save progress after each section completion

#### 3.2.2 Profile Sections

##### Primary Details
- Profile Created For (Self, Son, Daughter, Brother, Sister, Relative, Friend, Other)
- Personal Information (Name, About, Gender, Date of Birth, Marital Status)
- Education & Career (Education, Job Type, Job Title, Income)
- Physical Attributes (Height, Weight, Complexion)
- Contact & Location (Mobile Number, Current Address, Native Place, Mother Tongue)

##### Family Details
- Parent Information (Father's Name & Occupation, Mother's Name & Occupation)
- Family Structure (Family Type, Sibling Counts and Marriage Status)
- Current Address (Complete address with validation)

##### Spiritual Details
- Faith Status (Saved, Baptized, Anointed)
- Church Information (Church Name, Denomination, Pastor Details, Church Address)

##### Partner Preferences
- Age Range (Minimum and Maximum Age)
- Education & Career Preferences
- Physical Preferences (Complexion)
- Additional Requirements (Text field for other details)

##### Photos
- Multiple Image Upload (Base64 storage)
- Primary Photo Selection
- Image Ordering System
- Minimum Photo Requirement

##### Payment
- **New Profile Mode**: Offline payment instructions with WhatsApp contact
- **Update Mode**: Payment status display and history
- Payment proof upload functionality
- Admin approval status tracking

### 3.3 Page Structure

#### 3.3.1 Dashboard Page (`/dashboard`)

##### Access Requirements
- **Profile Completion**: User must have completed all profile sections
- **Payment Verification**: Admin must have approved user's payment
- **Redirect Logic**: Incomplete profiles or unverified payments redirect to my-profile page

##### Dashboard Layout

###### Header Section
- **User Welcome**: Display user's name and profile completion status
- **Quick Stats**: 
  - Pending Requests count
  - Accepted Requests count
- **Settings Link**: Top-right corner navigation to Settings page

###### Main Content Sections
Each section displays:
- **Section Title**: Clear section heading
- **Profile Cards**: Maximum 4 profile cards per section
- **View All Link**: Navigation to filtered Profiles list page with appropriate filter parameter
- **Empty State**: When no profiles available, show empty state with navigation option

###### Available Sections
1. **New Profiles**: Recently joined profiles matching basic criteria (Links to `/profiles?filter=new`)
2. **Interest Received**: Profiles that have sent interest to current user (Links to `/profiles?filter=interest_received`)
3. **Interest Sent**: Profiles to which current user has sent interest (Links to `/profiles?filter=interest_sent`)
4. **Viewed Profiles**: Profiles that current user has viewed (Links to `/profiles?filter=viewed`)
5. **Shortlisted Profiles**: Profiles that current user has shortlisted (Links to `/profiles?filter=shortlisted`)
6. **Based on Your Preference**: Algorithm-matched profiles based on user preferences (Links to `/profiles?filter=recommended`)
7. **Recently Active**: Profiles that were recently active on the platform (Links to `/profiles?filter=recently_active`)

##### User Interaction Features
- **Shortlist**: Add/remove profiles from shortlist
- **Send Interest**: Express interest in a profile
- **Receive Interest**: Accept/decline received interests
- **Block User**: Block inappropriate profiles
- **View Tracking**: Track profile views (both sent and received)
- **Profile Navigation**: Click to view detailed profile

##### Navigation Structure
- **No Top Menu**: Clean interface without persistent navigation bar
- **Contextual Navigation**: Page-specific navigation elements
- **Stacked/Tabbed Navigation**: Internal page navigation using tabs or stacked layouts
- **Settings Access**: Direct link from dashboard header

#### 3.3.2 Profiles List Page (`/profiles`)

##### Access Requirements
- **Profile Completion**: User must have completed all profile sections
- **Payment Verification**: Admin must have approved user's payment
- **Same as Dashboard**: Inherits same access requirements

##### URL Structure and Filter Parameters
- **Base URL**: `/profiles` (shows all opposite gender profiles)
- **Filter Parameters**: 
  - `/profiles?filter=new` - New profiles
  - `/profiles?filter=interest_sent` - Profiles to which user sent interest
  - `/profiles?filter=interest_received` - Profiles that sent interest to user
  - `/profiles?filter=viewed` - Profiles user has viewed
  - `/profiles?filter=shortlisted` - User's shortlisted profiles
  - `/profiles?filter=recommended` - Algorithm-matched profiles
  - `/profiles?filter=recently_active` - Recently active profiles

##### Page Layout

###### Header Section
- **Page Title**: "Find Your Match" or dynamic title based on active filter
- **Search Bar**: Quick search by name or profile ID
- **Active Filter Indicator**: Show current active filter with profile count
- **Sort Options**: Sort by (Recently Joined, Recently Active, Age, etc.)

###### Tab Navigation
- **Horizontal Tab Bar**: All available filters as clickable tabs
- **Active Tab Indicator**: Visual indication of current active tab
- **Tab Labels with Counts**: Show profile count for each tab
- **Default Tab**: "All" (no filter parameter)

**Available Tabs:**
1. **All** (default) - All opposite gender profiles
2. **New** - Recently joined profiles (last 30 days)
3. **Interest Sent** - Profiles user expressed interest in
4. **Interest Received** - Profiles that sent interest to user
5. **Viewed** - Profiles user has viewed
6. **Shortlisted** - User's shortlisted profiles
7. **Recommended** - Algorithm-based matches
8. **Recently Active** - Active in last 7 days

###### Left Sidebar - Filter Panel

**Filter Categories:**

1. **Age Range**
   - Slider component for min/max age selection
   - Default: Based on user's partner preferences or 18-60

2. **Height Range**
   - Slider component for min/max height selection
   - Default: All heights (4'0" - 7'0")

3. **Education**
   - Multi-select dropdown with education levels
   - Default: All education levels selected

4. **Job Type**
   - Multi-select dropdown with job categories
   - Default: All job types selected

5. **Income Range**
   - Slider component for income brackets
   - Default: All income ranges

6. **Marital Status**
   - Checkbox options (Never Married, Divorced, Widowed)
   - Default: Based on tab filter or all selected

7. **Complexion**
   - Multi-select options
   - Default: All complexions selected

8. **Mother Tongue**
   - Multi-select dropdown with languages
   - Default: All languages selected

9. **Location**
   - Multi-level dropdown (State -> City)
   - Default: All locations

10. **Spiritual Details**
    - Saved (Yes/No/Any)
    - Baptized (Yes/No/Any)
    - Anointed (Yes/No/Any)
    - Denomination (Multi-select)
    - Default: "Any" for all spiritual filters

**Filter Behavior:**
- **Tab-Based Auto-Fill**: Filters auto-populate based on active tab's predefined criteria
- **Non-Editable Tab Filters**: Tab-specific filters are locked and displayed as info badges
- **User Additional Filters**: Users can apply additional filters on top of tab filters
- **Reset Functionality**: "Clear All" button to reset user-applied filters (not tab filters)
- **Filter Persistence**: User filters persist during tab switches where applicable
- **Real-time Updates**: Profile count updates as filters are applied

###### Main Content Area

**Profile Cards Layout:**
- **Grid Layout**: Responsive grid (1 column mobile, 2-3 columns tablet, 3-4 columns desktop)
- **Card Design**: Blog post style with image gallery, content, and action buttons
- **Infinite Scroll**: Load 20 profiles per batch on scroll
- **Loading States**: Skeleton loading for new batches

**Individual Profile Card Components:**

1. **Image Gallery Section**
   - **Primary Image**: Main profile photo displayed
   - **Gallery Navigation**: Left/right arrow buttons for image navigation
   - **Image Indicators**: Dots showing current image position
   - **Multiple Images**: Cycle through all profile images
   - **Placeholder**: Default image when no photos available

2. **Profile Information Section**
   - **Name**: Profile name with age (e.g., "Sarah, 28")
   - **About**: Truncated about section (2-3 lines with "Read more")
   - **Key Details**: Height, Education, Job Type (icon-based display)
   - **Location**: Current city/state
   - **Online Status**: Last active indicator (if recently active)

3. **Action Buttons Section**
   - **View Profile**: Primary button linking to `/profiles/[profileId]`
   - **Send Interest**: Interest button with heart icon
   - **Shortlist**: Bookmark icon for shortlisting
   - **Quick Actions**: Dropdown for additional actions (Block, Report)
   
4. **Status Indicators**
   - **Interest Status**: Show if interest sent/received
   - **Interaction Badges**: Viewed, Shortlisted indicators
   - **Premium Badge**: If applicable for premium profiles

**Card Interaction States:**
- **Hover Effects**: Subtle animations and highlight effects
- **Loading States**: Button loading states during actions
- **Success Feedback**: Visual confirmation of actions
- **Error Handling**: Error messages for failed actions

##### Infinite Scrolling Implementation
- **Batch Size**: 20 profiles per load
- **Intersection Observer**: Trigger loading when user nears bottom
- **Loading Indicator**: Spinner at bottom during data fetch
- **End State**: Message when no more profiles available
- **Error Handling**: Retry mechanism for failed loads

##### Empty States
- **No Profiles Found**: When filters return no results
- **No Profiles in Tab**: Tab-specific empty states with suggestions
- **Network Error**: Error state with retry option
- **Loading State**: Initial page load skeleton

##### Mobile Responsiveness
- **Collapsible Filters**: Mobile filter panel as modal/drawer
- **Touch Gestures**: Swipe navigation for image galleries
- **Optimized Cards**: Single column layout on mobile
- **Touch-Friendly Actions**: Appropriately sized buttons and touch targets

#### 3.3.3 My-Profile Page

##### Profile Modes

###### New Profile Mode
- **Restricted Navigation**: Cannot access other pages until profile completion and payment approval
- **Sequential Access**: Must complete sections in order
- **Validation Enforcement**: Cannot proceed without valid data
- **Auto-Save**: Progress saved after each section
- **Payment Requirement**: Must complete offline payment process before profile activation

###### Update Mode
- **Free Navigation**: Can access all application features
- **Flexible Section Access**: Can edit any section at any time
- **Optional Updates**: No mandatory completion requirements
- **Payment History**: View payment status and transaction history

##### Payment Section Behavior

###### For New Profiles (Initial Payment)
- Display payment instructions with admin WhatsApp contact and bank details
- Show fixed payment amount in Indian Rupees
- "Click here if you have paid" button
- Re-editable notes section for user payment details/comments
- Upon clicking "paid" button, mark as 'user has clicked paid' status
- Display "Payment verification is in progress" status after user confirmation
- Block dashboard and profile browsing access until admin approval

###### For Existing Profiles (Update Mode)
- Display current payment status (Approved/Pending/Rejected)
- Show payment approval date and approving admin
- Display payment transaction details and user notes
- Show payment completion confirmation
- Full access to dashboard and application features

#### 3.3.4 Individual Profile Detail Page (`/profiles/[profileId]`)

##### Access Requirements
- **Profile Completion**: User must have completed all profile sections
- **Payment Verification**: Admin must have approved user's payment
- **Valid Profile ID**: Profile must exist and be active
- **Not Blocked**: User must not be blocked by profile owner
- **Not Hidden**: Profile owner must not have hidden their profile

##### Page Layout

###### Header Section
- **Profile Images Gallery**: 
  - Large primary image display
  - Thumbnail navigation for multiple images
  - Image carousel with left/right navigation
  - Image count indicator (e.g., "1 of 5")
  - Respect privacy settings (hide images if required)
- **Basic Profile Info**: 
  - Name and age
  - Location (city, state)
  - Last active status
  - Profile completion percentage
  - Member since date
- **Quick Action Buttons**: 
  - Send Interest (with heart icon)
  - Shortlist (bookmark icon)
  - Block User (shield icon)
  - Share Profile (share icon)

###### Profile Content Sections

**About Section**
- **Full About Text**: Complete about section without truncation
- **Read More/Less**: Expandable text if content is long
- **Privacy Respect**: Hide if user settings require interest approval

**Personal Details Section**
- **Primary Information**: Name, age, gender, marital status
- **Education & Career**: Education level, job type, job title, income
- **Physical Attributes**: Height, weight, complexion
- **Contact Information**: 
  - Mobile number (respect privacy settings)
  - Current address (full address details)
  - Native place
  - Mother tongue
- **Profile Created For**: Who the profile was created for

**Family Details Section**
- **Parent Information**: Father's name and occupation, Mother's name and occupation
- **Family Structure**: Family type, sibling counts and marriage status
- **Address Information**: Complete current address

**Spiritual Details Section**
- **Faith Status**: Saved, baptized, anointed status
- **Church Information**: Church name, denomination
- **Pastor Details**: Pastor name and contact (respect privacy settings)
- **Church Address**: Complete church address

**Partner Preferences Section**
- **Age Range**: Minimum and maximum age preferences
- **Education & Career**: Preferred education and job types
- **Physical Preferences**: Preferred complexion
- **Additional Requirements**: Other details and preferences

###### Interaction Panel (Right Sidebar)

**Current Interaction Status**
- **Interest Status**: 
  - "No interaction" (default)
  - "Interest sent" (pending response)
  - "Interest received" (pending response)
  - "Interest accepted" (mutual connection)
  - "Interest declined" (previous interaction)
- **Shortlist Status**: "Shortlisted" or "Add to shortlist"
- **Block Status**: "Blocked" or "Block user"

**Action Buttons**
- **Send Interest**: 
  - Primary action button
  - Optional message input
  - Confirmation dialog
  - Success feedback
- **Respond to Interest**: 
  - Accept/Decline options
  - Optional message for acceptance
  - Confirmation dialogs
- **Shortlist/Unshortlist**: 
  - Toggle shortlist status
  - Visual feedback
- **Block/Unblock**: 
  - Block user functionality
  - Confirmation dialog
  - Unblock option if previously blocked

**Similar Profiles Section**
- **Recommendations**: Show 3-4 similar profiles
- **Profile Cards**: Mini profile cards with basic info
- **Quick Actions**: Send interest or shortlist from recommendations
- **View More**: Link to full recommendations page

###### Privacy and Visibility Features

**Image Privacy**
- **Settings Respect**: Hide images if profile owner has "Show images only after interest approval" enabled
- **Interest-Based Access**: Show images only after mutual interest acceptance
- **Placeholder Display**: Show appropriate placeholder when images are hidden

**Contact Information Privacy**
- **Phone Number**: Hide if "Show phone number only after interest approval" is enabled
- **Address Details**: Hide sensitive address information based on privacy settings
- **Pastor Contact**: Hide pastor contact information based on privacy settings

**Profile Visibility**
- **Hidden Profiles**: Completely hide profiles that are temporarily hidden by owners
- **Blocked Users**: Prevent blocked users from viewing profiles
- **Access Control**: Respect all privacy settings and interaction requirements

###### Mobile Responsiveness
- **Responsive Gallery**: Touch-friendly image navigation
- **Collapsible Sections**: Accordion-style section organization
- **Touch Actions**: Appropriately sized buttons for mobile interaction
- **Optimized Layout**: Single column layout on mobile devices

###### Error Handling
- **Profile Not Found**: 404 page for invalid profile IDs
- **Access Denied**: Appropriate message for blocked or hidden profiles
- **Network Errors**: Retry mechanisms for failed data loads
- **Loading States**: Skeleton loading for profile content

#### 3.3.5 Settings Page (`/settings`)

##### Access Requirements
- **Profile Completion**: User must have completed all profile sections
- **Payment Verification**: Admin must have approved user's payment
- **Authentication**: User must be logged in

##### Page Layout

###### Header Section
- **Page Title**: "Settings"
- **Back Navigation**: Link back to dashboard
- **Save Button**: Save all settings changes
- **Unsaved Changes Indicator**: Show when changes are pending

###### Settings Sections

**Privacy Settings**
- **Show Images Only After Interest Approval**:
  - Checkbox control
  - Description: "Your profile images will only be visible to users after they send interest and you accept it"
  - Default: Unchecked (images visible to all)
  - Impact: Controls image visibility in profile listings and detail pages

- **Show Phone Number Only After Interest Approval**:
  - Checkbox control
  - Description: "Your phone number will only be visible to users after they send interest and you accept it"
  - Default: Unchecked (phone visible to all)
  - Impact: Controls phone number visibility in profile detail pages

- **Temporarily Hide Profile**:
  - Checkbox control
  - Description: "Your profile will be hidden from all users. You can unhide it anytime"
  - Default: Unchecked (profile visible)
  - Impact: Completely hides profile from search results and listings
  - **Warning Dialog**: Confirmation dialog when enabling this setting

**Profile Management**
- **Delete Profile**:
  - Danger zone section
  - Red "Delete Profile" button
  - Description: "This action cannot be undone. All your data will be permanently deleted"
  - **Confirmation Process**:
    1. Click "Delete Profile" button
    2. Show confirmation dialog with warning
    3. Require user to type "DELETE" to confirm
    4. Final confirmation before deletion
  - **Data Cleanup**: Remove all profile data, images, interactions, and settings

**Account Settings**
- **Email Preferences**: Future implementation
- **Notification Settings**: Future implementation
- **Language Preferences**: Future implementation

###### Settings Behavior

**Real-time Updates**
- **Immediate Effect**: Privacy settings take effect immediately
- **Profile Visibility**: Hidden profiles disappear from all listings instantly
- **Image Privacy**: Image visibility changes apply to all profile views
- **Contact Privacy**: Phone number visibility changes apply immediately

**Settings Persistence**
- **Auto-save**: Settings save automatically when changed
- **Success Feedback**: Visual confirmation when settings are saved
- **Error Handling**: Error messages if settings fail to save
- **Offline Support**: Queue changes if network is unavailable

**Settings Validation**
- **Conflicting Settings**: Prevent conflicting privacy settings
- **Required Fields**: Ensure critical settings are properly configured
- **Data Integrity**: Validate settings before saving

###### Mobile Responsiveness
- **Touch-Friendly Controls**: Appropriately sized checkboxes and buttons
- **Responsive Layout**: Single column layout on mobile
- **Easy Navigation**: Clear back navigation and save actions
- **Readable Text**: Appropriate font sizes for mobile reading

###### Security Considerations
- **Authentication Required**: All settings changes require valid session
- **CSRF Protection**: Protect against cross-site request forgery
- **Rate Limiting**: Prevent rapid settings changes
- **Audit Trail**: Log all settings changes for security purposes

#### 3.3.6 Payment Processing Workflow

##### User Journey
1. **Payment Initiation**: User reaches payment section
2. **Instruction Display**: WhatsApp contact and bank details shown with fixed INR amount
3. **Offline Payment**: User makes payment via provided methods (WhatsApp/Bank Transfer)
4. **User Confirmation**: User clicks "Click here if you have paid" button
5. **Notes Submission**: User adds/edits notes about their payment
6. **Status Update**: System shows "Payment verification is in progress"
7. **Access Restriction**: Dashboard and profile browsing remain blocked
8. **Admin Review**: Admin reviews user claim and approves/rejects
9. **Access Grant**: Upon approval, full dashboard access granted

##### Admin Workflow
1. **Payment Notification**: Receive notification of new payment submission
2. **Payment Review**: Review payment proof and user details
3. **Decision Making**: Approve or reject payment with notes
4. **Status Update**: Update payment status and profile activation
5. **User Notification**: Notify user of payment decision

### 3.4 User Interaction System

#### 3.4.1 Interest Management
- **Send Interest**: Users can express interest in profiles with optional message
- **Receive Interest**: Users receive notifications of incoming interests
- **Interest Responses**: Accept, decline, or ignore received interests
- **Interest Tracking**: Track all sent and received interests with timestamps
- **Interest Limits**: Prevent spam by limiting interests per day/profile
- **Interest-Based Privacy**: Control access to sensitive information based on interest status

#### 3.4.2 Profile Interaction Features
- **Shortlisting**: Save profiles for later review and easy access
- **Profile Viewing**: Track which profiles user has viewed
- **View Notifications**: Users can see who viewed their profile
- **Profile Blocking**: Block inappropriate or unwanted profiles
- **Interaction History**: Complete history of all user interactions
- **Profile Hiding**: Temporarily hide profile from all users

#### 3.4.3 Privacy and Visibility Controls
- **Image Privacy**: Control image visibility based on interest approval status
- **Contact Privacy**: Control phone number visibility based on interest approval
- **Profile Visibility**: Temporarily hide entire profile from search results
- **Settings Management**: User-controlled privacy preferences
- **Real-time Updates**: Privacy changes take effect immediately

#### 3.4.3 Dashboard Statistics
- **Pending Requests**: Count of interests sent awaiting response
- **Accepted Requests**: Count of interests that were accepted
- **Profile Views**: Number of times user's profile was viewed
- **Interest Received**: Count of interests received from other users

### 3.5 Advanced Filtering & Search System

#### 3.5.1 Filter Categories and Options

**Demographic Filters:**
- **Age Range**: 18-65 years (slider with 1-year increments)
- **Height Range**: 4'0" to 7'0" (slider with 1-inch increments)
- **Weight Range**: 40kg to 150kg (optional, slider)
- **Complexion**: Fair, Medium, Dark, Any
- **Marital Status**: Never Married, Divorced, Widowed, Separated

**Educational & Professional Filters:**
- **Education Level**: High School, Diploma, Bachelor's, Master's, PhD, Professional
- **Field of Study**: Engineering, Medical, Business, Arts, Science, etc.
- **Job Type**: Government, Private, Business, Self-Employed, Not Working, Student
- **Job Title**: Free text search within job titles
- **Income Range**: No Income, <2L, 2-5L, 5-10L, 10-20L, 20L+ (INR per annum)

**Location Filters:**
- **Country**: Multi-select with major countries
- **State/Province**: Dependent on country selection
- **City**: Dependent on state selection
- **Native Place**: Separate filter for hometown
- **Willing to Relocate**: Yes/No/Open to Discussion

**Family Background Filters:**
- **Family Type**: Nuclear, Joint, Extended
- **Father's Occupation**: Professional categories
- **Mother's Occupation**: Professional categories  
- **Family Income**: Income brackets
- **Siblings Count**: Number ranges for brothers/sisters

**Spiritual & Religious Filters:**
- **Saved Status**: Yes, No, Prefer Not to Say, Any
- **Baptized Status**: Yes, No, Prefer Not to Say, Any
- **Anointed Status**: Yes, No, Prefer Not to Say, Any
- **Denomination**: Catholic, Protestant, Orthodox, Pentecostal, Baptist, Methodist, etc.
- **Church Attendance**: Regular, Occasional, Rarely, Never
- **Spiritual Maturity**: Self-assessed levels

**Lifestyle & Personal Filters:**
- **Languages**: Mother tongue and other known languages
- **Smoking**: Yes, No, Occasionally, Social
- **Drinking**: Yes, No, Occasionally, Social
- **Diet**: Vegetarian, Non-Vegetarian, Vegan, Any
- **Hobbies**: Multi-select from predefined list

#### 3.5.2 Filter Behavior and Logic

**Tab-Based Filter Presets:**
Each tab has predefined base filters that cannot be modified:

- **New**: `created_at >= 30 days ago AND opposite_gender`
- **Interest Sent**: `user_sent_interest = true AND opposite_gender`
- **Interest Received**: `received_interest_from_user = true AND opposite_gender`
- **Viewed**: `viewed_by_user = true AND opposite_gender`
- **Shortlisted**: `shortlisted_by_user = true AND opposite_gender`
- **Recommended**: `matches_preferences = true AND opposite_gender`
- **Recently Active**: `last_active >= 7 days ago AND opposite_gender`

**Filter Combination Logic:**
- **Base Filters**: Tab filters + opposite gender filter (always applied)
- **User Filters**: Additional filters applied on top of base filters
- **AND Logic**: All filters must match (intersection of criteria)
- **Range Filters**: Inclusive ranges for age, height, income
- **Multi-Select Logic**: OR within category, AND between categories

**Default Filter Values:**
When no user preferences are set, defaults are:
- **Age Range**: 18-60 years
- **Height**: All heights
- **Location**: All locations
- **Education**: All levels
- **Marital Status**: Never Married (primary focus)
- **Spiritual**: Any (inclusive approach)

#### 3.5.3 Search Functionality

**Quick Search Features:**
- **Name Search**: Partial match on profile names
- **Profile ID Search**: Direct profile lookup by ID
- **Location Search**: Search by city/state names
- **Church Search**: Find profiles by church name
- **Job Title Search**: Search within job titles

**Advanced Search Options:**
- **Keyword Search**: Search across multiple profile fields
- **Boolean Operators**: AND, OR, NOT for complex searches
- **Phrase Search**: Exact phrase matching with quotes
- **Fuzzy Search**: Typo-tolerant searching

#### 3.5.4 Filter Performance Optimization

**Database Indexing Strategy:**
- **Composite Indexes**: Gender + Age + Location + Marital Status
- **Filtered Indexes**: Separate indexes for each tab's base criteria
- **Partial Indexes**: Only on active, verified, payment-approved profiles
- **Full-Text Indexes**: For search functionality

**Caching Strategy:**
- **Filter Results**: Cache frequently used filter combinations
- **Count Queries**: Cache profile counts for each tab
- **User Filters**: Store user's commonly used filter sets
- **Popular Filters**: Cache most popular filter combinations

### 3.6 Data Validation & Security

### 3.6.1 Field Validation
- **Dropdown-Heavy Design**: Most fields use predefined options to prevent invalid data
- **Text Field Restrictions**: Limited text fields to prevent contact information sharing
- **Comprehensive Validation**: Yup schemas for all form sections
- **Cross-Field Validation**: Logical validation (e.g., married siblings cannot exceed total siblings)

### 3.6.2 Admin Verification System
- **Profile Review**: Admin verification required for new profiles
- **Payment Verification**: Admin verification required for all payments
- **User Verification Status**: `isVerified` flag in User model
- **Payment Approval Status**: `isPaymentApproved` flag in Profile model
- **Quality Control**: Ensures profile authenticity and payment legitimacy

## 4. User Interface Requirements

### 4.1 Design System
- **Component Library**: shadcn/ui components
- **Styling Framework**: Tailwind CSS
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance
- **Animation Library**: Framer Motion for smooth transitions

### 4.2 Profile Creation Interface
- **Sidebar Navigation**: Section-based navigation with progress indicator
- **Form Layout**: Clean, intuitive form design
- **Validation Feedback**: Real-time error display
- **Progress Visualization**: Clear completion status

### 4.3 Profiles List Interface

#### 4.3.1 Filter Panel Design
- **Collapsible Sections**: Expandable filter categories
- **Visual Hierarchy**: Clear section separation and organization
- **Interactive Elements**: Sliders, multi-select dropdowns, checkboxes
- **Filter Indicators**: Active filter badges and counts
- **Reset Options**: Category-wise and global reset buttons

#### 4.3.2 Profile Card Design
- **Card Layout**: Blog-style cards with consistent proportions
- **Image Gallery**: Smooth transition between images with navigation dots
- **Information Hierarchy**: Name/age prominent, supporting details secondary
- **Action Buttons**: Clearly visible and accessible interaction buttons
- **Status Indicators**: Visual badges for interaction status

#### 4.3.3 Navigation & Interaction
- **Tab Navigation**: Clean, intuitive tab switching
- **Infinite Scroll**: Smooth loading experience
- **Loading States**: Skeleton screens and progress indicators
- **Hover Effects**: Subtle card interactions and button states
- **Mobile Gestures**: Touch-friendly interactions for mobile devices

### 4.4 Payment Interface
- **Clear Instructions**: Step-by-step payment guidance
- **Contact Integration**: WhatsApp contact button for easy communication
- **Proof Upload**: Simple file upload interface for payment proof
- **Status Tracking**: Clear payment status indicators
- **History Display**: Payment transaction history table

### 4.5 User Experience
- **Intuitive Flow**: Logical progression through profile creation
- **Error Prevention**: Clear validation messages
- **Data Persistence**: No data loss during navigation
- **Loading States**: Appropriate loading indicators
- **Payment Clarity**: Clear payment instructions and status
- **Filter Feedback**: Real-time results and count updates

## 5. Business Rules

### 5.1 Profile Completion
- Users cannot access dashboard without complete profile
- All required fields must be filled before profile submission
- Admin verification required before profile activation
- Payment approval required for profile activation

### 5.2 Profile Discovery Rules
- **Gender Filtering**: Users only see opposite gender profiles by default
- **Age Restrictions**: Minimum age of 18 for all users
- **Verification Requirement**: Only verified and payment-approved profiles are shown
- **Blocking Logic**: Blocked users cannot see each other's profiles
- **Privacy Controls**: Certain details hidden until interest acceptance

### 5.3 Interaction Rules
- **Interest Limits**: Maximum 5 interests per day for new users, 10 for active users
- **Shortlist Limits**: Maximum 50 profiles in shortlist
- **Block Protection**: Mutual blocking prevents any interaction
- **Profile View Tracking**: All profile views are logged for analytics
- **Message Restrictions**: Messages only allowed after mutual interest

### 5.4 Payment Rules
- **Offline Payment Only**: All payments processed offline via WhatsApp or Bank Transfer
- **Fixed Amount**: Single fixed amount in Indian Rupees for all users
- **User Confirmation Required**: Users must click "I have paid" to proceed
- **Notes System**: Users can add/edit payment notes for admin reference
- **Admin Approval Required**: No automatic payment processing
- **Single Payment**: One-time payment per user (no recurring charges)
- **Access Control**: Dashboard and profile browsing blocked until payment approval

### 5.5 Data Integrity
- Dropdown options prevent invalid data entry
- Cross-field validation ensures logical consistency
- Required field validation prevents incomplete profiles
- Payment proof validation ensures submission quality

### 5.6 Security
- Admin verification for all new profiles
- Admin approval for all payments
- User blocking capability for inappropriate behavior
- Secure image storage and access
- Payment proof secure storage
- Privacy settings enforcement across all profile views
- Profile deletion with complete data cleanup

### 5.7 Privacy and Visibility Rules
- **Image Privacy**: Images hidden until interest approval if setting enabled
- **Contact Privacy**: Phone numbers hidden until interest approval if setting enabled
- **Profile Visibility**: Hidden profiles excluded from all search results and listings
- **Settings Persistence**: User privacy preferences maintained across sessions
- **Real-time Enforcement**: Privacy changes applied immediately to all profile views
- **Interest-Based Access**: Sensitive information only visible after mutual interest acceptance

## 6. API Requirements

### 6.1 Profile Discovery APIs

#### 6.1.1 GET /api/profiles
**Purpose**: Fetch profiles with filtering and pagination

**Query Parameters**:
```typescript
interface ProfilesQuery {
  filter?: 'new' | 'interest_sent' | 'interest_received' | 'viewed' | 'shortlisted' | 'recommended' | 'recently_active'
  page?: number
  limit?: number
  sortBy?: 'created_at' | 'last_active' | 'age' | 'name'
  sortOrder?: 'asc' | 'desc'
  
  // Filter parameters
  minAge?: number
  maxAge?: number
  minHeight?: number
  maxHeight?: number
  education?: string[]
  jobType?: string[]
  minIncome?: number
  maxIncome?: number
  maritalStatus?: string[]
  complexion?: string[]
  motherTongue?: string[]
  location?: {
    country?: string
    state?: string
    city?: string
  }
  denomination?: string[]
  saved?: 'yes' | 'no' | 'any'
  baptized?: 'yes' | 'no' | 'any'
  anointed?: 'yes' | 'no' | 'any'
  search?: string
}
```

**Response**:
```typescript
interface ProfilesResponse {
  profiles: ProfileCard[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    applied: FilterCriteria
    available: FilterOptions
    counts: FilterCounts
  }
}

interface ProfileCard {
  id: string
  name: string
  age: number
  about: string
  images: {
    primary: string
    gallery: string[]
  }
  location: {
    city: string
    state: string
  }
  details: {
    height: string
    education: string
    jobType: string
    maritalStatus: string
  }
  interactions: {
    isShortlisted: boolean
    isInterestSent: boolean
    isInterestReceived: boolean
    hasViewed: boolean
    lastActive: string
  }
  spiritualInfo: {
    denomination: string
    churchName: string
  }
}
```

#### 6.1.2 GET /api/profiles/[profileId]
**Purpose**: Fetch detailed profile information

**Response**:
```typescript
interface DetailedProfile {
  id: string
  basicInfo: {
    name: string
    age: number
    gender: string
    maritalStatus: string
    about: string
    location: Address
    nativePlace: string
    motherTongue: string
    lastActive: string
  }
  images: ProfileImage[]
  personalDetails: {
    dateOfBirth: string
    height: string
    weight: string
    complexion: string
    education: string
    jobType: string
    jobTitle: string
    income: string
  }
  familyDetails: {
    fatherName: string
    fatherOccupation: string
    motherName: string
    motherOccupation: string
    familyType: string
    siblings: SiblingInfo
  }
  spiritualDetails: {
    saved: string
    baptized: string
    anointed: string
    churchName: string
    denomination: string
    pastorName: string
    churchAddress: Address
  }
  partnerPreferences: {
    ageRange: { min: number, max: number }
    education: string
    jobType: string
    income: string
    complexion: string
    otherDetails: string
  }
  interactions: {
    currentUserInteractions: UserInteractionStatus
    mutualConnections: number
    profileViews: number
  }
  contactInfo?: {
    mobileNumber: string
    email: string
  } // Only available after interest acceptance
}
```

#### 6.1.3 GET /api/profiles/filters
**Purpose**: Get available filter options and counts

**Response**:
```typescript
interface FilterOptions {
  education: FilterOption[]
  jobType: FilterOption[]
  maritalStatus: FilterOption[]
  complexion: FilterOption[]
  motherTongue: FilterOption[]
  denomination: FilterOption[]
  locations: {
    countries: FilterOption[]
    states: Record<string, FilterOption[]>
    cities: Record<string, FilterOption[]>
  }
  ranges: {
    age: { min: number, max: number }
    height: { min: number, max: number }
    income: { min: number, max: number }
  }
}

interface FilterOption {
  value: string
  label: string
  count: number
}
```

### 6.2 Interaction APIs

#### 6.2.1 POST /api/interactions
**Purpose**: Create new user interaction (interest, shortlist, etc.)

**Request Body**:
```typescript
interface CreateInteraction {
  type: 'INTEREST_SENT' | 'SHORTLIST' | 'BLOCK' | 'PROFILE_VIEW'
  subjectId: string
  message?: string // For interests
}
```

#### 6.2.2 PUT /api/interactions/[interactionId]
**Purpose**: Update interaction status (accept/decline interest)

**Request Body**:
```typescript
interface UpdateInteraction {
  status: 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'INACTIVE'
  responseMessage?: string
}
```

#### 6.2.3 GET /api/interactions
**Purpose**: Get user's interaction history

**Query Parameters**:
```typescript
interface InteractionsQuery {
  type?: InteractionType
  status?: InteractionStatus
  direction?: 'sent' | 'received'
  page?: number
  limit?: number
}
```

### 6.3 Dashboard APIs

#### 6.3.1 GET /api/dashboard/stats
**Purpose**: Get dashboard statistics and counts

**Response**:
```typescript
interface DashboardStats {
  profileViews: {
    received: number
    sent: number
    thisWeek: number
  }
  interests: {
    sent: number
    received: number
    pending: number
    accepted: number
  }
  shortlists: {
    count: number
    recent: number
  }
  newMatches: number
  recentActivity: ActivityItem[]
}
```

#### 6.3.2 GET /api/dashboard/sections
**Purpose**: Get dashboard section data

**Response**:
```typescript
interface DashboardSections {
  newProfiles: ProfileCard[]
  interestReceived: ProfileCard[]
  interestSent: ProfileCard[]
  viewedProfiles: ProfileCard[]
  shortlistedProfiles: ProfileCard[]
  recommendedProfiles: ProfileCard[]
  recentlyActive: ProfileCard[]
}
```

### 6.4 Search APIs

#### 6.4.1 GET /api/search
**Purpose**: Advanced search functionality

**Query Parameters**:
```typescript
interface SearchQuery {
  q: string // Search query
  type?: 'name' | 'profileId' | 'location' | 'church' | 'jobTitle' | 'all'
  filters?: ProfilesQuery // Can combine with filters
  fuzzy?: boolean // Enable fuzzy search
}
```

#### 6.4.2 GET /api/search/suggestions
**Purpose**: Get search suggestions and autocomplete

**Query Parameters**:
```typescript
interface SearchSuggestions {
  q: string
  limit?: number
  type?: 'name' | 'location' | 'church' | 'occupation'
}
```

### 6.5 Settings APIs

#### 6.5.1 GET /api/settings
**Purpose**: Get user's current settings

**Response**:
```typescript
interface UserSettings {
  id: string
  showImagesAfterInterest: boolean
  showPhoneAfterInterest: boolean
  isProfileHidden: boolean
  profileHiddenAt?: string
  createdAt: string
  updatedAt: string
}
```

#### 6.5.2 PUT /api/settings
**Purpose**: Update user settings

**Request Body**:
```typescript
interface UpdateSettings {
  showImagesAfterInterest?: boolean
  showPhoneAfterInterest?: boolean
  isProfileHidden?: boolean
}
```

#### 6.5.3 DELETE /api/profile
**Purpose**: Delete user profile and all associated data

**Request Body**:
```typescript
interface DeleteProfile {
  confirmation: string // Must be "DELETE"
  reason?: string // Optional reason for deletion
}
```

**Response**:
```typescript
interface DeleteProfileResponse {
  success: boolean
  message: string
  deletedAt: string
}
```

## 7. Admin Features

### 7.1 Payment Management
- **Payment Queue**: List of pending payment approvals
- **Payment History**: Complete payment transaction history
- **Approval Actions**: Approve/reject payments with notes
- **User Communication**: Direct communication tools for payment queries
- **Reporting**: Payment analytics and reporting

### 7.2 Profile Management
- **Profile Verification**: Review and approve new profiles
- **User Management**: Block/unblock users
- **Content Moderation**: Review and moderate user content
- **Analytics**: User engagement and profile completion metrics

### 7.3 System Analytics
- **User Activity**: Track user engagement and behavior
- **Filter Usage**: Most popular filters and search terms
- **Interaction Patterns**: Interest success rates and user preferences
- **Performance Metrics**: API response times and system health

## 8. Performance Requirements

### 8.1 Page Load Performance
- **Initial Load**: Dashboard and profiles page must load within 2 seconds
- **Filter Application**: Filter results must update within 500ms
- **Infinite Scroll**: New batch loading within 1 second
- **Image Loading**: Progressive loading with optimization

### 8.2 Database Performance
- **Query Optimization**: All profile queries must execute under 100ms
- **Index Strategy**: Proper indexing for all filter combinations
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Efficient database connection management

### 8.3 Scalability Requirements
- **Concurrent Users**: Support 1000+ concurrent users
- **Profile Scaling**: Handle 10,000+ profiles efficiently
- **Filter Performance**: Maintain performance with complex filter combinations
- **API Rate Limiting**: Prevent abuse with appropriate rate limits

## 9. Mobile Responsiveness

### 9.1 Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### 9.2 Mobile-Specific Features
- **Touch Gestures**: Swipe navigation for image galleries
- **Collapsible Filters**: Modal/drawer for filter panel
- **Optimized Cards**: Single column layout with touch-friendly buttons
- **Pull-to-Refresh**: Refresh functionality for profile lists
- **Offline Support**: Basic offline functionality for viewed profiles

### 9.3 Progressive Web App (PWA)
- **Service Worker**: Caching strategy for offline functionality
- **App Manifest**: PWA installation capability
- **Push Notifications**: Interest and message notifications
- **Background Sync**: Sync interactions when back online

## 10. Security & Privacy

### 10.1 Data Protection
- **Contact Information**: Phone numbers hidden until interest acceptance
- **Image Security**: Secure image serving with access controls
- **Profile Privacy**: Granular privacy controls for profile sections
- **Data Encryption**: Sensitive data encryption at rest and in transit

### 10.2 Anti-Spam Measures
- **Interest Limits**: Daily limits on interests and interactions
- **Profile Verification**: Admin verification prevents fake profiles
- **Reporting System**: User reporting for inappropriate behavior
- **Automated Detection**: Pattern detection for spam behavior

### 10.3 Payment Security
- **Offline Processing**: No payment data stored in system
- **Proof Verification**: Admin verification of payment proofs
- **Audit Trail**: Complete audit trail for all payment actions
- **Fraud Prevention**: Multiple verification steps

## 11. Future Enhancements

### 11.1 Advanced Matching Algorithm
- **Compatibility Scoring**: AI-based compatibility matching
- **Behavioral Learning**: Machine learning from user interactions
- **Preference Evolution**: Dynamic preference updates based on behavior
- **Success Rate Optimization**: Algorithm optimization based on successful matches

### 11.2 Communication Features
- **In-App Messaging**: Secure messaging system after interest acceptance
- **Video Calls**: Integrated video calling functionality
- **Chat History**: Message history and management
- **Media Sharing**: Secure photo and file sharing

### 11.3 Enhanced Search & Discovery
- **AI-Powered Search**: Natural language search queries
- **Visual Search**: Search by photo similarity
- **Voice Search**: Voice-activated search functionality
- **Smart Recommendations**: Context-aware profile recommendations

### 11.4 Social Features
- **Success Stories**: Platform for sharing success stories
- **Community Groups**: Faith-based community groups
- **Events**: Church events and meetup integration
- **Referral System**: Friend referral rewards

### 11.5 Premium Features
- **Priority Listing**: Premium profile visibility
- **Advanced Filters**: Additional filter options for premium users
- **Read Receipts**: Message read status
- **Profile Boost**: Temporary profile highlighting

## 12. Success Metrics

### 12.1 User Engagement
- **Profile Completion Rate**: >90% of registered users complete profiles
- **Payment Completion Rate**: >80% of completed profiles make payment
- **Daily Active Users**: Target 60% of paid users active daily
- **Session Duration**: Average session >15 minutes
- **Profile View Rate**: Average 50+ profile views per session

### 12.2 Quality Metrics
- **Profile Verification Success**: >95% profiles approved on first review
- **Payment Approval Rate**: >90% payments approved within 24 hours
- **User Satisfaction**: >4.5/5 average rating
- **Match Success Rate**: Target 15% interest acceptance rate

### 12.3 Technical Metrics
- **Page Load Speed**: <2 seconds for all main pages
- **Filter Response Time**: <500ms for all filter operations
- **API Response Time**: <100ms for 95% of requests
- **Uptime**: 99.9% system availability
- **Error Rate**: <0.1% error rate on critical operations

### 12.4 Business Metrics
- **Conversion Rate**: Registration to payment >20%
- **User Retention**: 70% users active after 30 days
- **Feature Usage**: Filters used in >80% of profile browsing sessions
- **Support Tickets**: <5% users require payment support

## 13. Technical Implementation Notes

### 13.1 Database Optimization
- **Composite Indexing**: Multi-column indexes for filter combinations
- **Partial Indexes**: Indexes only on active, verified profiles
- **Query Optimization**: Optimized queries for all filter scenarios
- **Connection Pooling**: Efficient database connection management

### 13.2 Caching Strategy
- **Profile Data**: Cache frequently accessed profiles for 1 hour
- **Filter Results**: Cache popular filter combinations for 30 minutes
- **User Interactions**: Cache user's shortlists and interests
- **Static Data**: Cache dropdown options and filter metadata

### 13.3 Image Optimization
- **Multiple Sizes**: Generate multiple image sizes for different use cases
- **Lazy Loading**: Load images only when needed
- **CDN Integration**: Use CDN for image delivery
- **Compression**: Optimize image compression for web delivery

### 13.4 Error Handling
- **Graceful Degradation**: Fallback UI when features fail
- **Retry Logic**: Automatic retry for failed requests
- **Error Boundaries**: React error boundaries for component failures
- **User Feedback**: Clear error messages and recovery actions

This comprehensive PRD now includes detailed specifications for the Profiles List page with advanced filtering, infinite scrolling, and mobile-responsive design. The document covers all aspects from technical implementation to business requirements, providing a complete foundation for development.