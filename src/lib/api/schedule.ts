import { createClient } from "@/lib/supabase/client";
import { MassTime, ScheduleEntry } from "@/types/db";

// 1. Pobierz godziny mszy
export async function getMassTimes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mass_times")
    .select("*")
    .order("display_order");
  
  if (error) throw error;
  return data as MassTime[];
}

// 2. Pobierz grafik na dany zakres dat (np. miesiąc)
export async function getScheduleEntries(startDate: string, endDate: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("*, groups(*)") // Pobierz też nazwę przypisanej grupy
    .gte("date", startDate) // Data większa lub równa start
    .lte("date", endDate);  // Data mniejsza lub równa koniec
  
  if (error) throw error;
  return data as ScheduleEntry[];
}

// 3. Zapisz/Zaktualizuj wpis w grafiku (Upsert)
export async function saveScheduleEntry(payload: {
  date: string;
  mass_time_id: number;
  group_id: number;
}) {
  const supabase = createClient();
  
  // Upsert: Jeśli wpis dla tej daty i godziny istnieje, podmień grupę. Jeśli nie - stwórz.
  const { error } = await supabase
    .from("schedule_entries")
    .upsert(payload, { onConflict: "date, mass_time_id" });

  if (error) throw error;
}