"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Home() {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["test-connection"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_connection")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold font-mono">LSO Manager</h1>
      
      <div className="p-4 border rounded-lg bg-muted/50">
        {isLoading && <p>Łączenie z bazą...</p>}
        {error && <p className="text-destructive">Błąd: {(error as any).message}</p>}
        {data && (
          <p className="text-green-600 font-medium">
            ✅ Status bazy: {data.name}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button>Zaloguj się</Button>
      </div>
    </div>
  );
}