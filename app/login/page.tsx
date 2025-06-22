import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function Page() {
  const session = await getServerSession(authOptions)
  
  // If user is already logged in, redirect based on profile completion
  if (session?.user) {
    if (!session.user.hasProfile || !session.user.isProfileComplete) {
      redirect("/my-profile")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
