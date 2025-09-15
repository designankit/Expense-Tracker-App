import { supabase } from './supabaseClient'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/database'

export class ProfileService {
  /**
   * Get user profile by user ID
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  /**
   * Create a new user profile
   */
  static async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  }

  /**
   * Get or create user profile
   */
  static async getOrCreateProfile(userId: string, userData?: { full_name?: string; avatar_url?: string }): Promise<Profile | null> {
    // Try to get existing profile
    let profile = await this.getProfile(userId)
    
    if (!profile) {
      // Create new profile if it doesn't exist
      const newProfile: ProfileInsert = {
        id: userId,
        full_name: userData?.full_name || null,
        avatar_url: userData?.avatar_url || null,
      }
      profile = await this.createProfile(newProfile)
    }

    return profile
  }

  /**
   * Update profile from auth user metadata
   */
  static async updateProfileFromAuth(userId: string, metadata: any): Promise<Profile | null> {
    const updates: ProfileUpdate = {}
    
    if (metadata?.full_name) {
      updates.full_name = metadata.full_name
    }
    
    if (metadata?.avatar_url) {
      updates.avatar_url = metadata.avatar_url
    }

    if (Object.keys(updates).length > 0) {
      return await this.updateProfile(userId, updates)
    }

    return await this.getProfile(userId)
  }
}
