import { createClient } from "@/lib/supabase/client";
import { Ministrant, Rank } from "@/types/db";

export async function getMinistrants() {
  const supabase = createClient();
  
  // Pobieramy ministrantów i dołączamy (join) dane o stopniu
  const { data, error } = await supabase
    .from("ministrants")
    .select("*, ranks(*)")
    .order("points", { ascending: false }); // Sortujemy od najlepszego

  if (error) {
    throw new Error(error.message);
  }

  return data as Ministrant[];
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
}) {
  const supabase = createClient();
  const { error } = await supabase.from("ministrants").insert(newMinistrant);
  if (error) throw error;
}