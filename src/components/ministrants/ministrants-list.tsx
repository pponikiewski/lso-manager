"use client";

import { useQuery } from "@tanstack/react-query";
import { getMinistrants } from "@/lib/api/ministrants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MinistrantsList() {
  const { data: ministrants, isLoading, isError } = useQuery({
    queryKey: ["ministrants"],
    queryFn: getMinistrants,
  });

  if (isLoading) return <div className="text-center p-4">Ładowanie listy...</div>;
  if (isError) return <div className="text-red-500 p-4">Błąd pobierania danych</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Ministrantów</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i Nazwisko</TableHead>
              <TableHead>Stopień</TableHead>
              <TableHead className="text-right">Punkty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ministrants?.map((min) => (
              <TableRow key={min.id}>
                <TableCell className="font-medium">
                  {min.first_name} {min.last_name}
                </TableCell>
                <TableCell>
                  {/* Wyświetlamy badge w kolorze z bazy danych */}
                  <Badge 
                    style={{ backgroundColor: min.ranks?.color || "#gray" }}
                    className="text-white hover:opacity-90"
                  >
                    {min.ranks?.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {min.points}
                </TableCell>
              </TableRow>
            ))}
            {ministrants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  Brak ministrantów. Dodaj pierwszego!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}