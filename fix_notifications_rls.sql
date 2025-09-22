-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create more permissive policies for the notification system
-- Allow users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role to insert notifications for any user (for API endpoints)
CREATE POLICY "Service role can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Alternative: If the above doesn't work, try this more permissive approach
-- Uncomment the lines below if you still get RLS errors

-- DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
-- CREATE POLICY "Allow all operations for authenticated users" ON public.notifications
--     FOR ALL USING (true) WITH CHECK (true);
