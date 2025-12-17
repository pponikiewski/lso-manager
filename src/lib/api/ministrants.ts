import { createClient } from "@/lib/supabase/client";
import { Ministrant, Rank, MinistrantWithLogs, AttendanceType, Group } from "@/types/db";

export async function getMinistrants() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("ministrants")
    .select("*, ranks(*), attendance_logs(*), groups(*)") // Pobieramy też logi
    .order("points", { ascending: false });    // Sortujemy po punktach
    // Uwaga: Normalnie logi też byśmy sortowali lub limitowali (np. ostatnie 5), 
    // ale Supabase SDK robi to trochę inaczej. Na razie pobierzmy wszystkie, 
    // przy małej skali to nie problem.

  if (error) throw new Error(error.message);

  return data as MinistrantWithLogs[];
}

// 1. Pobieranie stopni do listy rozwijanej
export async function getRanks() {
  const supabase = createClient();
  const { data, error } = await supabase.from("ranks").select("*").order("id");
  if (error) throw error;
  return data as Rank[];
}

// 2. Tworzenie ministranta
// Omit<Ministrant, "id" ...> oznacza: weź typ Ministrant, ale bez ID i dat (bo baza je generuje sama)
export async function createMinistrant(newMinistrant: {
  first_name: string;
  last_name: string;
  rank_id: number;
  group_id: number; // <--- Nowe pole
}) {
  const supabase = createClient();
  const { error } = await supabase.from("ministrants").insert(newMinistrant);
  if (error) throw error;
}

export async function addAttendance(payload: {
  ministrant_id: number;
  event_type: AttendanceType;
  score: number;   // Punkty przekażemy z UI
  event_date: string; // "YYYY-MM-DD"
}) {
  const supabase = createClient();
  const { error } = await supabase.from("attendance_logs").insert(payload);
  if (error) throw error;
}

export async function getGroups() {
  const supabase = createClient();
  const { data, error } = await supabase.from("groups").select("*").order("name");
  if (error) throw error;
  return data as Group[];
}