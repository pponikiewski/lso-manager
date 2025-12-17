"use client";

import { Award, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopMinistrant {
  id: string;
  name: string;
  points: number;
  services: number;
  rank: number;
}

const mockTopMinistrants: TopMinistrant[] = [
  { id: "1", name: "Jan Kowalski", points: 156, services: 24, rank: 1 },
  { id: "2", name: "Piotr Nowak", points: 142, services: 22, rank: 2 },
  { id: "3", name: "Michał Wiśniewski", points: 128, services: 20, rank: 3 },
  { id: "4", name: "Adam Lewandowski", points: 115, services: 18, rank: 4 },
  { id: "5", name: "Tomasz Kamiński", points: 108, services: 17, rank: 5 },
];

const rankColors: Record<number, string> = {
  1: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  2: "bg-gray-400/10 text-gray-400 border-gray-400/30",
  3: "bg-amber-600/10 text-amber-600 border-amber-600/30",
};

export function TopMinistrants() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Top Ministranci
        </CardTitle>
        <CardDescription>Ranking według punktów w tym miesiącu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTopMinistrants.map((ministrant) => (
            <div
              key={ministrant.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={rankColors[ministrant.rank] || ""}
                >
                  #{ministrant.rank}
                </Badge>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {ministrant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{ministrant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ministrant.services} służb
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{ministrant.points} pkt</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
