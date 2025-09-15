# Database Setup Guide

## 📋 Profiles Table Migration

I've created a comprehensive profiles table setup for your Supabase project. Here's what you need to do:

### 🗄️ **Database Schema Created**

The migration includes:

1. **Profiles Table**:
   ```sql
   create table if not exists profiles (
     id uuid references auth.users(id) primary key,
     full_name text,
     avatar_url text,
     created_at timestamp with time zone default now()
   );
   ```

2. **Row Level Security (RLS)**:
   - Users can only view, update, and insert their own profiles
   - Secure by default with proper access controls

3. **Automatic Profile Creation**:
   - Trigger function that automatically creates a profile when a user signs up
   - Extracts `full_name` and `avatar_url` from OAuth providers

### 🚀 **How to Apply the Migration**

#### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/xeatiyqxxoqgzvlbcscp

2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration**:
   - Copy the contents of `supabase/migrations/001_create_profiles_table.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

#### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your project
supabase link --project-ref xeatiyqxxoqgzvlbcscp

# Apply the migration
supabase db push
```

### 🔧 **What the Migration Does**

1. **Creates the profiles table** with proper foreign key relationship to auth.users
2. **Enables Row Level Security** for data protection
3. **Creates security policies**:
   - Users can view their own profile
   - Users can update their own profile
   - Users can insert their own profile
4. **Sets up automatic profile creation**:
   - When a user signs up, a profile is automatically created
   - Extracts name and avatar from OAuth providers (Google, GitHub)

### 📝 **TypeScript Integration**

I've also created:

1. **Database Types** (`src/types/database.ts`):
   - TypeScript definitions for the profiles table
   - Type-safe database operations

2. **Profile Service** (`src/lib/profile.ts`):
   - Utility functions for profile management
   - Methods for CRUD operations on profiles

3. **Updated Supabase Client**:
   - Now uses typed database for better development experience

### 🎯 **Next Steps After Migration**

1. **Apply the migration** using one of the methods above
2. **Test the setup**:
   - Sign up a new user
   - Check if a profile is automatically created
   - Verify the profile data in the Supabase dashboard

3. **Update your app** to use profile data:
   - The header already shows user information
   - You can now fetch and display profile data from the database

### 🔍 **Verifying the Setup**

After running the migration, you can verify it worked by:

1. **Check the Table**:
   - Go to "Table Editor" in Supabase dashboard
   - You should see the `profiles` table

2. **Test Profile Creation**:
   - Sign up a new user
   - Check the `profiles` table for the new entry

3. **Check Policies**:
   - Go to "Authentication" → "Policies"
   - You should see the RLS policies for the profiles table

### 🚨 **Important Notes**

- **Backup First**: Always backup your database before running migrations
- **Test Environment**: Consider testing on a development project first
- **OAuth Data**: The trigger extracts `full_name` and `avatar_url` from OAuth providers automatically

The profiles table is now ready to store user information and will automatically create profiles for new users! 🎉
