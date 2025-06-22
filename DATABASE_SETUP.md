# Database Setup Guide

This guide will help you set up PostgreSQL locally and configure Supabase for production.

## Prerequisites

- Node.js installed
- Docker and Docker Compose installed
- PostgreSQL Docker image (already pulled)
- Supabase account (for production)

## Local Development Setup

### 1. Run PostgreSQL with Docker

Since you already have the PostgreSQL Docker image pulled, let's start a PostgreSQL container:

```bash
# Run PostgreSQL container
docker run --name faith-matrimony-db \
  -e POSTGRES_DB=faith_matrimony \
  -e POSTGRES_USER=matrimony_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:latest

# Verify the container is running
docker ps
```

**Alternative using docker-compose (recommended):**

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:latest
    container_name: faith-matrimony-db
    environment:
      POSTGRES_DB: faith_matrimony
      POSTGRES_USER: matrimony_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Then run:
```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down
```

### 2. Database Management Commands

```bash
# Connect to the running PostgreSQL container
docker exec -it faith-matrimony-db psql -U matrimony_user -d faith_matrimony

# Or connect using psql if you have it installed locally
psql -h localhost -p 5432 -U matrimony_user -d faith_matrimony

# View container logs
docker logs faith-matrimony-db

# Stop the container
docker stop faith-matrimony-db

# Start the container again
docker start faith-matrimony-db

# Remove the container (data will be lost unless using volumes)
docker rm faith-matrimony-db
```

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL="postgresql://matrimony_user:your_password@localhost:5432/faith_matrimony?schema=public"

# Environment
NODE_ENV="development"

# Google OAuth (add these when setting up authentication)
# GOOGLE_CLIENT_ID="your_google_client_id"
# GOOGLE_CLIENT_SECRET="your_google_client_secret"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your_nextauth_secret"
```

### 4. Run Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Create and run migration
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

## Production Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and database password

### 2. Get Connection String

1. Go to Settings > Database in your Supabase dashboard
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

### 3. Update Production Environment

For production deployment, update your environment variables:

```env
DATABASE_URL="postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres"
NODE_ENV="production"
```

### 4. Deploy Database Schema

```bash
# Deploy migrations to production
npm run db:deploy
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Create and run migration
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (development only)

## User Model Schema

The User model includes the following fields:

- `id` - Unique identifier (CUID)
- `uid` - Google UID (unique)
- `email` - User email (unique)
- `name` - Display name (optional)
- `picture` - Profile picture URL (optional)
- `emailVerified` - Email verification status
- `lastLoggedInAt` - Last login timestamp
- `loginCount` - Number of times user has logged in
- `isActive` - Account active status
- `isBlocked` - Account blocked status
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

## Usage Examples

```typescript
import { UserService } from '@/lib/services/user'

// Create a new user
const user = await UserService.createUser({
  uid: 'google_uid_here',
  email: 'user@example.com',
  name: 'John Doe',
  picture: 'https://example.com/photo.jpg'
})

// Find user by Google UID
const user = await UserService.findByUid('google_uid_here')

// Update login information
await UserService.updateUserLogin('google_uid_here')
```

## Next Steps

1. Set up your local PostgreSQL database
2. Create and configure your `.env` file
3. Run the initial migration
4. Set up Google OAuth for authentication
5. Configure Supabase for production deployment 