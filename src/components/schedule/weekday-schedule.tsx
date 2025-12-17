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
  getDay,
  getDate,
} from "date-fns";
import { pl } from "date-fns/locale";
import { 
  getWeekdayTemplates, 
  getWeekdayAttendance, 
  saveWeekdayAttendance,
  addWeekdayTemplate,
  deleteWeekdayTemplate 
} from "@/lib/api/schedule";
import { getMinistrants } from "@/lib/api/ministrants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSlot, DayOfWeek, WeekdayTemplate } from "@/types/db";

// Wszystkie dni tygodnia (bez niedzieli)
const WEEKDAYS: { id: DayOfWeek; full: string; short: string }[] = [
  { id: 1, full: "Poniedziałek", short: "PONIEDZIAŁEK" },
  { id: 2, full: "Wtorek", short: "WTOREK" },
  { id: 3, full: "Środa", short: "ŚRODA" },
  { id: 4, full: "Czwartek", short: "CZWARTEK" },
  { id: 5, full: "Piątek", short: "PIĄTEK" },
  { id: 6, full: "Sobota", short: "SOBOTA" },
];

const SLOTS: { id: TimeSlot; name: string; time: string }[] = [
  { id: "RANO", name: "Rano", time: "7:00" },
  { id: "WIECZOR", name: "Wieczór", time: "18:00" },
];

interface WeekdayScheduleProps {
  editMode?: boolean;
  onEditModeChange?: (editMode: boolean) => void;
}

