# OAuth Provider Setup Guide

## 🔧 Configure OAuth Providers in Supabase

Your signup and login forms now support **Google**, **Facebook**, and **Twitter** OAuth providers. Here's how to configure them in your Supabase project:

### 📋 **Updated Signup Form**

The signup form now includes:
- ✅ **Full Name** field (required)
- ✅ **Email** field (required) 
- ✅ **Password** field (required)
- ✅ **OAuth Options**: Google, Facebook, Twitter

### 🚀 **OAuth Provider Configuration**

Go to your Supabase Dashboard: https://supabase.com/dashboard/project/xeatiyqxxoqgzvlbcscp

#### 1. **Google OAuth Setup**

1. **Go to Authentication → Providers**
2. **Enable Google**
3. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set **Authorized redirect URIs** to: `https://xeatiyqxxoqgzvlbcscp.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
4. **Add to Supabase**:
   - Paste Client ID and Client Secret in Supabase Google provider settings
   - Save configuration

#### 2. **Facebook OAuth Setup**

1. **Go to Authentication → Providers**
2. **Enable Facebook**
3. **Get Facebook App Credentials**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add "Facebook Login" product
   - Go to "Facebook Login" → "Settings"
   - Add **Valid OAuth Redirect URIs**: `https://xeatiyqxxoqgzvlbcscp.supabase.co/auth/v1/callback`
   - Go to "Settings" → "Basic"
   - Copy **App ID** and **App Secret**
4. **Add to Supabase**:
   - Paste App ID and App Secret in Supabase Facebook provider settings
   - Save configuration

#### 3. **Twitter OAuth Setup**

1. **Go to Authentication → Providers**
2. **Enable Twitter**
3. **Get Twitter App Credentials**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app
   - Go to "App Settings" → "Authentication settings"
   - Enable "OAuth 2.0"
   - Set **Callback URL** to: `https://xeatiyqxxoqgzvlbcscp.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret**
4. **Add to Supabase**:
   - Paste Client ID and Client Secret in Supabase Twitter provider settings
   - Save configuration

### 🔒 **Security Configuration**

#### **Redirect URLs**
Make sure to add these URLs to your Supabase project:

1. **Go to Authentication → URL Configuration**
2. **Add Site URL**: `http://localhost:3001` (for development)
3. **Add Redirect URLs**:
   - `http://localhost:3001/**` (for development)
   - `https://yourdomain.com/**` (for production)

### 📝 **User Data Flow**

#### **Email/Password Signup**
- User enters: Name, Email, Password
- Profile created with: `full_name` from form
- Email confirmation sent

#### **OAuth Signup**
- User clicks OAuth provider button
- Redirected to provider for authentication
- Profile created with: `full_name` and `avatar_url` from provider
- Automatically signed in

### 🎯 **Testing OAuth Providers**

1. **Test Each Provider**:
   - Try signing up with Google
   - Try signing up with Facebook  
   - Try signing up with Twitter
   - Verify profile data is extracted correctly

2. **Check Profile Creation**:
   - Go to "Table Editor" → "profiles"
   - Verify new profiles are created with correct data

### 🚨 **Important Notes**

- **Development vs Production**: Update redirect URLs for production deployment
- **Provider Approval**: Some providers require app review for production use
- **Rate Limits**: Be aware of OAuth provider rate limits
- **User Permissions**: OAuth providers will request specific permissions

### 🔍 **Troubleshooting**

#### **Common Issues**:

1. **"Invalid redirect URI"**:
   - Check that redirect URLs match exactly in provider settings
   - Ensure HTTPS is used for production

2. **"App not verified"**:
   - Some providers show warnings for unverified apps
   - This is normal for development/testing

3. **Missing user data**:
   - Check that OAuth providers are configured to return name/email
   - Verify the trigger function is working correctly

### 📱 **User Experience**

- **Clean Interface**: 3-column grid layout for OAuth buttons
- **Consistent Icons**: Proper icons for each provider
- **Loading States**: Buttons show loading during OAuth flow
- **Error Handling**: Toast notifications for any issues

Your OAuth setup is now ready! Users can sign up with email/password (including name) or use Google, Facebook, or Twitter for quick registration. 🎉
