import { createClient } from "@/lib/supabase/client";
import { MassTime, ScheduleEntry, WeekdayTemplate, WeekdayScheduleEntry, TimeSlot, DayOfWeek, SundayAttendance } from "@/types/db";

// ==================== MSZE NIEDZIELNE ====================

export async function getMassTimes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mass_times")
    .select("*")
    .order("display_order");
  
  if (error) throw error;
  return data as MassTime[];
}

export async function getScheduleEntries(startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("*, groups(*)")
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (error) throw error;
  return data as ScheduleEntry[];
}

export async function saveScheduleEntry(payload: {
  date: string;
  mass_time_id: number;
  group_id: number;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("schedule_entries")
    .upsert(payload, { onConflict: "date, mass_time_id" });

  if (error) throw error;
}

// ==================== GRAFIK TYGODNIOWY - SZABLON ====================

// Pobierz szablon grafiku tygodniowego dla danego miesiąca
// Filtruje szablony które obowiązują w danym okresie
export async function getWeekdayTemplates(monthStart?: string, monthEnd?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from("weekday_templates")
    .select("*, ministrants(id, first_name, last_name)")
    .order("day_of_week")
    .order("time_slot");
  
  // Jeśli podano daty, filtruj szablony obowiązujące w tym okresie
  if (monthStart && monthEnd) {
    // Szablon obowiązuje jeśli:
    // - valid_from <= koniec miesiąca (zaczął się przed lub w trakcie miesiąca)
    // - valid_to IS NULL OR valid_to >= początek miesiąca (nie skończył się przed miesiącem)
    query = query
      .lte("valid_from", monthEnd)
      .or(`valid_to.is.null,valid_to.gte.${monthStart}`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as WeekdayTemplate[];
}

// Dodaj ministranta do szablonu od danego miesiąca
export async function addWeekdayTemplate(payload: {
  ministrant_id: number;
  day_of_week: DayOfWeek;
  time_slot: TimeSlot;
  valid_from: string; // pierwszy dzień miesiąca od którego obowiązuje
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_templates")
    .insert(payload);
  
  if (error) throw error;
}

// "Usuń" ministranta z szablonu - ustawia valid_to na koniec poprzedniego miesiąca
// Jeśli szablon zaczyna się w tym samym miesiącu co usunięcie, kasuje go całkowicie
export async function deleteWeekdayTemplate(id: number, endDate: string) {
  const supabase = createClient();
  
  // Najpierw pobierz szablon żeby sprawdzić valid_from
  const { data: template, error: fetchError } = await supabase
    .from("weekday_templates")
    .select("valid_from")
    .eq("id", id)
    .single();
  
  if (fetchError) throw fetchError;
  
  // Jeśli szablon zaczyna się w tym samym miesiącu lub później, usuń całkowicie
  if (template.valid_from >= endDate) {
    const { error } = await supabase
      .from("weekday_templates")
      .delete()
      .eq("id", id);
    if (error) throw error;
  } else {
    // W przeciwnym razie ustaw datę końcową (soft delete)
    const { error } = await supabase
      .from("weekday_templates")
      .update({ valid_to: endDate })
      .eq("id", id);
    if (error) throw error;
  }
}

// ==================== GRAFIK TYGODNIOWY - OBECNOŚĆ ====================

// Pobierz wpisy obecności na dany miesiąc
export async function getWeekdayAttendance(startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekday_attendance")
    .select("*, ministrants(id, first_name, last_name)")
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (error) throw error;
  return data as WeekdayScheduleEntry[];
}

// Zapisz/zaktualizuj obecność (upsert)
export async function saveWeekdayAttendance(payload: {
  ministrant_id: number;
  date: string;
  time_slot: TimeSlot;
  is_present: boolean | null;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_attendance")
    .upsert(payload, { onConflict: "ministrant_id, date, time_slot" });
  
  if (error) throw error;
}

// ==================== GRAFIK NIEDZIELNY - OBECNOŚĆ ====================

// Pobierz obecność na niedziele
export async function getSundayAttendance(startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sunday_attendance")
    .select("*, ministrants(id, first_name, last_name, group_id)")
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (error) throw error;
  return data as SundayAttendance[];
}

// Zapisz/zaktualizuj obecność niedzielną
export async function saveSundayAttendance(payload: {
  ministrant_id: number;
  date: string;
  status: 'N' | 'O' | null;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("sunday_attendance")
    .upsert(payload, { onConflict: "ministrant_id, date" });
  
  if (error) throw error;
}

// ==================== STARY KOD (do usunięcia jeśli nie potrzebny) ====================

export async function getWeekdayEntries(startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekday_schedule")
    .select("*, ministrants(first_name, last_name)")
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (error) throw error;
  return data;
}

export async function addWeekdayEntry(payload: {
  date: string;
  time_slot: "RANO" | "WIECZOR";
  ministrant_id: number;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_schedule")
    .insert(payload);
  
  if (error) throw error;
}

export async function deleteWeekdayEntry(entryId: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_schedule")
    .delete()
    .eq("id", entryId);
  
  if (error) throw error;
}