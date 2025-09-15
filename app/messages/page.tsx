import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MessagingInterface } from "@/components/messaging-interface"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's messages (both sent and received)
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name),
      recipient:profiles!messages_recipient_id_fkey(id, full_name)
    `,
    )
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Get all profiles for compose functionality
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .neq("id", user.id)
    .order("full_name", { ascending: true })

  if (messagesError || profilesError) {
    console.error("Error fetching data:", messagesError || profilesError)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MessagingInterface
        messages={messages || []}
        profiles={profiles || []}
        currentUserId={user.id}
        preSelectedRecipient={params.to}
      />
    </div>
  )
}
