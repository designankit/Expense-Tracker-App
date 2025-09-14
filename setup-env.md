# Environment Setup Instructions

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
DATABASE_URL="file:./prisma/dev.db"
```

## Database Setup

The database has been configured and is ready to use:

1. **Database Type**: SQLite (file-based)
2. **Location**: `./prisma/dev.db`
3. **Schema**: Updated to work with SQLite
4. **Status**: ✅ Connected and synchronized

## Authentication Setup

The authentication system is now properly configured:

1. **NextAuth.js**: Configured with credentials provider
2. **Password Hashing**: Using bcryptjs
3. **Session Management**: JWT-based sessions
4. **User Model**: Includes all required fields

## Test User Created

A test user has been created for testing:
- **Email**: test@example.com
- **Password**: password123

## Next Steps

1. Create your `.env` file with the variables above
2. Start your development server: `npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Use the test credentials or create a new account

## Troubleshooting

If you encounter any issues:

1. **Database Connection**: Ensure the `.env` file exists and has the correct DATABASE_URL
2. **Authentication**: Check that NEXTAUTH_SECRET is set
3. **Port Issues**: Make sure NEXTAUTH_URL matches your development server port

## Production Deployment

For production:
1. Change NEXTAUTH_SECRET to a secure random string
2. Update NEXTAUTH_URL to your production domain
3. Consider using PostgreSQL for production database
