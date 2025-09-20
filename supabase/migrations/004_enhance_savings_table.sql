-- Add new columns to savings table
alter table savings add column if not exists target_date timestamp with time zone;
alter table savings add column if not exists priority text check (priority in ('High', 'Medium', 'Low')) default 'Medium';
alter table savings add column if not exists goal_icon text default 'PiggyBank';
alter table savings add column if not exists description text;

-- Create goal_contributions table
create table if not exists goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references savings(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  amount numeric not null,
  contribution_date timestamp with time zone default now(),
  note text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) for goal_contributions
alter table goal_contributions enable row level security;

-- Create policies for goal_contributions
create policy "Users can view their own goal contributions" on goal_contributions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own goal contributions" on goal_contributions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own goal contributions" on goal_contributions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own goal contributions" on goal_contributions
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists goal_contributions_goal_id_idx on goal_contributions(goal_id);
create index if not exists goal_contributions_user_id_idx on goal_contributions(user_id);
create index if not exists goal_contributions_contribution_date_idx on goal_contributions(contribution_date);

-- Create function to update saved_amount when contributions are added/deleted
create or replace function update_savings_amount()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update savings 
    set saved_amount = saved_amount + NEW.amount 
    where id = NEW.goal_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update savings 
    set saved_amount = saved_amount - OLD.amount 
    where id = OLD.goal_id;
    return OLD;
  elsif TG_OP = 'UPDATE' then
    update savings 
    set saved_amount = saved_amount - OLD.amount + NEW.amount 
    where id = NEW.goal_id;
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql;

-- Create trigger to automatically update saved_amount
drop trigger if exists update_savings_amount_trigger on goal_contributions;
create trigger update_savings_amount_trigger
  after insert or update or delete on goal_contributions
  for each row execute function update_savings_amount();
