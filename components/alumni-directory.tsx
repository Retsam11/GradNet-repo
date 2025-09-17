"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap, MapPin, Building, Search, MessageSquare, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
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
  created_at: string
  updated_at: string
}

interface AlumniDirectoryProps {
  profiles: Profile[]
  currentUserId: string
}

export function AlumniDirectory({ profiles, currentUserId }: AlumniDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [graduationYearFilter, setGraduationYearFilter] = useState<string>("all")
  const [mentorFilter, setMentorFilter] = useState<string>("all")
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Get unique graduation years for filter
  const graduationYears = useMemo(() => {
    const years = profiles
      .map((p) => p.graduation_year)
      .filter((year): year is number => year !== null)
      .sort((a, b) => b - a)
    return [...new Set(years)]
  }, [profiles])

  // Filter profiles based on search and filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      // Exclude current user
      if (profile.id === currentUserId) return false

      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.current_position?.toLowerCase().includes(searchTerm.toLowerCase())

      // Graduation year filter
      const matchesYear = graduationYearFilter === "all" || profile.graduation_year?.toString() === graduationYearFilter

      // Mentor filter
      const matchesMentor =
        mentorFilter === "all" ||
        (mentorFilter === "mentors" && profile.is_mentor) ||
        (mentorFilter === "non-mentors" && !profile.is_mentor)

      return matchesSearch && matchesYear && matchesMentor
    })
  }, [profiles, searchTerm, graduationYearFilter, mentorFilter, currentUserId])

  const handleSendMessage = async (recipientId: string) => {
    setIsLoading(true)
    try {
      // Navigate to messages page with recipient pre-selected
      router.push(`/messages?to=${recipientId}`)
    } catch (error) {
      console.error("Error navigating to messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (selectedProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setSelectedProfile(null)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alumni Profile</h1>
          </div>
        </div>

        {/* Profile Details */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedProfile.profile_picture || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {getInitials(selectedProfile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-3xl">{selectedProfile.full_name}</CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                {selectedProfile.is_mentor && <Badge className="bg-green-100 text-green-800">Mentor</Badge>}
                {selectedProfile.is_admin && <Badge className="bg-purple-100 text-purple-800">Admin</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Professional Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Information</h3>
                  {selectedProfile.current_position && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{selectedProfile.current_position}</span>
                    </div>
                  )}
                  {selectedProfile.current_company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">at {selectedProfile.current_company}</span>
                    </div>
                  )}
                  {selectedProfile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{selectedProfile.location}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
                  {selectedProfile.graduation_year && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Class of {selectedProfile.graduation_year}
                      </span>
                    </div>
                  )}
                  {selectedProfile.degree && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{selectedProfile.degree}</span>
                    </div>
                  )}
                  {selectedProfile.major && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">Major: {selectedProfile.major}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedProfile.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedProfile.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  onClick={() => handleSendMessage(selectedProfile.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {isLoading ? "Loading..." : "Send Message"}
                </Button>
                {selectedProfile.linkedin_url && (
                  <Button variant="outline" asChild>
                    <a href={selectedProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      View LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alumni Directory</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Alumni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, major, company, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={graduationYearFilter} onValueChange={setGraduationYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Graduation Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {graduationYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mentorFilter} onValueChange={setMentorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mentor Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alumni</SelectItem>
                <SelectItem value="mentors">Mentors Only</SelectItem>
                <SelectItem value="non-mentors">Non-Mentors</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredProfiles.length} of {profiles.length - 1} alumni
        </p>
      </div>

      {/* Alumni Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <Card
            key={profile.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedProfile(profile)}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.profile_picture || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-lg">{profile.full_name}</CardTitle>
              <div className="flex justify-center gap-1 mt-2">
                {profile.is_mentor && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Mentor
                  </Badge>
                )}
                {profile.graduation_year && (
                  <Badge variant="outline" className="text-xs">
                    {profile.graduation_year}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                {profile.current_position && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{profile.current_position}</span>
                  </div>
                )}
                {profile.current_company && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{profile.current_company}</span>
                  </div>
                )}
                {profile.major && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{profile.major}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{profile.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSendMessage(profile.id)
                  }}
                  disabled={isLoading}
                >
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-gray-600 dark:text-gray-400 mb-2">No alumni found</CardTitle>
            <CardDescription>Try adjusting your search criteria or filters.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
