"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signIn } from "next-auth/react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const handleGoogleSignIn = () => {
    // Don't specify callbackUrl, let the middleware handle the redirect
    signIn("google")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Faith Matrimony</CardTitle>
          <CardDescription>
            Sign in with Google to view matrimony profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              Login with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
