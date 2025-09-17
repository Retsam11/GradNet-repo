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

  const { data: rawMessages, error: messagesError } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  const { data: allProfiles, error: allProfilesError } = await supabase.from("profiles").select("id, full_name, email")

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .neq("id", user.id)
    .order("full_name", { ascending: true })

  if (messagesError || profilesError || allProfilesError) {
    console.error("Error fetching data:", messagesError || profilesError || allProfilesError)
  }

  const messages =
    rawMessages?.map((message) => {
      const senderProfile = allProfiles?.find((p) => p.id === message.sender_id)
      const recipientProfile = allProfiles?.find((p) => p.id === message.recipient_id)

      return {
        ...message,
        sender_profile: senderProfile,
        recipient_profile: recipientProfile,
      }
    }) || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MessagingInterface
        messages={messages}
        profiles={profiles || []}
        currentUserId={user.id}
        preSelectedRecipient={params.to}
      />
    </div>
  )
}
