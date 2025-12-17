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
  lastDayOfMonth,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  // Map: "dayId-slotId" -> array of selected ministrant ids
  const [selectedToAdd, setSelectedToAdd] = useState<Record<string, number[]>>({});
  const [openPopoverFor, setOpenPopoverFor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Obliczanie dni w miesiącu
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  // Pobieranie szablonu (kto służy w który dzień) - filtrowane po miesiącu
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["weekday-templates", monthStartStr],
    queryFn: () => getWeekdayTemplates(monthStartStr, monthEndStr),
  });

  // Pobieranie ministrantów (tylko w trybie edycji)
  const { data: ministrants, isLoading: ministrantsLoading } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
    enabled: editMode,
  });

  // Pobieranie obecności na dany miesiąc
  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["weekday-attendance", monthStartStr],
    queryFn: () => getWeekdayAttendance(monthStartStr, monthEndStr),
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
    },
  });

  // Mutacja usuwania ministranta z szablonu
  const deleteMutation = useMutation({
    mutationFn: ({ id, endDate }: { id: number; endDate: string }) => deleteWeekdayTemplate(id, endDate),
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

  // Usuń ministranta z szablonu (soft delete - ustawia valid_to na koniec poprzedniego miesiąca)
  const handleDelete = (templateId: number) => {
    // Koniec poprzedniego miesiąca = ostatni dzień przed pierwszym dniem aktualnego miesiąca
    const prevMonthEnd = format(lastDayOfMonth(subMonths(currentMonth, 1)), "yyyy-MM-dd");
    deleteMutation.mutate({ id: templateId, endDate: prevMonthEnd });
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
            const availableMinistrants = getAvailableMinistrants(day.id, slot.id);

            return (
              <div
                key={`${day.id}-${slot.id}`}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* Header karty */}
                <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{day.full}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-full">
                      {slot.name} · {slot.time}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {slotTemplates.length} ministrantów
                  </span>
                </div>

                {/* Zawartość - tryb edycji vs normalny */}
                {editMode ? (
                  // TRYB EDYCJI
                  <div className="px-4 pb-4 pt-3 space-y-3 text-[12px] leading-tight">
                    {/* Przypisani ministranci */}
                    {slotTemplates.length > 0 && (
                      <div className="space-y-1.5">
                        {slotTemplates.map((template) => {
                          const ministrant = template.ministrants;
                          if (!ministrant) return null;

                          return (
                            <div
                              key={template.id}
                              className="flex items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2.5 hover:bg-muted/15 transition-colors"
                            >
                              <span className="text-[13px] font-semibold leading-tight">
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
                      </div>
                    )}

                    {/* Lista wyboru do dodania */}
                    {availableMinistrants.length > 0 && (() => {
                      const slotKey = `${day.id}-${slot.id}`;
                      const selected = selectedToAdd[slotKey] || [];
                      const isOpen = openPopoverFor === slotKey;
                      
                      const toggleMinistrant = (id: number) => {
                        setSelectedToAdd(prev => {
                          const current = prev[slotKey] || [];
                          if (current.includes(id)) {
                            return { ...prev, [slotKey]: current.filter(x => x !== id) };
                          } else {
                            return { ...prev, [slotKey]: [...current, id] };
                          }
                        });
                      };
                      
                      const handleAddSelected = () => {
                        selected.forEach(ministrantId => {
                          addMutation.mutate({
                            ministrant_id: ministrantId,
                            day_of_week: day.id,
                            time_slot: slot.id,
                            valid_from: monthStartStr, // Szablon obowiązuje od pierwszego dnia edytowanego miesiąca
                          });
                        });
                        setSelectedToAdd(prev => ({ ...prev, [slotKey]: [] }));
                        setOpenPopoverFor(null);
                      };
                      
                      return (
                        <Popover open={isOpen} onOpenChange={(open) => setOpenPopoverFor(open ? slotKey : null)}>
                          <PopoverTrigger asChild>
                            <button
                              className="w-full flex items-center justify-center gap-2 rounded-md border border-muted-foreground/40 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Dodaj ministranta
                              {selected.length > 0 && (
                                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                                  {selected.length}
                                </span>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-0" align="start">
                            <div className="divide-y divide-border/30 max-h-[250px] overflow-y-auto">
                              {availableMinistrants.map((m) => (
                                <label
                                  key={m.id}
                                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected.includes(m.id)}
                                    onChange={() => toggleMinistrant(m.id)}
                                    className="h-4 w-4 rounded border-border"
                                  />
                                  <span className="text-[13px]">
                                    {m.last_name} {m.first_name}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {selected.length > 0 && (
                              <div className="p-2 border-t border-border/50">
                                <Button
                                  size="sm"
                                  onClick={handleAddSelected}
                                  disabled={addMutation.isPending}
                                  className="w-full"
                                >
                                  {addMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  Dodaj ({selected.length})
                                </Button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      );
                    })()}

                    {availableMinistrants.length === 0 && slotTemplates.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4 text-center border border-border/40 rounded-md">
                        Brak ministrantów do przypisania
                      </p>
                    )}

                    {availableMinistrants.length === 0 && slotTemplates.length > 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Wszyscy ministranci są już przypisani
                      </p>
                    )}
                  </div>
                ) : (
                  // TRYB NORMALNY - tabela jak w referencji
                  <div className="overflow-x-auto px-4 pb-4 pt-2">
                    <table className="w-full border-collapse text-[12px] leading-tight">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-[12px] font-semibold text-muted-foreground uppercase px-3 py-2 min-w-[130px]">
                            Ministrant
                          </th>
                          {daysOfThisWeekday.map((dayDate) => (
                            <th
                              key={dayDate.toISOString()}
                              className="text-center text-[12px] font-semibold text-muted-foreground px-1.5 py-1 w-[26px] border-l border-border/40"
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
                                      <div className="flex items-center justify-center py-[6px]">
                                        <button
                                          onClick={() => handleCellClick(ministrant.id, dateStr, slot.id)}
                                          disabled={attendanceMutation.isPending}
                                          className={cn(
                                            "w-8 h-8 rounded text-[13px] font-bold leading-none transition-all",
                                            status === true && "bg-green-600 text-white hover:bg-green-700",
                                            status === false && "bg-red-600 text-white hover:bg-red-700",
                                            status === null && "bg-muted/30 border border-border/40 hover:border-muted-foreground/60 hover:bg-muted/60"
                                          )}
                                        >
                                          {status === true && "O"}
                                          {status === false && "N"}
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
