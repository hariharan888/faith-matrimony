# Faith Matrimony Application

A Next.js-based matrimony application for the Christian faith community.

## Architecture Overview

### Component Structure

The application follows a modern React architecture with:

- **Context/Provider Pattern**: Centralized state management using React Context
- **Component Composition**: Small, reusable components that compose larger features
- **TypeScript First**: Strict typing throughout the application
- **Form Management**: React Hook Form with Yup validation

### Key Components

#### My Profile Section
- **Provider**: `MyProfileFormProvider` - Manages all profile form state and actions
- **Hook**: `useMyProfileForm` - Exposes context data to child components
- **Layout**: Component-based layout with sidebar and main content areas
- **Forms**: Individual form components for each profile section

#### Component Hierarchy
```
app/my-profile/page.tsx
└── MyProfileFormProvider
    └── ProfileFormLayout
        ├── Sidebar
        │   ├── ProfileHeader
        │   ├── ProgressDisplay
        │   └── SectionNavigation
        └── FormRenderer
            ├── PrimaryDetailsForm
            ├── FamilyDetailsForm
            ├── SpiritualDetailsForm
            ├── PartnerPreferencesForm
            └── PhotosForm
```

### Project Structure

```
faith-matrimony/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── my-profile/           # Profile management pages
│   └── ...
├── components/               # Reusable components
│   ├── providers/            # Context providers
│   ├── my-profile/           # Profile-specific components
│   ├── profile-forms/        # Individual form components
│   └── ui/                   # Base UI components
├── types/                    # TypeScript type definitions
│   └── my-profile.ts         # Profile-related types
├── lib/                      # Utility libraries
└── prisma/                   # Database schema and migrations
```

### Design Principles

1. **Centralized State Management**: Use Context/Provider for complex state
2. **Component Composition**: Break large components into smaller, focused ones
3. **Proper Type Safety**: Avoid `any` types, use meaningful interfaces
4. **Data Flow**: Context for shared data, props only for component-specific data
5. **Single Responsibility**: Each component has one clear purpose

### Form Management

- **Validation**: Yup schemas defined in `lib/profile-config.ts`
- **State Management**: React Hook Form with controlled components
- **Type Safety**: Centralized types in `types/my-profile.ts`
- **Error Handling**: Consistent error display patterns

### API Design

- **Authentication**: NextAuth.js with custom middleware
- **Error Handling**: JSON responses for APIs, HTML redirects for pages
- **Type Safety**: Proper TypeScript interfaces for request/response

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Configure environment variables (see `.env.example`)

4. Run the development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Adding New Forms

1. Create type interface in `types/my-profile.ts`
2. Add validation schema to `lib/profile-config.ts`
3. Create form component in `components/profile-forms/`
4. Update `FormRenderer` to include new form
5. Add section to navigation configuration

### State Management

- Use `useMyProfileForm()` hook to access context data
- Avoid prop drilling by leveraging context
- Keep component-specific state local
- Use callbacks for actions that affect global state

### TypeScript Best Practices

- Define interfaces for all data structures
- Use `Record<string, unknown>` for flexible objects
- Avoid `any` types
- Use meaningful type names that describe the data

This architecture ensures maintainable, scalable code with clear separation of concerns and excellent developer experience.
