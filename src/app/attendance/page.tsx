import { DashboardLayout, Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Typy odznak
type BadgeType = "R" | "W" | "S" | "N";

interface ServiceBadge {
  type: BadgeType;
  date: string;
}

interface MinistrantWithBadges {
  id: string;
  name: string;
  badges: ServiceBadge[];
}

// Mock data - w przyszłości z bazy danych
const ministrantsWithBadges: MinistrantWithBadges[] = [
  { id: "1", name: "Adamczyk Piotr", badges: [] },
  { id: "2", name: "Batkowski Karol", badges: [] },
  {
    id: "3",
    name: "Czapracki Michał",
    badges: [
      { type: "R", date: "2025-12-01" },
      { type: "R", date: "2025-12-03" },
      { type: "R", date: "2025-12-05" },
      { type: "R", date: "2025-12-08" },
      { type: "R", date: "2025-12-10" },
      { type: "W", date: "2025-12-12" },
    ],
  },
  { id: "4", name: "Duraj Nikodem", badges: [] },
  { id: "5", name: "Fic Piotr", badges: [] },
  {
    id: "6",
    name: "Golonka Igor",
    badges: [
      { type: "S", date: "2025-12-02" },
      { type: "R", date: "2025-12-05" },
      { type: "R", date: "2025-12-08" },
    ],
  },
  { id: "7", name: "Górny Miłosz", badges: [] },
  { id: "8", name: "Gruszecki Hubert", badges: [] },
  {
    id: "9",
    name: "Gruszecki Marceli",
    badges: [
      { type: "R", date: "2025-12-01" },
      { type: "W", date: "2025-12-04" },
      { type: "S", date: "2025-12-07" },
    ],
  },
];

const badgeColors: Record<BadgeType, string> = {
  R: "bg-blue-600 hover:bg-blue-700",       // Rano
  W: "bg-amber-600 hover:bg-amber-700",     // Wieczór
  S: "bg-purple-600 hover:bg-purple-700",   // Specjalne
  N: "bg-green-600 hover:bg-green-700",     // Nabożeństwo
};

const badgeLabels: Record<BadgeType, string> = {
  R: "Rano",
  W: "Wieczór",
  S: "Specjalne",
  N: "Nabożeństwo",
};

// Maksymalna liczba slotów do wyświetlenia
const MAX_BADGE_SLOTS = 10;

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <Header
        title="Służba Nadobowiązkowa"
        description="Przebieg służby ministrantów (2025-12)"
      />

      <div className="p-6 space-y-6">
        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Legenda odznak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {(Object.entries(badgeLabels) as [BadgeType, string][]).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold",
                      badgeColors[key]
                    )}
                  >
                    {key}
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ministrants table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4 w-[200px]">
                    Ministrant
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase px-6 py-4">
                    Przebieg służby (2025-12)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ministrantsWithBadges.map((ministrant) => (
                  <tr
                    key={ministrant.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium">{ministrant.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Badges */}
                        {ministrant.badges.map((badge, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold cursor-default transition-colors",
                              badgeColors[badge.type]
                            )}
                            title={`${badgeLabels[badge.type]} - ${badge.date}`}
                          >
                            {badge.type}
                          </div>
                        ))}

                        {/* Add button */}
                        <button
                          className="w-9 h-9 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
                          title="Dodaj służbę"
                        >
                          <Plus className="h-4 w-4" />
                        </button>

                        {/* Empty placeholder slots */}
                        {Array.from({
                          length: Math.max(0, MAX_BADGE_SLOTS - ministrant.badges.length - 1),
                        }).map((_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="w-9 h-9 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20"
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
