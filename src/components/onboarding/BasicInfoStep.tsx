"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Camera, 
  Mail, 
  Loader2
} from "lucide-react"

interface BasicInfoStepProps {
  data: unknown
  onNext: (data?: unknown) => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
  isLoading: boolean
}

export default function BasicInfoStep({ data, onNext, onSkip, isLoading }: BasicInfoStepProps) {
  const dataObj = data as Record<string, unknown>
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    full_name: (dataObj?.full_name as string) || '',
    email: user?.email || (dataObj?.email as string) || ''
  })
  const [avatarUrl, setAvatarUrl] = useState((dataObj?.avatar_url as string) || '')
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !supabase || !user) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleNext = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name to continue.",
        variant: "destructive",
      })
      return
    }

    onNext({
      full_name: formData.full_name.trim(),
      avatar_url: avatarUrl || null
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let&apos;s personalize your expense tracking experience
        </p>
      </div>

      {/* Profile Picture Upload */}
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  {formData.full_name ? getInitials(formData.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                Profile Picture
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a photo to personalize your account
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="full_name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="h-12"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pre-filled from your account. You can update it here.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
          disabled={isLoading || isUploading}
        >
          Skip for now
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || isUploading || !formData.full_name.trim()}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
