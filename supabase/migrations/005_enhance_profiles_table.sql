-- Add new columns to profiles table for onboarding data
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists currency text default 'INR';
alter table profiles add column if not exists language text default 'en';
alter table profiles add column if not exists timezone text default 'Asia/Kolkata';
alter table profiles add column if not exists budget_style text default 'balanced';
alter table profiles add column if not exists default_savings_percentage numeric default 20;
alter table profiles add column if not exists selected_categories text[] default '{"Food", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare"}';
alter table profiles add column if not exists two_fa_enabled boolean default false;
alter table profiles add column if not exists social_login_connected boolean default false;
alter table profiles add column if not exists onboarding_completed boolean default false;
alter table profiles add column if not exists onboarding_step integer default 0;

-- Create index for onboarding queries
create index if not exists profiles_onboarding_completed_idx on profiles(onboarding_completed);
create index if not exists profiles_id_idx on profiles(id);
