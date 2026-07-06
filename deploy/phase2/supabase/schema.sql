-- schema.sql
-- ------------------------------------------------------------
-- 統合診断アプリ用のSupabaseテーブル定義
-- Supabaseの管理画面 → SQL Editor に貼り付けて実行してください
-- ------------------------------------------------------------

-- 1. 診断履歴(性格×恋愛の結果を1回ごとに記録)
create table if not exists diagnosis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  personality text not null,
  love text not null,
  personality_key text not null,
  love_key text not null,
  skeleton text,
  skeleton_key text,
  normalized jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_diagnosis_history_user_id on diagnosis_history(user_id, created_at desc);

-- 2. 見た目診断(骨格)プロフィール(1ユーザーにつき1件、上書き型)
create table if not exists skeleton_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  skeleton_key text not null,
  skeleton_name text not null,
  counts jsonb,
  updated_at timestamptz not null default now()
);

-- 3. プレミアム会員状態
create table if not exists premium_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_premium boolean not null default false,
  plan text, -- 'single' | 'monthly'
  purchased_at timestamptz,
  expires_at timestamptz -- 単発プランの場合は当日のみ等、運用に応じて利用
);

-- ------------------------------------------------------------
-- Row Level Security(RLS):自分のデータしか読み書きできないようにする
-- ------------------------------------------------------------

alter table diagnosis_history enable row level security;
alter table skeleton_profiles enable row level security;
alter table premium_status enable row level security;

create policy "自分の診断履歴のみ参照可能" on diagnosis_history
  for select using (auth.uid() = user_id);
create policy "自分の診断履歴のみ追加可能" on diagnosis_history
  for insert with check (auth.uid() = user_id);

create policy "自分の骨格プロフィールのみ参照可能" on skeleton_profiles
  for select using (auth.uid() = user_id);
create policy "自分の骨格プロフィールのみ書き込み可能" on skeleton_profiles
  for insert with check (auth.uid() = user_id);
create policy "自分の骨格プロフィールのみ更新可能" on skeleton_profiles
  for update using (auth.uid() = user_id);

create policy "自分のプレミアム状態のみ参照可能" on premium_status
  for select using (auth.uid() = user_id);
create policy "自分のプレミアム状態のみ書き込み可能" on premium_status
  for insert with check (auth.uid() = user_id);
create policy "自分のプレミアム状態のみ更新可能" on premium_status
  for update using (auth.uid() = user_id);
