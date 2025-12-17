import { DashboardLayout, Header } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Header
        title="Ustawienia"
        description="Konfiguracja systemu LSO Manager"
      />
      
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Punktacja */}
        <Card>
          <CardHeader>
            <CardTitle>System punktacji</CardTitle>
            <CardDescription>
              Skonfiguruj ile punktów ministranci otrzymują za poszczególne typy służb.
              Zmiany będą przeliczone wstecz dla wszystkich ministrantów.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sunday-points">Msza niedzielna</Label>
                <Input id="sunday-points" type="number" defaultValue={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekday-points">Msza tygodniowa</Label>
                <Input id="weekday-points" type="number" defaultValue={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="devotion-points">Nabożeństwo</Label>
                <Input id="devotion-points" type="number" defaultValue={7} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special-points">Służba specjalna</Label>
                <Input id="special-points" type="number" defaultValue={15} />
              </div>
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz punktację
            </Button>
          </CardContent>
        </Card>

        {/* Szablon grafiku */}
        <Card>
          <CardHeader>
            <CardTitle>Szablon grafiku</CardTitle>
            <CardDescription>
              Ustaw domyślne godziny mszy dla poszczególnych dni tygodnia.
              System będzie generować grafiki na podstawie tego szablonu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sunday-times">Niedziela (godziny oddzielone przecinkami)</Label>
                <Input id="sunday-times" defaultValue="8:00, 10:00, 12:00, 18:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekday-times">Dni powszednie</Label>
                <Input id="weekday-times" defaultValue="7:00, 18:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saturday-times">Sobota</Label>
                <Input id="saturday-times" defaultValue="7:00, 18:00" />
              </div>
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz szablon
            </Button>
          </CardContent>
        </Card>

        {/* Grupy */}
        <Card>
          <CardHeader>
            <CardTitle>Grupy (Gildie)</CardTitle>
            <CardDescription>
              Zarządzaj grupami ministrantów służących razem w niedziele.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="group-a">Gildia A</Label>
                <Input id="group-a" defaultValue="Gildia A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-b">Gildia B</Label>
                <Input id="group-b" defaultValue="Gildia B" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-c">Gildia C</Label>
                <Input id="group-c" defaultValue="Gildia C" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-d">Gildia D</Label>
                <Input id="group-d" defaultValue="Gildia D" />
              </div>
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz grupy
            </Button>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle>Eksport PDF</CardTitle>
            <CardDescription>
              Ustawienia wyglądu eksportowanych grafików do druku.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parish-name">Nazwa parafii (nagłówek PDF)</Label>
              <Input id="parish-name" placeholder="Parafia pw. św. Jana..." />
            </div>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz ustawienia
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
