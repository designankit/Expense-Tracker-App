# Recurring Transactions & Notifications Setup

This document explains how to set up and use the recurring transactions and notifications features in your expense tracker app.

## Features Implemented

### 1. Recurring Transactions
- ✅ Add recurring transaction option in "Add Transaction" form
- ✅ Frequency options: Daily, Weekly, Monthly, Yearly
- ✅ Optional end date for recurring transactions
- ✅ Store recurring transaction rules in Supabase (`recurring_transactions` table)
- ✅ Auto-generate transactions based on rules via API route
- ✅ Recurring transactions management page (`/recurring`)
- ✅ Pause/resume and delete recurring transactions

### 2. Notifications System
- ✅ In-app notification system with dropdown in dashboard header
- ✅ Notifications for upcoming recurring bills (1-2 days before due date)
- ✅ Notifications for budget overspending warnings
- ✅ Notification management (mark as read, delete, bulk operations)
- ✅ Optional email notifications (requires Supabase Edge Function setup)

## Database Setup

### 1. Run the Migration
Execute the SQL migration file to create the `recurring_transactions` table:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/007_create_recurring_transactions_table.sql
```

### 2. Verify Tables
Make sure you have these tables in your Supabase database:
- `recurring_transactions` - Stores recurring transaction rules
- `notifications` - Stores user notifications (already exists)
- `expenses` - Stores generated transactions (already exists)

## API Endpoints

### Recurring Transactions
- `POST /api/recurring-transactions` - Create a new recurring transaction
- `GET /api/recurring-transactions?userId={id}` - Get user's recurring transactions
- `PUT /api/recurring-transactions/{id}` - Update a recurring transaction
- `DELETE /api/recurring-transactions/{id}` - Delete a recurring transaction

### Generate Recurring Transactions
- `POST /api/recurring-transactions/generate` - Generate transactions from recurring rules

### Notifications
- `POST /api/notifications/check` - Check and create notifications for a user
- `POST /api/notifications` - Create a new notification
- `GET /api/notifications?userId={id}` - Get user's notifications
- `PATCH /api/notifications/{id}` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete a notification

### Cron Job
- `POST /api/cron/daily` - Daily cron job to generate transactions and check notifications

## Setting Up Cron Jobs

### Option 1: Vercel Cron Jobs (Recommended)
1. Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Option 2: External Cron Service
Set up a cron job to call `https://your-domain.com/api/cron/daily` daily at 9 AM UTC.

### Option 3: Manual Testing
You can manually trigger the cron job by calling the API endpoint.

## Email Notifications (Optional)

### Setup Supabase Edge Function
1. Create a new Edge Function in Supabase:
```bash
supabase functions new send-email
```

2. Install required packages:
```bash
cd supabase/functions/send-email
npm install @supabase/supabase-js nodemailer
```

3. Create the function code (example using Nodemailer):
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text } = await req.json()
    
    // Configure your email service (SMTP, SendGrid, etc.)
    // This is a placeholder - implement your email sending logic
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

4. Deploy the function:
```bash
supabase functions deploy send-email
```

## Usage

### Creating Recurring Transactions
1. Go to the "Add Transaction" dialog
2. Fill in the transaction details
3. Toggle "Make this a recurring transaction"
4. Select frequency (Daily, Weekly, Monthly, Yearly)
5. Optionally set an end date
6. Save the transaction

### Managing Recurring Transactions
1. Navigate to `/recurring` page
2. View all your recurring transactions
3. Pause/resume transactions using the play/pause button
4. Delete transactions using the trash button
5. See overdue transactions highlighted in red

### Notifications
- Notifications appear in the bell icon in the dashboard header
- Click on notifications to mark them as read
- Use bulk operations to manage multiple notifications
- Notifications are automatically created for:
  - Upcoming recurring bills (1-2 days before due)
  - Budget overspending warnings

## Configuration

### Budget Thresholds
Edit the budget limits in `src/lib/notification-service.ts`:
```typescript
const budgetLimits = {
  warning: 30000,  // ₹30,000 warning threshold
  critical: 40000  // ₹40,000 critical threshold
}
```

### Notification Timing
Modify the recurring bill notification timing in `src/lib/notification-service.ts`:
```typescript
// Get recurring transactions that are due in the next 1-2 days
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)

const dayAfterTomorrow = new Date()
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
```

## Testing

### Test Recurring Transactions
1. Create a recurring transaction with a past start date
2. Call the generate API: `POST /api/recurring-transactions/generate`
3. Check if transactions were created in the expenses table

### Test Notifications
1. Create a recurring bill due tomorrow
2. Call the notification check API: `POST /api/notifications/check`
3. Check if notifications were created

### Test Cron Job
1. Call the cron endpoint: `POST /api/cron/daily`
2. Verify transactions were generated and notifications were created

## Troubleshooting

### Common Issues
1. **Recurring transactions not generating**: Check if the cron job is running
2. **Notifications not appearing**: Verify the notification service is being called
3. **Email not sending**: Check if the Supabase Edge Function is deployed and configured

### Debug Steps
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify API endpoints are accessible
4. Test individual components in isolation

## Security Notes

- The cron job endpoint should be protected with authentication
- Add rate limiting to prevent abuse
- Validate all input data before processing
- Use environment variables for sensitive configuration

## Future Enhancements

- User-configurable budget limits
- More notification types (savings goals, etc.)
- Email templates customization
- Push notifications
- SMS notifications
- Advanced recurring patterns (every 2 weeks, etc.)
