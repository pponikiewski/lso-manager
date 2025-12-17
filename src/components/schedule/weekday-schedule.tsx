"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  addMonths, 
  subMonths,
  isSunday 
} from "date-fns";
import { pl } from "date-fns/locale";
import { getWeekdayEntries, addWeekdayEntry, deleteWeekdayEntry } from "@/lib/api/schedule";
import { getMinistrants } from "@/lib/api/ministrants";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Printer, X } from "lucide-react";

// Stałe pory dnia
const SLOTS = ["RANO", "WIECZOR"] as const;

export function WeekdaySchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const queryClient = useQueryClient();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // Pobieramy wszystkie dni miesiąca
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 1. Pobieranie danych
  const { data: ministrants } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
  });

  const { data: entries } = useQuery({
    queryKey: ["weekday-schedule", format(monthStart, "yyyy-MM-dd")],
    queryFn: () => getWeekdayEntries(format(monthStart, "yyyy-MM-dd"), format(monthEnd, "yyyy-MM-dd")),
  });

  // 2. Mutacje (Dodawanie i Usuwanie)
  const addMutation = useMutation({
    mutationFn: (payload: { date: string; time_slot: "RANO" | "WIECZOR"; ministrant_id: number }) =>
      addWeekdayEntry(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weekday-schedule"] }),
    onError: (err) => alert("Błąd: " + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWeekdayEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weekday-schedule"] }),
  });

  // Helpery
  const handleAdd = (dateStr: string, slot: "RANO" | "WIECZOR", ministrantId: string) => {
    addMutation.mutate({
      date: dateStr,
      time_slot: slot,
      ministrant_id: Number(ministrantId),
    });
  };

  const getEntriesForCell = (dateStr: string, slot: string) => {
    return entries?.filter((e: any) => e.date === dateStr && e.time_slot === slot) || [];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold capitalize">
          Grafik Tygodniowy - {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </CardTitle>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </CardHeader>
      
      <CardContent className="card-content">
        <div className="overflow-x-auto border rounded-md">
            <Table className="min-w-[1200px] border-collapse">
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px] sticky left-0 bg-background z-10 border-r">Pora dnia</TableHead>
                {daysInMonth.map((day) => {
                    const isSun = isSunday(day);
                    return (
                        <TableHead 
                            key={day.toISOString()} 
                            className={`text-center min-w-[140px] border-l ${isSun ? "bg-red-500/10 text-red-500" : ""}`}
                        >
                            <div className="font-bold">{format(day, "dd")}</div>
                            <div className="text-xs font-normal uppercase">{format(day, "EEE", { locale: pl })}</div>
                        </TableHead>
                    )
                })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {SLOTS.map((slot) => (
                <TableRow key={slot}>
                    {/* Nagłówek wiersza (Rano/Wieczór) */}
                    <TableCell className="font-bold sticky left-0 bg-background z-10 border-r">
                        {slot}
                    </TableCell>
                    
                    {/* Komórki dla każdego dnia */}
                    {daysInMonth.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const cellEntries = getEntriesForCell(dateStr, slot);
                    const isSun = isSunday(day);

                    // Jeśli to niedziela, w grafiku tygodniowym zaznaczamy ją na szaro (bo jest osobny grafik niedzielny)
                    if (isSun) {
                        return <TableCell key={dateStr} className="bg-muted/30 border-l" />;
                    }

                    return (
                        <TableCell key={dateStr} className="p-2 border-l align-top min-h-[100px]">
                            <div className="flex flex-col gap-2">
                                {/* Lista zapisanych */}
                                <div className="flex flex-wrap gap-1">
                                    {cellEntries.map((entry: any) => (
                                        <Badge key={entry.id} variant="secondary" className="text-xs flex gap-1 items-center px-1">
                                            {entry.ministrants?.first_name} {entry.ministrants?.last_name?.charAt(0)}.
                                            <X 
                                                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                                                onClick={() => deleteMutation.mutate(entry.id)}
                                            />
                                        </Badge>
                                    ))}
                                </div>

                                {/* Dropdown do dodawania (Select jako przycisk +) */}
                                <Select 
                                    value="" 
                                    onValueChange={(val) => handleAdd(dateStr, slot, val)}
                                >
                                    <SelectTrigger className="h-6 w-full text-xs bg-transparent border-dashed border-muted-foreground/30 hover:border-primary text-muted-foreground">
                                        <SelectValue placeholder="+ Dodaj" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ministrants?.map((m) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                {m.first_name} {m.last_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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