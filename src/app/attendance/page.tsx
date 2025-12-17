import { DashboardLayout, Header } from "@/components/layout";
import { AddAttendanceDialog } from "@/components/ministrants/add-attendance-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - w przyszłości z bazy danych
const ministrantsWithBadges = [
  {
    id: "1",
    name: "Jan Kowalski",
    badges: [
      { type: "R", date: "2024-12-15" },
      { type: "W", date: "2024-12-14" },
      { type: "S", date: "2024-12-10" },
      { type: "R", date: "2024-12-08" },
      { type: "N", date: "2024-12-07" },
      { type: "R", date: "2024-12-01" },
    ],
  },
  {
    id: "2",
    name: "Piotr Nowak",
    badges: [
      { type: "W", date: "2024-12-15" },
      { type: "R", date: "2024-12-14" },
      { type: "R", date: "2024-12-10" },
      { type: "N", date: "2024-12-08" },
    ],
  },
  {
    id: "3",
    name: "Michał Wiśniewski",
    badges: [
      { type: "S", date: "2024-12-15" },
      { type: "S", date: "2024-12-12" },
      { type: "R", date: "2024-12-08" },
    ],
  },
  {
    id: "4",
    name: "Adam Lewandowski",
    badges: [
      { type: "R", date: "2024-12-15" },
      { type: "W", date: "2024-12-14" },
      { type: "N", date: "2024-12-10" },
      { type: "R", date: "2024-12-08" },
      { type: "S", date: "2024-12-05" },
    ],
  },
  {
    id: "5",
    name: "Tomasz Kamiński",
    badges: [
      { type: "W", date: "2024-12-15" },
      { type: "R", date: "2024-12-12" },
    ],
  },
];

const badgeColors: Record<string, string> = {
  R: "bg-blue-500 hover:bg-blue-600",       // Rano
  W: "bg-orange-500 hover:bg-orange-600",   // Wieczór
  S: "bg-purple-500 hover:bg-purple-600",   // Specjalne
  N: "bg-green-500 hover:bg-green-600",     // Nabożeństwo
};

const badgeLabels: Record<string, string> = {
  R: "Rano",
  W: "Wieczór",
  S: "Specjalne",
  N: "Nabożeństwo",
};

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <Header
        title="Służba Nadobowiązkowa"
        description="Historia dodatkowych służb ministrantów"
      />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Lista ministrantów z odznakami za służby nadobowiązkowe
            </p>
          </div>
          <AddAttendanceDialog />
        </div>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Legenda odznak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(badgeLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={`${badgeColors[key]} text-white`}>{key}</Badge>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Ministrants with badges */}
        <div className="space-y-4">
          {ministrantsWithBadges.map((ministrant) => (
            <Card key={ministrant.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {ministrant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium">{ministrant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ministrant.badges.length} służb nadobowiązkowych
                      </p>
                    </div>
                  </div>
                  
                  {/* Horizontal badge bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {ministrant.badges.map((badge, index) => (
                      <Badge
                        key={index}
                        className={`${badgeColors[badge.type]} text-white cursor-default`}
                        title={`${badgeLabels[badge.type]} - ${badge.date}`}
                      >
                        {badge.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
