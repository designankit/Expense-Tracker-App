# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your expense tracker app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `expense-tracker-app`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase project URL and anon key.

## 4. Enable Authentication Providers

### Email/Password Authentication
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under "Auth Providers", ensure **Email** is enabled
3. Configure email templates if needed

### Google OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. You'll need to:
   - Create a Google Cloud Console project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Copy Client ID and Client Secret to Supabase

### GitHub OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **GitHub**
3. You'll need to:
   - Create a GitHub OAuth App
   - Set Authorization callback URL to: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## 5. Configure Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     - `http://localhost:3000/**` (for development)
     - `https://yourdomain.com/**` (for production)

## 6. Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. You should be redirected to the landing page
4. Try signing up with email/password
5. Check your email for the confirmation link
6. Try logging in
7. Test the logout functionality

## 7. Enable Route Protection (Optional)

The app includes a simple middleware for route protection. To enable full authentication middleware:

1. Replace the content of `src/middleware.ts` with the Supabase middleware implementation
2. The middleware will automatically redirect unauthenticated users to the landing page
3. Authenticated users will be redirected from auth pages to the dashboard

## 8. Production Deployment

When deploying to production:

1. Update your environment variables with production values
2. Update Supabase redirect URLs to include your production domain
3. Ensure your production domain is added to authorized origins in OAuth providers
4. Enable the full middleware for route protection

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check that your environment variables are correct
2. **OAuth redirect errors**: Ensure redirect URLs are properly configured
3. **Email not sending**: Check Supabase email settings and SMTP configuration
4. **CORS errors**: Verify your domain is in the allowed origins list

### Getting Help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Enable Row Level Security (RLS) on your database tables
- Use strong passwords for your Supabase project