export function WeekdaySchedule({ editMode = false, onEditModeChange }: WeekdayScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addingTo, setAddingTo] = useState<{ day: DayOfWeek; slot: TimeSlot } | null>(null);
  const [selectedMinistrant, setSelectedMinistrant] = useState<string>("");
  const queryClient = useQueryClient();

  // Obliczanie dni w miesiącu
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pobieranie szablonu (kto służy w który dzień)
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["weekday-templates"],
    queryFn: getWeekdayTemplates,
  });

  // Pobieranie ministrantów (tylko w trybie edycji)
  const { data: ministrants, isLoading: ministrantsLoading } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
    enabled: editMode,
  });

  // Pobieranie obecności na dany miesiąc
  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["weekday-attendance", format(monthStart, "yyyy-MM-dd")],
    queryFn: () => getWeekdayAttendance(
      format(monthStart, "yyyy-MM-dd"),
      format(monthEnd, "yyyy-MM-dd")
    ),
    enabled: !editMode,
  });

  // Mutacja do zapisywania obecności
  const attendanceMutation = useMutation({
    mutationFn: saveWeekdayAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekday-attendance"] });
    },
  });

  // Mutacja dodawania ministranta do szablonu
  const addMutation = useMutation({
    mutationFn: addWeekdayTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekday-templates"] });
      setAddingTo(null);
      setSelectedMinistrant("");
    },
  });

  // Mutacja usuwania ministranta z szablonu
  const deleteMutation = useMutation({
    mutationFn: deleteWeekdayTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekday-templates"] });
    },
  });

  // Funkcja do pobierania dni danego dnia tygodnia w miesiącu
  const getDaysOfWeekday = (dayOfWeek: DayOfWeek) => {
    return daysInMonth.filter((day) => {
      const jsDay = getDay(day);
      const mappedDay = jsDay === 0 ? 7 : jsDay;
      return mappedDay === dayOfWeek;
    });
  };

  // Pobierz szablony dla danego dnia i slotu
  const getTemplatesForSlot = (dayOfWeek: DayOfWeek, slot: TimeSlot): WeekdayTemplate[] => {
    return templates?.filter((t) => t.day_of_week === dayOfWeek && t.time_slot === slot) || [];
  };

  // Ministranci już przypisani do danego slotu
  const getAssignedMinistrantIds = (day: DayOfWeek, slot: TimeSlot): number[] => {
    return getTemplatesForSlot(day, slot).map((t) => t.ministrant_id);
  };

  // Dostępni ministranci (nie przypisani jeszcze do tego slotu)
  const getAvailableMinistrants = (day: DayOfWeek, slot: TimeSlot) => {
    const assigned = getAssignedMinistrantIds(day, slot);
    return ministrants?.filter((m) => !assigned.includes(m.id)) || [];
  };

  // Sprawdź status obecności
  const getAttendanceStatus = (ministrantId: number, date: string, slot: TimeSlot): boolean | null => {
    const entry = attendance?.find(
      (a) => a.ministrant_id === ministrantId && a.date === date && a.time_slot === slot
    );
    return entry?.is_present ?? null;
  };

  // Obsługa kliknięcia komórki
  const handleCellClick = (ministrantId: number, date: string, slot: TimeSlot) => {
    const currentStatus = getAttendanceStatus(ministrantId, date, slot);
    
    let newStatus: boolean | null;
    if (currentStatus === null) newStatus = true;
    else if (currentStatus === true) newStatus = false;
    else newStatus = null;

    attendanceMutation.mutate({
      ministrant_id: ministrantId,
      date,
      time_slot: slot,
      is_present: newStatus,
    });
  };

  // Dodaj ministranta do szablonu
  const handleAdd = (day: DayOfWeek, slot: TimeSlot) => {
    if (!selectedMinistrant) return;
    addMutation.mutate({
      ministrant_id: Number(selectedMinistrant),
      day_of_week: day,
      time_slot: slot,
    });
  };

  // Usuń ministranta z szablonu
  const handleDelete = (templateId: number) => {
    deleteMutation.mutate(templateId);
  };

  const isLoading = templatesLoading || (editMode && ministrantsLoading) || (!editMode && attendanceLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header z nawigacją */}
      <div className="flex items-center justify-between">
        {editMode ? (
          <p className="text-muted-foreground">
            Tryb edycji - kliknij + aby dodać ministranta, × aby usunąć
          </p>
        ) : (
          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: pl })}
          </h2>
        )}
        <div className="flex gap-2">
          {!editMode && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Karty dla WSZYSTKICH dni tygodnia i slotów */}
      <div className="grid gap-4 lg:grid-cols-2">
        {WEEKDAYS.map((day) =>
          SLOTS.map((slot) => {
            const daysOfThisWeekday = getDaysOfWeekday(day.id);
            const slotTemplates = getTemplatesForSlot(day.id, slot.id);
            const isAddingHere = addingTo?.day === day.id && addingTo?.slot === slot.id;
            const availableMinistrants = getAvailableMinistrants(day.id, slot.id);

            return (
              <div
                key={`${day.id}-${slot.id}`}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* Header karty */}
                <div className="flex items-center justify-between bg-muted/50 px-4 py-2.5 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{day.full}</span>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {slot.name} {slot.time}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {slotTemplates.length} ministrantów
                  </span>
                </div>

                {/* Zawartość - tryb edycji vs normalny */}
                {editMode ? (
                  // TRYB EDYCJI - lista z możliwością dodawania/usuwania
                  <div className="p-4 space-y-2">
                    {slotTemplates.length === 0 && !isAddingHere && (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Brak przypisanych ministrantów
                      </p>
                    )}

                    {slotTemplates.map((template) => {
                      const ministrant = template.ministrants;
                      if (!ministrant) return null;

                      return (
                        <div
                          key={template.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-destructive/10 transition-colors"
                        >
                          <span className="font-medium text-sm">
                            {ministrant.last_name} {ministrant.first_name}
                          </span>
                          <button
                            onClick={() => handleDelete(template.id)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive/80 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Formularz dodawania */}
                    {isAddingHere && (
                      <div className="flex items-center gap-2 pt-2">
                        <Select
                          value={selectedMinistrant}
                          onValueChange={setSelectedMinistrant}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Wybierz ministranta" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMinistrants.map((m) => (
                              <SelectItem key={m.id} value={m.id.toString()}>
                                {m.last_name} {m.first_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleAdd(day.id, slot.id)}
                          disabled={!selectedMinistrant || addMutation.isPending}
                        >
                          {addMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setAddingTo(null);
                            setSelectedMinistrant("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Przycisk dodawania */}
                    {!isAddingHere && availableMinistrants.length > 0 && (
                      <button
                        onClick={() => {
                          setAddingTo({ day: day.id, slot: slot.id });
                          setSelectedMinistrant("");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Dodaj ministranta
                      </button>
                    )}

                    {availableMinistrants.length === 0 && slotTemplates.length > 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Wszyscy ministranci są już przypisani
                      </p>
                    )}
                  </div>
                ) : (
                  // TRYB NORMALNY - tabela jak w referencji
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12px] leading-tight">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-[12px] font-semibold text-muted-foreground uppercase px-3 py-2 min-w-[140px]">
                            Ministrant
                          </th>
                          {daysOfThisWeekday.map((dayDate) => (
                            <th
                              key={dayDate.toISOString()}
                              className="text-center text-[12px] font-semibold text-muted-foreground px-1.5 py-1 w-[28px] border-l border-border/40"
                            >
                              {getDate(dayDate)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {slotTemplates.length === 0 ? (
                          <tr>
                            <td
                              colSpan={daysOfThisWeekday.length + 1}
                              className="px-3 py-6 text-center text-sm text-muted-foreground"
                            >
                              Brak przypisanych ministrantów
                            </td>
                          </tr>
                        ) : (
                          slotTemplates.map((template) => {
                            const ministrant = template.ministrants;
                            if (!ministrant) return null;

                            const fullName = `${ministrant.last_name} ${ministrant.first_name}`;

                            return (
                              <tr key={template.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-3 py-2.5 text-[13px] font-semibold leading-tight whitespace-nowrap">
                                  {fullName}
                                </td>
                                {daysOfThisWeekday.map((dayDate) => {
                                  const dateStr = format(dayDate, "yyyy-MM-dd");
                                  const status = getAttendanceStatus(ministrant.id, dateStr, slot.id);

                                  return (
                                    <td
                                      key={dayDate.toISOString()}
                                      className="p-0 text-center align-middle border-l border-border/40"
                                    >
                                      <div className="flex items-center justify-center py-[5px]">
                                        <button
                                          onClick={() => handleCellClick(ministrant.id, dateStr, slot.id)}
                                          disabled={attendanceMutation.isPending}
                                          className={cn(
                                            "w-7 h-7 rounded text-[12px] font-semibold leading-none transition-all",
                                            status === true && "bg-green-600 text-white hover:bg-green-700",
                                            status === false && "bg-red-600 text-white hover:bg-red-700",
                                            status === null && "bg-muted/30 border border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-muted/50"
                                          )}
                                        >
                                          {status === true && "o"}
                                          {status === false && "n"}
                                        </button>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
