import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { UserService } from "@/lib/services/user"
import { ProfileService } from "@/lib/services/profile"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        try {
          // Check if user exists
          const existingUser = await UserService.findByUid(profile.sub)
          
          if (existingUser) {
            // Update login information
            await UserService.updateUserLogin(profile.sub)
            
            // Update profile if changed
            if (user.name !== existingUser.name || user.image !== existingUser.picture) {
              await UserService.updateProfile(profile.sub, {
                name: user.name || undefined,
                picture: user.image || undefined,
              })
            }
          } else {
            // Create new user
            await UserService.createUser({
              uid: profile.sub,
              email: user.email!,
              name: user.name || undefined,
              picture: user.image || undefined,
              emailVerified: true, // Google accounts are considered verified
            })
          }
          
          return true
        } catch (error) {
          console.error("Error during sign in:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        token.uid = profile.sub
      }
      
      // Always update profile status for real-time updates
      if (token.uid) {
        try {
          const user = await UserService.findByUid(token.uid as string)
          if (user) {
            const hasProfile = await ProfileService.getProfileByUserId(user.id)
            const isProfileComplete = hasProfile ? await ProfileService.isProfileComplete(user.id) : false
            
            token.hasProfile = !!hasProfile
            token.isProfileComplete = isProfileComplete
          }
        } catch (error) {
          console.error('Error checking profile status in JWT:', error)
          // Set defaults on error
          token.hasProfile = false
          token.isProfileComplete = false
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token.uid) {
        session.user.uid = token.uid as string
        session.user.hasProfile = token.hasProfile
        session.user.isProfileComplete = token.isProfileComplete
      }
      return session
    },
    async redirect({ baseUrl }) {
      // Always redirect to the base URL after sign in
      // The middleware will handle the proper redirect based on profile completion
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
  },
}

declare module "next-auth" {
  interface Session {
    user: {
      uid: string
      name?: string | null
      email?: string | null
      image?: string | null
      hasProfile?: boolean
      isProfileComplete?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
    hasProfile?: boolean
    isProfileComplete?: boolean
  }
} 