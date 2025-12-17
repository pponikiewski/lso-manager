"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSunday,
  format,
  addMonths,
  subMonths,
  getDate,
} from "date-fns";
import { pl } from "date-fns/locale";
import { getGroups, getMinistrants } from "@/lib/api/ministrants";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Status obecności
type AttendanceStatus = "N" | "O" | null; // N = obecny (zielony), O = nieobecny (czerwony)

export function SundaySchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Obliczanie niedziel w miesiącu
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const sundays = daysInMonth.filter((day) => isSunday(day));

  // Pobieranie danych
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: ministrants } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
  });

  // Mock data - w przyszłości z bazy danych
  const mockGuilds = [
    {
      id: 1,
      name: "GILDIA I",
      ministrants: [
        { id: 1, name: "Kwoczyński Antoni", role: "ministrant" },
      ],
    },
    {
      id: 2,
      name: "GILDIA II",
      ministrants: [
        { id: 2, name: "Rudnicki Marek", role: "ministrant" },
        { id: 3, name: "Rudnicki Piotr", role: "Ministrant" },
      ],
    },
    {
      id: 3,
      name: "GILDIA III",
      ministrants: [
        { id: 4, name: "Mędrzak Maciej", role: "ministrant" },
      ],
    },
  ];

  // Mock attendance data
  const [attendance, setAttendance] = useState<Record<string, Record<number, AttendanceStatus>>>({
    "7": { 1: "N" },
    "14": { 2: "N" },
    "21": { 1: "N", 3: "O" },
    "28": {},
  });

  const getAttendance = (sundayDate: number, ministrantId: number): AttendanceStatus => {
    return attendance[sundayDate.toString()]?.[ministrantId] || null;
  };

  const handleCellClick = (sundayDate: number, ministrantId: number) => {
    setAttendance((prev) => {
      const dayKey = sundayDate.toString();
      const currentStatus = prev[dayKey]?.[ministrantId] || null;
      
      // Cykl: null -> N -> O -> null
      let newStatus: AttendanceStatus = null;
      if (currentStatus === null) newStatus = "N";
      else if (currentStatus === "N") newStatus = "O";
      else newStatus = null;

      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [ministrantId]: newStatus,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header z nawigacją */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gildie */}
      <div className="space-y-4">
        {mockGuilds.map((guild) => (
          <div key={guild.id} className="rounded-lg border bg-card overflow-hidden">
            {/* Header gildii */}
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2.5 border-b">
              <span className="font-bold text-sm">{guild.name}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {guild.ministrants.length} osób
              </span>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3 w-[280px]">
                      Nazwisko i Imię
                    </th>
                    {sundays.map((sunday) => (
                      <th
                        key={sunday.toISOString()}
                        className="text-center text-xs font-medium px-2 py-3 w-[60px]"
                      >
                        <div className="text-red-500 text-[10px]">ND</div>
                        <div className="text-foreground font-bold">{getDate(sunday)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guild.ministrants.map((ministrant) => (
                    <tr key={ministrant.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-medium">{ministrant.name}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({ministrant.role})
                        </span>
                      </td>
                      {sundays.map((sunday) => {
                        const dayNum = getDate(sunday);
                        const status = getAttendance(dayNum, ministrant.id);
                        return (
                          <td key={sunday.toISOString()} className="px-2 py-3 text-center">
                            <button
                              onClick={() => handleCellClick(dayNum, ministrant.id)}
                              className={cn(
                                "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                status === "N" && "bg-green-600 text-white hover:bg-green-700",
                                status === "O" && "bg-red-600 text-white hover:bg-red-700",
                                !status && "bg-muted/30 border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50"
                              )}
                            >
                              {status}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
