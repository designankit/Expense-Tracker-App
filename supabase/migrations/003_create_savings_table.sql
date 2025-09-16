-- Create savings table
create table if not exists savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  goal_name text not null,
  target_amount numeric not null,
  saved_amount numeric default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table savings enable row level security;

-- Create policy to ensure users can only view their own savings
create policy "Users can view their own savings" on savings
  for select using (auth.uid() = user_id);

-- Create policy to ensure users can only insert their own savings
create policy "Users can insert their own savings" on savings
  for insert with check (auth.uid() = user_id);

-- Create policy to ensure users can only update their own savings
create policy "Users can update their own savings" on savings
  for update using (auth.uid() = user_id);

-- Create policy to ensure users can only delete their own savings
create policy "Users can delete their own savings" on savings
  for delete using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists savings_user_id_idx on savings(user_id);
create index if not exists savings_created_at_idx on savings(created_at);
