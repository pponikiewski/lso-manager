import { DashboardLayout, Header } from "@/components/layout";
import { StatsOverview, UpcomingServices, TopMinistrants } from "@/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, RefreshCw } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        description="Przegląd systemu zarządzania służbą liturgiczną"
      />
      
      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj ministranta
          </Button>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Generuj grafik
          </Button>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Eksportuj PDF
          </Button>
        </div>

        {/* Stats */}
        <StatsOverview />

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingServices />
          <TopMinistrants />
        </div>

        {/* Quick Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grupy (Gildie)</CardTitle>
              <CardDescription>Podział ministrantów na grupy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gildia A</span>
                  <span className="font-medium">6 ministrantów</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gildia B</span>
                  <span className="font-medium">6 ministrantów</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gildia C</span>
                  <span className="font-medium">6 ministrantów</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gildia D</span>
                  <span className="font-medium">6 ministrantów</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Szablon grafiku</CardTitle>
              <CardDescription>Aktualny szablon tygodniowy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Niedziela</span>
                  <span className="font-medium">8:00, 10:00, 12:00, 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dni powszednie</span>
                  <span className="font-medium">7:00, 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sobota</span>
                  <span className="font-medium">7:00, 18:00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Punktacja</CardTitle>
              <CardDescription>System punktów za służbę</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Msza niedzielna</span>
                  <span className="font-medium text-green-500">+10 pkt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Msza tygodniowa</span>
                  <span className="font-medium text-green-500">+5 pkt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nabożeństwo</span>
                  <span className="font-medium text-green-500">+7 pkt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Służba specjalna</span>
                  <span className="font-medium text-green-500">+15 pkt</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}