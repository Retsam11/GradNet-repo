"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, ArrowLeft, Plus, Search, Mail, Reply } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  is_read: boolean
  created_at: string
  sender: { id: string; full_name: string }
  recipient: { id: string; full_name: string }
}

interface Profile {
  id: string
  full_name: string
  email: string
}

interface MessagingInterfaceProps {
  messages: Message[]
  profiles: Profile[]
  currentUserId: string
  preSelectedRecipient?: string
}

type View = "inbox" | "sent" | "compose" | "conversation"

export function MessagingInterface({
  messages,
  profiles,
  currentUserId,
  preSelectedRecipient,
}: MessagingInterfaceProps) {
  const [currentView, setCurrentView] = useState<View>("inbox")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [composeData, setComposeData] = useState({
    recipient_id: preSelectedRecipient || "",
    subject: "",
    content: "",
  })
  const router = useRouter()

  // Set compose view if pre-selected recipient
  useEffect(() => {
    if (preSelectedRecipient) {
      setCurrentView("compose")
      setComposeData((prev) => ({ ...prev, recipient_id: preSelectedRecipient }))
    }
  }, [preSelectedRecipient])

  // Group messages by conversation (sender/recipient pairs)
  const conversations = useMemo(() => {
    const convMap = new Map<string, Message[]>()

    messages.forEach((message) => {
      const otherUserId = message.sender_id === currentUserId ? message.recipient_id : message.sender_id
      const key = otherUserId

      if (!convMap.has(key)) {
        convMap.set(key, [])
      }
      convMap.get(key)!.push(message)
    })

    // Convert to array and sort by latest message
    return Array.from(convMap.entries())
      .map(([otherUserId, msgs]) => {
        const sortedMsgs = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const latestMessage = sortedMsgs[0]
        const otherUser = latestMessage.sender_id === currentUserId ? latestMessage.recipient : latestMessage.sender
        const unreadCount = msgs.filter((m) => m.recipient_id === currentUserId && !m.is_read).length

        return {
          otherUserId,
          otherUser,
          messages: sortedMsgs,
          latestMessage,
          unreadCount,
        }
      })
      .sort((a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime())
  }, [messages, currentUserId])

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations
    return conversations.filter(
      (conv) =>
        conv.otherUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.latestMessage.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.latestMessage.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [conversations, searchTerm])

  // Get inbox messages (received)
  const inboxMessages = useMemo(() => {
    return messages
      .filter((m) => m.recipient_id === currentUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [messages, currentUserId])

  // Get sent messages
  const sentMessages = useMemo(() => {
    return messages
      .filter((m) => m.sender_id === currentUserId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [messages, currentUserId])

  const handleSendMessage = async () => {
    if (!composeData.recipient_id || !composeData.subject.trim() || !composeData.content.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        recipient_id: composeData.recipient_id,
        subject: composeData.subject.trim(),
        content: composeData.content.trim(),
      })

      if (error) throw error

      // Reset form and refresh
      setComposeData({ recipient_id: "", subject: "", content: "" })
      setCurrentView("inbox")
      router.refresh()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const supabase = createClient()
      await supabase.from("messages").update({ is_read: true }).eq("id", messageId)
      router.refresh()
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const handleReply = (message: Message) => {
    setComposeData({
      recipient_id: message.sender_id,
      subject: message.subject.startsWith("Re: ") ? message.subject : `Re: ${message.subject}`,
      content: "",
    })
    setCurrentView("compose")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Conversation view
  if (currentView === "conversation" && selectedConversation) {
    const conversation = conversations.find((c) => c.otherUserId === selectedConversation)
    if (!conversation) return null

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setCurrentView("inbox")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(conversation.otherUser.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {conversation.otherUser.full_name}
              </h2>
              <p className="text-sm text-gray-500">{conversation.messages.length} messages</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {conversation.messages.map((message) => {
            const isFromCurrentUser = message.sender_id === currentUserId
            return (
              <Card key={message.id} className={`${isFromCurrentUser ? "ml-12" : "mr-12"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                          {getInitials(isFromCurrentUser ? "You" : message.sender.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{isFromCurrentUser ? "You" : message.sender.full_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(message.created_at)}</p>
                      </div>
                    </div>
                    {!isFromCurrentUser && !message.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(message.id)}
                        className="text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <CardTitle className="text-lg">{message.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  {!isFromCurrentUser && (
                    <div className="mt-4 pt-4 border-t">
                      <Button size="sm" onClick={() => handleReply(message)} className="flex items-center gap-2">
                        <Reply className="h-3 w-3" />
                        Reply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Compose view
  if (currentView === "compose") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setCurrentView("inbox")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
          <div className="flex items-center gap-2">
            <Send className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compose Message</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>New Message</CardTitle>
              <CardDescription>Send a message to a fellow alumni or student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">To</label>
                <Select
                  value={composeData.recipient_id}
                  onValueChange={(value) => setComposeData((prev) => ({ ...prev, recipient_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Subject</label>
                <Input
                  placeholder="Enter subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Message</label>
                <Textarea
                  placeholder="Write your message..."
                  value={composeData.content}
                  onChange={(e) => setComposeData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={8}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    isLoading || !composeData.recipient_id || !composeData.subject.trim() || !composeData.content.trim()
                  }
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
                <Button variant="outline" onClick={() => setCurrentView("inbox")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main messages view (inbox/sent)
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCurrentView("compose")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Compose
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={currentView === "inbox" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentView("inbox")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Inbox
                {inboxMessages.filter((m) => !m.is_read).length > 0 && (
                  <Badge className="ml-auto bg-blue-600">{inboxMessages.filter((m) => !m.is_read).length}</Badge>
                )}
              </Button>
              <Button
                variant={currentView === "sent" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentView("sent")}
              >
                <Send className="h-4 w-4 mr-2" />
                Sent
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {currentView === "inbox" ? (
                    <>
                      <Mail className="h-5 w-5" />
                      Inbox ({inboxMessages.length})
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Sent ({sentMessages.length})
                    </>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {currentView === "inbox" &&
                  inboxMessages
                    .filter(
                      (message) =>
                        searchTerm === "" ||
                        message.sender.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        message.content.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                          !message.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                        onClick={() => {
                          setSelectedConversation(message.sender_id)
                          setCurrentView("conversation")
                          if (!message.is_read) {
                            handleMarkAsRead(message.id)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(message.sender.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className={`font-medium truncate ${!message.is_read ? "text-blue-600" : "text-gray-900 dark:text-white"}`}
                              >
                                {message.sender.full_name}
                              </p>
                              <div className="flex items-center gap-2">
                                {!message.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                              </div>
                            </div>
                            <p
                              className={`text-sm truncate mb-1 ${!message.is_read ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                {currentView === "sent" &&
                  sentMessages
                    .filter(
                      (message) =>
                        searchTerm === "" ||
                        message.recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        message.content.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((message) => (
                      <div
                        key={message.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedConversation(message.recipient_id)
                          setCurrentView("conversation")
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {getInitials(message.recipient.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                To: {message.recipient.full_name}
                              </p>
                              <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">{message.subject}</p>
                            <p className="text-sm text-gray-500 truncate">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                {((currentView === "inbox" && inboxMessages.length === 0) ||
                  (currentView === "sent" && sentMessages.length === 0)) && (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No messages {currentView === "inbox" ? "received" : "sent"} yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {currentView === "inbox"
                        ? "When alumni send you messages, they'll appear here."
                        : "Messages you send will appear here."}
                    </p>
                    <Button onClick={() => setCurrentView("compose")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Send your first message
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
