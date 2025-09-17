import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, MessageSquare, Briefcase } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-red-250 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GradNet</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
            Connect with Your Alumni Network
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-pretty">
            Bridge the gap between students and alumni. Find mentors, discover opportunities, and build meaningful
            connections that last a lifetime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Alumni Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse and connect with alumni from your institution across different graduation years and industries.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Direct Messaging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send private messages to alumni and fellow students to build professional relationships.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Briefcase className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Mentorship</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find experienced mentors in your field or offer to mentor current students.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stay updated with the latest news, events, and opportunities from your institution.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to Connect?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of alumni and students building meaningful professional relationships.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">Join GradNet Today</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 GradNet. Connecting alumni and students worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
