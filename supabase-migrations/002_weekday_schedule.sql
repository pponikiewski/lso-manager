-- ==================== GRAFIK TYGODNIOWY ====================

-- Szablon grafiku tygodniowego - kto służy w który dzień/slot
CREATE TABLE IF NOT EXISTS weekday_templates (
  id SERIAL PRIMARY KEY,
  ministrant_id INTEGER NOT NULL REFERENCES ministrants(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Pon, 7=Niedz
  time_slot TEXT NOT NULL CHECK (time_slot IN ('RANO', 'WIECZOR')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Jeden ministrant może być przypisany do jednego slotu danego dnia tylko raz
  UNIQUE(ministrant_id, day_of_week, time_slot)
);

-- Obecność w grafiku tygodniowym - konkretna data
CREATE TABLE IF NOT EXISTS weekday_attendance (
  id SERIAL PRIMARY KEY,
  ministrant_id INTEGER NOT NULL REFERENCES ministrants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('RANO', 'WIECZOR')),
  is_present BOOLEAN, -- NULL = nie zaznaczono, TRUE = obecny, FALSE = nieobecny
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Jeden wpis na ministranta/datę/slot
  UNIQUE(ministrant_id, date, time_slot)
);

-- ==================== GRAFIK NIEDZIELNY ====================

-- Obecność na niedzielnych mszach
CREATE TABLE IF NOT EXISTS sunday_attendance (
  id SERIAL PRIMARY KEY,
  ministrant_id INTEGER NOT NULL REFERENCES ministrants(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- Niedziela
  status TEXT CHECK (status IN ('N', 'O')), -- N=obecny, O=nieobecny, NULL=nie zaznaczono
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Jeden wpis na ministranta/niedzielę
  UNIQUE(ministrant_id, date)
);

-- ==================== INDEKSY ====================

CREATE INDEX IF NOT EXISTS idx_weekday_templates_day ON weekday_templates(day_of_week, time_slot);
CREATE INDEX IF NOT EXISTS idx_weekday_attendance_date ON weekday_attendance(date);
CREATE INDEX IF NOT EXISTS idx_sunday_attendance_date ON sunday_attendance(date);

-- ==================== RLS (Row Level Security) ====================

ALTER TABLE weekday_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekday_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE sunday_attendance ENABLE ROW LEVEL SECURITY;

-- Polityki - pozwól na wszystko (dla admina)
-- W produkcji dodasz bardziej restrykcyjne polityki

CREATE POLICY "Allow all for weekday_templates" ON weekday_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for weekday_attendance" ON weekday_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sunday_attendance" ON sunday_attendance FOR ALL USING (true) WITH CHECK (true);

-- ==================== PRZYKŁADOWE DANE DO TESTÓW ====================
-- Odkomentuj i dostosuj ID ministrantów do swoich danych

-- INSERT INTO weekday_templates (ministrant_id, day_of_week, time_slot) VALUES
-- (1, 2, 'RANO'),   -- Ministrant 1, Wtorek Rano
-- (2, 2, 'RANO'),   -- Ministrant 2, Wtorek Rano
-- (3, 2, 'WIECZOR'), -- Ministrant 3, Wtorek Wieczór
-- (4, 3, 'RANO'),   -- Ministrant 4, Środa Rano
-- (5, 3, 'WIECZOR'); -- Ministrant 5, Środa Wieczór
