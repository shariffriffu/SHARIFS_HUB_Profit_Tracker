-- ═══════════════════════════════════════════════════════════════════
-- SHARIFS HUB Profit Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- 1. USERS TABLE (linked to Supabase auth)
CREATE TABLE public.users (
  id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name  TEXT NOT NULL,
  role  TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'investor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DAILY ENTRIES TABLE
CREATE TABLE public.daily_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           TEXT NOT NULL,
  sales          JSONB NOT NULL DEFAULT '{}',
  expenses       JSONB NOT NULL DEFAULT '{}',
  total_sales    NUMERIC NOT NULL DEFAULT 0,
  total_expenses NUMERIC NOT NULL DEFAULT 0,
  net_profit     NUMERIC NOT NULL DEFAULT 0,
  created_by     UUID REFERENCES auth.users(id),
  approved       BOOLEAN NOT NULL DEFAULT FALSE,
  distribution   JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVESTORS TABLE
CREATE TABLE public.investors (
  id                       TEXT PRIMARY KEY,
  name                     TEXT NOT NULL,
  total_investment         NUMERIC NOT NULL,
  remaining_capital        NUMERIC NOT NULL,
  profit_percentage        NUMERIC NOT NULL,
  post_recovery_percentage NUMERIC NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'active',
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SETTINGS TABLE
CREATE TABLE public.settings (
  id                  TEXT PRIMARY KEY,
  reserve_percentage  NUMERIC NOT NULL,
  profit_distribution JSONB NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings      ENABLE ROW LEVEL SECURITY;

-- Helper function (avoids recursive RLS on users table)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- USERS policies
CREATE POLICY "user_read_own"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_all"  ON public.users FOR SELECT USING (public.current_user_role() = 'admin');

-- DAILY ENTRIES policies
CREATE POLICY "admin_all_entries"      ON public.daily_entries FOR ALL    USING (public.current_user_role() = 'admin');
CREATE POLICY "operator_insert_entry"  ON public.daily_entries FOR INSERT WITH CHECK (public.current_user_role() = 'operator');
CREATE POLICY "investor_read_approved" ON public.daily_entries FOR SELECT USING (approved = TRUE AND public.current_user_role() = 'investor');

-- INVESTORS policies
CREATE POLICY "admin_all_investors"    ON public.investors FOR ALL    USING (public.current_user_role() = 'admin');
CREATE POLICY "investor_read_active"   ON public.investors FOR SELECT USING (public.current_user_role() = 'investor');

-- SETTINGS policies
CREATE POLICY "admin_all_settings"     ON public.settings  FOR ALL    USING (public.current_user_role() = 'admin');

-- ═══════════════════════════════════════════════════════════════════
-- ENABLE REALTIME (for AdminDashboard live updates)
-- ═══════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_entries;
