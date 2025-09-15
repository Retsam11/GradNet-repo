import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get admin statistics
  const [
    { count: totalUsers },
    { count: totalMessages },
    { count: totalAnnouncements },
    { count: mentorCount },
    { data: recentUsers },
    { data: announcements },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("announcements").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_mentor", true),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, graduation_year, is_mentor")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("announcements").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(10),
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminDashboard
        stats={{
          totalUsers: totalUsers || 0,
          totalMessages: totalMessages || 0,
          totalAnnouncements: totalAnnouncements || 0,
          mentorCount: mentorCount || 0,
        }}
        recentUsers={recentUsers || []}
        announcements={announcements || []}
        currentUserId={user.id}
      />
    </div>
  )
}
