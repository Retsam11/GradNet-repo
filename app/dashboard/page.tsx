import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, MessageSquare, Bell, LogOut, Settings } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get recent announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(3)

  // Get unread messages count
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AlmaConnect</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {profile?.full_name || user.email}
            </span>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to your dashboard, {profile?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with alumni, find mentors, and stay updated with your network.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Alumni Directory</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="mb-4">Browse and connect with alumni</CardDescription>
              <Button asChild className="w-full">
                <Link href="/directory">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="mb-4">
                {unreadCount ? `${unreadCount} unread messages` : "No new messages"}
              </CardDescription>
              <Button asChild className="w-full">
                <Link href="/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <Bell className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="mb-4">Latest news and updates</CardDescription>
              <Button asChild className="w-full">
                <Link href="/announcements">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <GraduationCap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <CardDescription className="mb-4">Update your information</CardDescription>
              <Button asChild className="w-full">
                <Link href="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard Link */}
          {profile?.is_admin && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-3">
                <Settings className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="mb-4">Manage users and announcements</CardDescription>
                <Button asChild className="w-full">
                  <Link href="/admin">Admin Panel</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Announcements */}
        {announcements && announcements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement: any) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {announcement.content.substring(0, 150)}
                      {announcement.content.length > 150 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      By {announcement.profiles?.full_name} • {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
