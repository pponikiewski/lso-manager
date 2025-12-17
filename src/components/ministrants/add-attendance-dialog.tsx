"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAttendance } from "@/lib/api/ministrants";
import { AttendanceType } from "@/types/db";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Użyjemy Label zamiast FormLabel
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

// Prosta konfiguracja punktów
const DEFAULT_POINTS: Record<string, number> = {
  R: 10,
  W: 5,
  S: 20,
  N: 5,
};

interface Props {
  ministrantId: number;
  ministrantName: string;
}

export function AddAttendanceDialog({ ministrantId, ministrantName }: Props) {
  const [open, setOpen] = useState(false);
  
  // ZWYKŁY STATE (Zamiast Zoda)
  const [eventType, setEventType] = useState<string>("");
  const [score, setScore] = useState<number>(5);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      addAttendance({
        ministrant_id: ministrantId,
        event_type: eventType as AttendanceType,
        score: score,
        event_date: date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministrants"] });
      setOpen(false);
      // Reset formularza
      setEventType("");
      setScore(5);
    },
    onError: (err) => alert("Błąd: " + err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Nie przeładowuj strony
    if (!eventType) {
      alert("Musisz wybrać typ służby!");
      return;
    }
    mutation.mutate();
  };

  const handleTypeChange = (value: string) => {
    setEventType(value);
    setScore(DEFAULT_POINTS[value] || 0);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
            <PlusCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj służbę: {ministrantName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label>Typ Służby</Label>
            <Select onValueChange={handleTypeChange} value={eventType}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R">Rano (Msza poranna)</SelectItem>
                <SelectItem value="W">Wieczór (Msza wieczorna)</SelectItem>
                <SelectItem value="N">Nabożeństwo</SelectItem>
                <SelectItem value="S">Służba Specjalna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Punkty</Label>
              <Input 
                type="number" 
                value={score} 
                onChange={(e) => setScore(Number(e.target.value))} 
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}