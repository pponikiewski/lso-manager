import { DashboardLayout, Header } from "@/components/layout";
import { WeekdaySchedule } from "@/components/schedule/weekday-schedule";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";

export default function WeekdaySchedulePage() {
  return (
    <DashboardLayout>
      <Header
        title="Grafik Tygodniowy"
        description="Grafik służby ministrantów na msze w dni powszednie"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Klasyczna tabela grafiku - wiersze to pory dnia, kolumny to dni miesiąca
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Generuj
            </Button>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Eksport PDF
            </Button>
          </div>
        </div>
        
        <WeekdaySchedule />
      </div>
    </DashboardLayout>
  );
}
