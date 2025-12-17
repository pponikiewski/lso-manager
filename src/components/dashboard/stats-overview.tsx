"use client";

import { Users, Calendar, Award, TrendingUp } from "lucide-react";
import { StatCard } from "./stat-card";

export function StatsOverview() {
  // W przyszłości dane będą pobierane z API
  const stats = [
    {
      title: "Ministranci",
      value: 24,
      description: "Aktywnych ministrantów",
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Służby w tym miesiącu",
      value: 48,
      description: "Zaplanowane msze",
      icon: Calendar,
    },
    {
      title: "Służby nadobowiązkowe",
      value: 15,
      description: "W tym miesiącu",
      icon: Award,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Średnia frekwencja",
      value: "87%",
      description: "Obecność na służbach",
      icon: TrendingUp,
      trend: { value: 3, isPositive: true },
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
