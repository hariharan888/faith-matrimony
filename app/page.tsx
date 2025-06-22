import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  // If user is logged in, redirect based on profile completion
  if (session?.user) {
    if (!session.user.hasProfile || !session.user.isProfileComplete) {
      redirect("/my-profile")
    } else {
      redirect("/dashboard")
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              Faith Matrimony
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Find your life partner in faith. Connect with Christian singles who share your values and beliefs.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Sign In
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">💒</div>
                <h3 className="text-xl font-semibold mb-2">Faith-Centered</h3>
                <p className="text-gray-600">Connect with people who share your Christian faith and values</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
                <p className="text-gray-600">All profiles are verified to ensure authentic connections</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">💕</div>
                <h3 className="text-xl font-semibold mb-2">Meaningful Relationships</h3>
                <p className="text-gray-600">Find someone special for a lifelong journey together</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
