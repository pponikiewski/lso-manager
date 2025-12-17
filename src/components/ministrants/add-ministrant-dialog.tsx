"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createMinistrant, getRanks } from "@/lib/api/ministrants";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schemat walidacji formularza
const formSchema = z.object({
  first_name: z.string().min(2, "Imię musi mieć min. 2 znaki"),
  last_name: z.string().min(2, "Nazwisko musi mieć min. 2 znaki"),
  rank_id: z.string().min(1, "Wybierz stopień"), // Select zwraca stringa, przekonwertujemy go
});

export function AddMinistrantDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // 1. Pobieramy stopnie do selecta
  const { data: ranks } = useQuery({
    queryKey: ["ranks"],
    queryFn: getRanks,
  });

  // 2. Setup formularza
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      rank_id: "",
    },
  });

  // 3. Mutacja (Wysyłka danych)
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      createMinistrant({
        first_name: values.first_name,
        last_name: values.last_name,
        rank_id: Number(values.rank_id),
      }),
    onSuccess: () => {
      // Odśwież listę ministrantów automatycznie!
      queryClient.invalidateQueries({ queryKey: ["ministrants"] });
      setOpen(false); // Zamknij modal
      form.reset(); // Wyczyść formularz
    },
    onError: (error) => {
      alert("Błąd: " + error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Dodaj Ministranta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nowy Ministrant</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imię</FormLabel>
                  <FormControl>
                    <Input placeholder="Jan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwisko</FormLabel>
                  <FormControl>
                    <Input placeholder="Kowalski" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rank_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stopień</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz stopień" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ranks?.map((rank) => (
                        <SelectItem key={rank.id} value={rank.id.toString()}>
                          {rank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}