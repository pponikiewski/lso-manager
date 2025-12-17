"use client";

import { Calendar, Clock, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "sunday" | "weekday" | "special";
  ministrants: number;
}

const mockEvents: UpcomingEvent[] = [
  {
    id: "1",
    title: "Msza Niedzielna",
    date: "22 Gru",
    time: "10:00",
    type: "sunday",
    ministrants: 6,
  },
  {
    id: "2",
    title: "Msza Niedzielna",
    date: "22 Gru",
    time: "12:00",
    type: "sunday",
    ministrants: 6,
  },
  {
    id: "3",
    title: "Roraty",
    date: "23 Gru",
    time: "06:30",
    type: "special",
    ministrants: 4,
  },
  {
    id: "4",
    title: "Msza poranna",
    date: "24 Gru",
    time: "07:00",
    type: "weekday",
    ministrants: 2,
  },
  {
    id: "5",
    title: "Pasterka",
    date: "24 Gru",
    time: "24:00",
    type: "special",
    ministrants: 8,
  },
];

const typeColors = {
  sunday: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  weekday: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  special: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const typeLabels = {
  sunday: "Niedziela",
  weekday: "Dzień powszedni",
  special: "Specjalna",
};

export function UpcomingServices() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Nadchodzące służby
        </CardTitle>
        <CardDescription>Najbliższe zaplanowane msze i nabożeństwa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted px-3 py-2 text-center">
                  <span className="text-xs text-muted-foreground">
                    {event.date.split(" ")[1]}
                  </span>
                  <span className="text-lg font-bold">
                    {event.date.split(" ")[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{event.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{event.time}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <User className="h-3.5 w-3.5" />
                    <span>{event.ministrants} ministrantów</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={typeColors[event.type]}>
                {typeLabels[event.type]}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
