-- ────────────────────────────────────────────────────────────────
--  Migración: reemplaza los jugadores anteriores por el equipo
--  PanConQuesoTeam #PCQT
--  Ejecutar en: Supabase → SQL Editor → New query
-- ────────────────────────────────────────────────────────────────

-- 1. Eliminar jugadores anteriores
DELETE FROM groomsmen
WHERE slug IN ('samuel', 'isaac', 'carlos', 'miguel', 'jorge');

-- 2. Insertar (o actualizar si ya existen) los 7 nuevos jugadores
INSERT INTO groomsmen (slug, name, role, summoner_icon_id, status) VALUES
  ('gozzelp', 'Gozzelp', 'Mid',     29,   'pending'),
  ('loup500',  'Loup',    'Mid',     23,   'pending'),
  ('pelado',   'Pelado',  'Jungle',  4364, 'pending'),
  ('ryukens',  'RyuKenS', 'ADC',     7,    'pending'),
  ('valitas',  'Valitas', 'Support', 1,    'pending'),
  ('oso2011',  'oso2011', 'Top',     4427, 'pending'),
  ('alai',     'Alai',    'Support', 14,   'pending')
ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  role             = EXCLUDED.role,
  summoner_icon_id = EXCLUDED.summoner_icon_id,
  status           = 'pending';
