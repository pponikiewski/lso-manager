import { DashboardLayout, Header } from "@/components/layout";
import { SundaySchedule } from "@/components/schedule/sunday-schedule";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";

export default function SundaySchedulePage() {
  return (
    <DashboardLayout>
      <Header
        title="Grafik Niedzielny"
        description="Grafik służby ministrantów na niedzielne msze święte"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Podział ministrantów na grupy (gildie) służące w konkretne niedziele
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
        
        <SundaySchedule />
      </div>
    </DashboardLayout>
  );
}
