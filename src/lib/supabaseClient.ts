import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Supabase Client: Creating client with URL:', supabaseUrl)
console.log('Supabase Client: Anon key exists:', !!supabaseAnonKey)
console.log('Supabase Client: Environment check - URL is placeholder:', supabaseUrl === 'https://placeholder.supabase.co')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
