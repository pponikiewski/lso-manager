import { createClient } from "@/lib/supabase/client";
import { Ministrant } from "@/types/db";

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