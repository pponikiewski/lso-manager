"use client";

import { useQuery } from "@tanstack/react-query";
import { getMinistrants } from "@/lib/api/ministrants";
import { AddAttendanceDialog } from "./add-attendance-dialog";
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
import { AttendanceType } from "@/types/db";

const getBadgeColor = (type: AttendanceType) => {
    switch(type) {
        case 'R': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
        case 'W': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200';
        case 'N': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200';
        case 'S': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200';
        default: return 'bg-gray-100 text-gray-700';
    }
}

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
        <CardTitle>Służba Nadobowiązkowa (Ranking)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Lp.</TableHead>
              <TableHead>Ministrant</TableHead>
              <TableHead>Ostatnie służby</TableHead>
              <TableHead className="text-right">Punkty</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ministrants?.map((min, index) => (
              <TableRow key={min.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{min.first_name} {min.last_name}</div>
                  <Badge 
                    variant="outline" 
                    style={{ borderColor: min.ranks?.color, color: min.ranks?.color }}
                    className="mt-1 text-xs"
                  >
                    {min.ranks?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {min.attendance_logs
                        ?.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                        .slice(0, 5)
                        .map((log) => (
                            <div 
                                key={log.id} 
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border ${getBadgeColor(log.event_type)}`}
                                title={`${log.event_date} (+${log.score}pkt)`}
                            >
                                {log.event_type}
                            </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {min.points}
                </TableCell>
                <TableCell>
                    <AddAttendanceDialog ministrantId={min.id} ministrantName={`${min.first_name} ${min.last_name}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}