import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AlumniDirectory } from "@/components/alumni-directory"

export default async function DirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get all alumni profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true })

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AlumniDirectory profiles={profiles || []} currentUserId={user.id} />
    </div>
  )
}
