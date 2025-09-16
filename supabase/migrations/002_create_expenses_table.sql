-- Create expenses table
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null,
  category text,
  transaction_date date,
  transaction_type text not null default 'expense' check (transaction_type in ('income', 'expense')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table expenses enable row level security;

-- Create policy to ensure users can only see their own expenses
create policy "Users can view their own expenses" on expenses
  for select using (auth.uid() = user_id);

-- Create policy to ensure users can only insert their own expenses
create policy "Users can insert their own expenses" on expenses
  for insert with check (auth.uid() = user_id);

-- Create policy to ensure users can only update their own expenses
create policy "Users can update their own expenses" on expenses
  for update using (auth.uid() = user_id);

-- Create policy to ensure users can only delete their own expenses
create policy "Users can delete their own expenses" on expenses
  for delete using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists expenses_user_id_idx on expenses(user_id);
create index if not exists expenses_transaction_date_idx on expenses(transaction_date);
create index if not exists expenses_category_idx on expenses(category);
