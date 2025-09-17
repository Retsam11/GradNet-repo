"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, ArrowLeft, Save, Upload } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  full_name: string
  graduation_year: number | null
  degree: string | null
  major: string | null
  current_company: string | null
  current_position: string | null
  location: string | null
  bio: string | null
  linkedin_url: string | null
  is_mentor: boolean
  is_admin: boolean
  profile_picture: string | null
}

interface ProfileFormProps {
  profile: Profile | null
  userId: string
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    graduation_year: profile?.graduation_year?.toString() || "",
    degree: profile?.degree || "",
    major: profile?.major || "",
    current_company: profile?.current_company || "",
    current_position: profile?.current_position || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
    linkedin_url: profile?.linkedin_url || "",
    is_mentor: profile?.is_mentor || false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(profile?.profile_picture || "")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i + 10)

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const result = await response.json()
      setProfilePicture(result.url)
      setMessage({ type: "success", text: "Profile picture updated successfully!" })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to upload profile picture",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const updateData = {
        ...formData,
        graduation_year: formData.graduation_year ? Number.parseInt(formData.graduation_year) : null,
        updated_at: new Date().toISOString(),
        profile_picture: profilePicture,
      }

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: profile?.email || "",
        ...updateData,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Update Your Profile</CardTitle>
            <CardDescription>
              Keep your information up to date to help other alumni and students connect with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profilePicture || "/placeholder.svg"} alt="Profile picture" />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <Button type="button" variant="outline" disabled={isUploading} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Picture"}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">Max file size: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell other alumni about yourself, your interests, and what you're passionate about..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Select
                      value={formData.graduation_year}
                      onValueChange={(value) => handleInputChange("graduation_year", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      placeholder="e.g., Bachelor of Science"
                      value={formData.degree}
                      onChange={(e) => handleInputChange("degree", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="major">Major/Field of Study</Label>
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science"
                    value={formData.major}
                    onChange={(e) => handleInputChange("major", e.target.value)}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="current_position">Current Position</Label>
                    <Input
                      id="current_position"
                      placeholder="e.g., Software Engineer"
                      value={formData.current_position}
                      onChange={(e) => handleInputChange("current_position", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_company">Current Company</Label>
                    <Input
                      id="current_company"
                      placeholder="e.g., Google"
                      value={formData.current_company}
                      onChange={(e) => handleInputChange("current_company", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedin_url}
                      onChange={(e) => handleInputChange("linkedin_url", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Mentorship */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mentorship</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_mentor"
                    checked={formData.is_mentor}
                    onCheckedChange={(checked) => handleInputChange("is_mentor", checked as boolean)}
                  />
                  <Label htmlFor="is_mentor" className="text-sm">
                    I&apos;m available to mentor current students and recent graduates
                  </Label>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
