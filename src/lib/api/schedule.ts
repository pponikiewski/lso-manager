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

// Pobierz szablon grafiku tygodniowego (kto służy w który dzień)
export async function getWeekdayTemplates() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekday_templates")
    .select("*, ministrants(id, first_name, last_name)")
    .order("day_of_week")
    .order("time_slot");
  
  if (error) throw error;
  return data as WeekdayTemplate[];
}

// Dodaj ministranta do szablonu
export async function addWeekdayTemplate(payload: {
  ministrant_id: number;
  day_of_week: DayOfWeek;
  time_slot: TimeSlot;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_templates")
    .insert(payload);
  
  if (error) throw error;
}

// Usuń ministranta z szablonu
export async function deleteWeekdayTemplate(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekday_templates")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
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