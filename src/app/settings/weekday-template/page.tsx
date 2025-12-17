"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout, Header } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getWeekdayTemplates, addWeekdayTemplate, deleteWeekdayTemplate } from "@/lib/api/schedule";
import { getMinistrants } from "@/lib/api/ministrants";
import { DayOfWeek, TimeSlot, WeekdayTemplate } from "@/types/db";
import { Pencil, X, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Nazwy dni tygodnia
const WEEKDAYS: { id: DayOfWeek; name: string }[] = [
  { id: 1, name: "Poniedziałek" },
  { id: 2, name: "Wtorek" },
  { id: 3, name: "Środa" },
  { id: 4, name: "Czwartek" },
  { id: 5, name: "Piątek" },
  { id: 6, name: "Sobota" },
];

const SLOTS: { id: TimeSlot; name: string }[] = [
  { id: "RANO", name: "Rano" },
  { id: "WIECZOR", name: "Wieczór" },
];

export default function WeekdayTemplatePage() {
  const [editMode, setEditMode] = useState(false);
  const [addingTo, setAddingTo] = useState<{ day: DayOfWeek; slot: TimeSlot } | null>(null);
  const [selectedMinistrant, setSelectedMinistrant] = useState<string>("");
  const queryClient = useQueryClient();

  // Pobierz szablon
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["weekday-templates"],
    queryFn: getWeekdayTemplates,
  });

  // Pobierz ministrantów
  const { data: ministrants, isLoading: ministrantsLoading } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
  });

  // Mutacja dodawania
  const addMutation = useMutation({
    mutationFn: addWeekdayTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekday-templates"] });
      setAddingTo(null);
      setSelectedMinistrant("");
    },
  });

  // Mutacja usuwania
  const deleteMutation = useMutation({
    mutationFn: deleteWeekdayTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekday-templates"] });
    },
  });

  // Filtruj szablony dla danego dnia i slotu
  const getTemplatesForSlot = (day: DayOfWeek, slot: TimeSlot): WeekdayTemplate[] => {
    return templates?.filter((t) => t.day_of_week === day && t.time_slot === slot) || [];
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

  // Dodaj ministranta
  const handleAdd = (day: DayOfWeek, slot: TimeSlot) => {
    if (!selectedMinistrant) return;
    addMutation.mutate({
      ministrant_id: Number(selectedMinistrant),
      day_of_week: day,
      time_slot: slot,
    });
  };

  // Usuń ministranta
  const handleDelete = (templateId: number) => {
    deleteMutation.mutate(templateId);
  };

  const isLoading = templatesLoading || ministrantsLoading;

  return (
    <DashboardLayout>
      <Header
        title="Szablon Grafiku Tygodniowego"
        description="Przypisz ministrantów do poszczególnych dni i godzin"
      />

      <div className="p-6 space-y-6">
        {/* Przycisk Edit Mode */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {editMode
              ? "Tryb edycji - kliknij + aby dodać ministranta, × aby usunąć"
              : "Kliknij przycisk Edytuj aby modyfikować szablon"}
          </p>
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => {
              setEditMode(!editMode);
              setAddingTo(null);
            }}
            className="gap-2"
          >
            {editMode ? (
              <>
                <Check className="h-4 w-4" />
                Zakończ edycję
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Edytuj szablon
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {WEEKDAYS.map((day) =>
              SLOTS.map((slot) => {
                const slotTemplates = getTemplatesForSlot(day.id, slot.id);
                const isAddingHere = addingTo?.day === day.id && addingTo?.slot === slot.id;
                const availableMinistrants = getAvailableMinistrants(day.id, slot.id);

                return (
                  <Card key={`${day.id}-${slot.id}`} className="overflow-hidden">
                    {/* Header karty */}
                    <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{day.name}</span>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {slot.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {slotTemplates.length} ministrantów
                      </span>
                    </div>

                    <CardContent className="p-4">
                      {/* Lista ministrantów */}
                      <div className="space-y-2">
                        {slotTemplates.length === 0 && !editMode && (
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
                              className={cn(
                                "flex items-center justify-between rounded-lg border px-3 py-2 transition-colors",
                                editMode && "hover:bg-destructive/10"
                              )}
                            >
                              <span className="font-medium text-sm">
                                {ministrant.last_name} {ministrant.first_name}
                              </span>
                              {editMode && (
                                <button
                                  onClick={() => handleDelete(template.id)}
                                  disabled={deleteMutation.isPending}
                                  className="text-destructive hover:text-destructive/80 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Formularz dodawania */}
                        {editMode && isAddingHere && (
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
                        {editMode && !isAddingHere && availableMinistrants.length > 0 && (
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

                        {editMode && availableMinistrants.length === 0 && slotTemplates.length > 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Wszyscy ministranci są już przypisani
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
