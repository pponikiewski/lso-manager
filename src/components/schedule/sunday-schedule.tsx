"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSunday, 
  format, 
  addMonths, 
  subMonths 
} from "date-fns";
import { pl } from "date-fns/locale";
import { getMassTimes, getScheduleEntries, saveScheduleEntry } from "@/lib/api/schedule";
import { getGroups } from "@/lib/api/ministrants";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function SundaySchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const queryClient = useQueryClient();

  // 1. Obliczanie dat (Niedziele w miesiącu)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // POPRAWKA TUTAJ: Używamy funkcji strzałkowej
  const sundays = daysInMonth.filter((day) => isSunday(day));

  // 2. Pobieranie danych
  const { data: massTimes } = useQuery({
    queryKey: ["massTimes"],
    queryFn: getMassTimes,
  });

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
  });

  const { data: scheduleEntries } = useQuery({
    queryKey: ["schedule", format(monthStart, "yyyy-MM-dd")],
    queryFn: () => getScheduleEntries(format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")),
  });

  // 3. Mutacja
  const mutation = useMutation({
    mutationFn: (payload: { date: string; mass_time_id: number; group_id: number }) =>
      saveScheduleEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });

  const getAssignedGroupId = (dateStr: string, massTimeId: number) => {
    const entry = scheduleEntries?.find(
      (e) => e.date === dateStr && e.mass_time_id === massTimeId
    );
    return entry?.group_id?.toString() || "";
  };

  const handleGroupChange = (dateStr: string, massTimeId: number, groupId: string) => {
    mutation.mutate({
      date: dateStr,
      mass_time_id: massTimeId,
      group_id: Number(groupId),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">Godzina</TableHead>
                {sundays.map((sunday) => (
                    <TableHead key={sunday.toISOString()} className="text-center min-w-[120px]">
                    {format(sunday, "dd.MM", { locale: pl })}
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {massTimes?.map((mass) => (
                <TableRow key={mass.id}>
                    <TableCell className="font-medium">
                    {mass.start_time}
                    <div className="text-xs text-muted-foreground">{mass.description}</div>
                    </TableCell>
                    
                    {sundays.map((sunday) => {
                    const dateStr = format(sunday, "yyyy-MM-dd");
                    const assignedGroupId = getAssignedGroupId(dateStr, mass.id);

                    return (
                        <TableCell key={`${mass.id}-${dateStr}`} className="p-2 text-center">
                        <Select 
                            value={assignedGroupId} 
                            onValueChange={(val) => handleGroupChange(dateStr, mass.id, val)}
                        >
                            <SelectTrigger className={`h-8 w-full ${assignedGroupId ? "bg-primary/10 border-primary/20 font-semibold" : "text-muted-foreground"}`}>
                            <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                            {groups?.map((g) => (
                                <SelectItem key={g.id} value={g.id.toString()}>
                                {g.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </TableCell>
                    );
                    })}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}