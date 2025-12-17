"use client";

import { useState } from "react";
import { DashboardLayout, Header } from "@/components/layout";
import { WeekdaySchedule } from "@/components/schedule/weekday-schedule";
import { Button } from "@/components/ui/button";
import { FileDown, Pencil, Check } from "lucide-react";

export default function WeekdaySchedulePage() {
  const [editMode, setEditMode] = useState(false);
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);

  return (
    <DashboardLayout>
      <Header
        title="Grafik Tygodniowy"
        description="Grafik służby ministrantów na msze w dni powszednie"
      />
      
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              {editMode 
                ? "Tryb edycji - przypisz ministrantów do dni i godzin"
                : "Klasyczna tabela grafiku - wiersze to pory dnia, kolumny to dni miesiąca"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={editMode ? "default" : "outline"} 
              className="gap-2"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? (
                <>
                  <Check className="h-4 w-4" />
                  Zakończ edycję
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  Edytuj grafik
                </>
              )}
            </Button>
            {!editMode && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => exportFn?.()}
              >
                <FileDown className="h-4 w-4" />
                Eksport PDF
              </Button>
            )}
          </div>
        </div>
        
        <WeekdaySchedule 
          editMode={editMode} 
          onEditModeChange={setEditMode}
          onExportReady={(fn) => setExportFn(() => fn)}
        />
      </div>
    </DashboardLayout>
  );
}
