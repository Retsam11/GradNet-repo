import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all announcements
  const { data: announcements, error: announcementsError } = await supabase
    .from("announcements")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })

  if (announcementsError) {
    console.error("Error fetching announcements:", announcementsError)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Announcements List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement: any) => (
              <Card key={announcement.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">{announcement.title}</CardTitle>
                  <CardDescription>
                    By {announcement.profiles?.full_name} • {formatDate(announcement.created_at)}
                    {announcement.updated_at !== announcement.created_at && " (edited)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <CardTitle className="text-gray-600 dark:text-gray-400 mb-2">No announcements yet</CardTitle>
                <CardDescription>Check back later for updates from the administration.</CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
