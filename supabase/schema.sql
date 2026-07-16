-- =============================================================================
-- Lịch tập cầu lông — Supabase schema
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor → New query → Run.
-- =============================================================================

-- Mỗi user một hàng: chứa progress (tick từng hiệp) + history (streak/lịch sử).
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  progress   jsonb not null default '{}'::jsonb,
  history    jsonb not null default '{}'::jsonb,
  custom     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Nếu bảng đã tạo từ trước (chưa có cột custom), chạy thêm dòng này:
alter table public.user_state
  add column if not exists custom jsonb not null default '{}'::jsonb;

-- Bật Row Level Security: mỗi user chỉ đọc/ghi đúng hàng của mình.
alter table public.user_state enable row level security;

drop policy if exists "user_state_select_own" on public.user_state;
create policy "user_state_select_own"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "user_state_insert_own" on public.user_state;
create policy "user_state_insert_own"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_update_own"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
