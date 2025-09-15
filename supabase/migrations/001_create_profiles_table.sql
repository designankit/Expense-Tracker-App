-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies for profiles table
-- Users can view their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
