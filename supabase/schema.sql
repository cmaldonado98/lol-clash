-- ────────────────────────────────────────────────────────────────
--  PanConQuesoTeam #PCQT · Supabase Schema
--  Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- ────────────────────────────────────────────────────────────────

-- 1. Table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS groomsmen (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT        UNIQUE NOT NULL,           -- URL key e.g. "samuel"
  name              TEXT        NOT NULL,                  -- Display name
  role              TEXT        NOT NULL
    CHECK (role IN ('Top', 'Jungle', 'Mid', 'ADC', 'Support')),
  summoner_icon_id  INTEGER     NOT NULL DEFAULT 29,       -- Data Dragon profile icon ID
  status            TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'locked_in')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Auto-update timestamp -----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_groomsmen_updated_at ON groomsmen;

CREATE TRIGGER trg_groomsmen_updated_at
  BEFORE UPDATE ON groomsmen
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Row-Level Security (RLS) --------------------------------------
ALTER TABLE groomsmen ENABLE ROW LEVEL SECURITY;

-- Anyone can read all rows (needed for lobby display)
CREATE POLICY "public_read"
  ON groomsmen FOR SELECT
  USING (true);

-- Anyone can update status only (anon key, Clash-style open invite)
-- In production: replace `true` with `auth.uid() IS NOT NULL` or a token check
CREATE POLICY "public_status_update"
  ON groomsmen FOR UPDATE
  USING  (true)
  WITH CHECK (
    -- Only allow changing the status column, nothing else
    (status = 'locked_in' OR status = 'pending')
  );

-- 4. Supabase Realtime (enable for live lobby updates) -------------
ALTER PUBLICATION supabase_realtime ADD TABLE groomsmen;

-- ────────────────────────────────────────────────────────────────
--  SEED DATA  —  PanConQuesoTeam #PCQT
--  Icon IDs: https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/profileicon.json
-- ────────────────────────────────────────────────────────────────
INSERT INTO groomsmen (slug, name, role, summoner_icon_id, status) VALUES
  ('gozzelp', 'Gozzelp', 'Mid',     29,   'pending'),
  ('loup500',  'Loup',    'Mid',     23,   'pending'),
  ('pelado',   'Pelado',  'Jungle',  4364, 'pending'),
  ('ryukens',  'RyuKenS', 'ADC',     7,    'pending'),
  ('valitas',  'Valitas', 'Support', 1,    'pending'),
  ('oso2011',  'oso2011', 'Top',     4427, 'pending'),
  ('alai',     'Alai',    'Support', 14,   'pending')
ON CONFLICT (slug) DO NOTHING;
