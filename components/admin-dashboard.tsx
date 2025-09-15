"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Users, MessageSquare, Bell, Plus, Edit, Trash2, ArrowLeft, BarChart3, UserCheck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminStats {
  totalUsers: number
  totalMessages: number
  totalAnnouncements: number
  mentorCount: number
}

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
  graduation_year: number | null
  is_mentor: boolean
}

interface Announcement {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  updated_at: string
  profiles: { full_name: string }
}

interface AdminDashboardProps {
  stats: AdminStats
  recentUsers: User[]
  announcements: Announcement[]
  currentUserId: string
}

export function AdminDashboard({ stats, recentUsers, announcements, currentUserId }: AdminDashboardProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  })
  const router = useRouter()

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("announcements").insert({
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim(),
        author_id: currentUserId,
      })

      if (error) throw error

      setAnnouncementForm({ title: "", content: "" })
      setIsCreateDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error creating announcement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !announcementForm.title.trim() || !announcementForm.content.trim()) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("announcements")
        .update({
          title: announcementForm.title.trim(),
          content: announcementForm.content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingAnnouncement.id)

      if (error) throw error

      setAnnouncementForm({ title: "", content: "" })
      setEditingAnnouncement(null)
      router.refresh()
    } catch (error) {
      console.error("Error updating announcement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("announcements").delete().eq("id", announcementId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting announcement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
    })
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
    return new Date(dateString).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered alumni and students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Total platform messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Published announcements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mentorCount}</div>
            <p className="text-xs text-muted-foreground">Available for mentorship</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Announcements</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>Share important news and updates with all users.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Title</label>
                    <Input
                      placeholder="Announcement title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Content</label>
                    <Textarea
                      placeholder="Write your announcement content..."
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateAnnouncement}
                      disabled={isLoading || !announcementForm.title.trim() || !announcementForm.content.trim()}
                    >
                      {isLoading ? "Creating..." : "Create Announcement"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription>
                        By {announcement.profiles.full_name} • {formatDate(announcement.created_at)}
                        {announcement.updated_at !== announcement.created_at && " (edited)"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(announcement)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="flex items-center gap-1 text-red-600">
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </CardContent>
              </Card>
            ))}

            {announcements.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-600 dark:text-gray-400 mb-2">No announcements yet</CardTitle>
                  <CardDescription>Create your first announcement to share news with users.</CardDescription>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Edit Announcement</DialogTitle>
                <DialogDescription>Update the announcement content.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Title</label>
                  <Input
                    placeholder="Announcement title"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Content</label>
                  <Textarea
                    placeholder="Write your announcement content..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpdateAnnouncement}
                    disabled={isLoading || !announcementForm.title.trim() || !announcementForm.content.trim()}
                  >
                    {isLoading ? "Updating..." : "Update Announcement"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Users</h2>
          <Card>
            <CardHeader>
              <CardTitle>Latest Registrations</CardTitle>
              <CardDescription>Most recently joined users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                        {user.is_mentor && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Mentor
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Joined {formatDate(user.created_at)}</span>
                        {user.graduation_year && <span>Class of {user.graduation_year}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Platform Analytics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                  <span className="font-semibold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Mentors</span>
                  <span className="font-semibold">{stats.mentorCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mentor Percentage</span>
                  <span className="font-semibold">
                    {stats.totalUsers > 0 ? Math.round((stats.mentorCount / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Messages</span>
                  <span className="font-semibold">{stats.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Announcements</span>
                  <span className="font-semibold">{stats.totalAnnouncements}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Messages per User</span>
                  <span className="font-semibold">
                    {stats.totalUsers > 0 ? Math.round(stats.totalMessages / stats.totalUsers) : 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
