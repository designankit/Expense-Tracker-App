import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase Client: Creating client with URL:', supabaseUrl)
console.log('Supabase Client: Anon key exists:', !!supabaseAnonKey)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
