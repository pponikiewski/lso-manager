-- Dodaj kolumny valid_from i valid_to do weekday_templates
-- valid_from: od kiedy szablon obowiązuje (pierwszy dzień miesiąca)
-- valid_to: do kiedy szablon obowiązuje (NULL = nadal aktywny)

ALTER TABLE weekday_templates
ADD COLUMN valid_from DATE NOT NULL DEFAULT '2020-01-01',
ADD COLUMN valid_to DATE DEFAULT NULL;

-- Dla istniejących rekordów ustawiamy starą datę, żeby były widoczne we wszystkich miesiącach
-- Nowe rekordy będą miały ustawiony valid_from na pierwszy dzień edytowanego miesiąca

-- Indeks dla szybszego filtrowania po datach
CREATE INDEX idx_weekday_templates_validity ON weekday_templates(valid_from, valid_to);

-- Zmiana unique constraint - ten sam ministrant może być przypisany do tego samego dnia/slotu
-- ale w różnych okresach (np. był przypisany, został usunięty, potem znowu dodany)
-- Usuwamy stary constraint jeśli istnieje i dodajemy nowy z uwzględnieniem valid_from
ALTER TABLE weekday_templates DROP CONSTRAINT IF EXISTS weekday_templates_ministrant_id_day_of_week_time_slot_key;
ALTER TABLE weekday_templates ADD CONSTRAINT weekday_templates_unique_assignment 
  UNIQUE (ministrant_id, day_of_week, time_slot, valid_from);
