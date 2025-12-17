import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getDate } from "date-fns";
import { pl } from "date-fns/locale";
import { WeekdayTemplate, WeekdayScheduleEntry, TimeSlot, DayOfWeek } from "@/types/db";

const WEEKDAYS: { id: DayOfWeek; name: string }[] = [
  { id: 1, name: "Poniedziałek" },
  { id: 2, name: "Wtorek" },
  { id: 3, name: "Środa" },
  { id: 4, name: "Czwartek" },
  { id: 5, name: "Piątek" },
  { id: 6, name: "Sobota" },
];

const SLOTS: { id: TimeSlot; time: string }[] = [
  { id: "RANO", time: "7:00" },
  { id: "WIECZOR", time: "18:00" },
];

interface ExportData {
  templates: WeekdayTemplate[];
  attendance: WeekdayScheduleEntry[];
  currentMonth: Date;
}

export function exportWeekdayScheduleToPDF(data: ExportData) {
  const { templates, attendance, currentMonth } = data;
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthName = format(currentMonth, "LLLL", { locale: pl }).toUpperCase();

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

  // Sprawdź status obecności
  const getAttendanceStatus = (ministrantId: number, date: string, slot: TimeSlot): boolean | null => {
    const entry = attendance?.find(
      (a) => a.ministrant_id === ministrantId && a.date === date && a.time_slot === slot
    );
    return entry?.is_present ?? null;
  };

  // Generuj HTML dla jednej sekcji (dzień + slot)
  const generateSectionHTML = (dayOfWeek: DayOfWeek, dayName: string, slot: TimeSlot, time: string) => {
    const slotTemplates = getTemplatesForSlot(dayOfWeek, slot);
    const daysOfThisWeekday = getDaysOfWeekday(dayOfWeek);

    if (slotTemplates.length === 0) return "";

    const headerRow = `
      <tr>
        <th class="header-cell day-header">${dayName} ${time}</th>
        ${daysOfThisWeekday.map((d) => `<th class="header-cell date-header">${getDate(d)}</th>`).join("")}
      </tr>
    `;

    const rows = slotTemplates.map((template) => {
      const ministrant = template.ministrants;
      if (!ministrant) return "";

      const fullName = `${ministrant.last_name} ${ministrant.first_name}`;
      const cells = daysOfThisWeekday.map((dayDate) => {
        const dateStr = format(dayDate, "yyyy-MM-dd");
        const status = getAttendanceStatus(ministrant.id, dateStr, slot);
        const mark = status === true ? "O" : status === false ? "N" : "";
        return `<td class="data-cell">${mark}</td>`;
      }).join("");

      return `<tr><td class="name-cell">${fullName}</td>${cells}</tr>`;
    }).join("");

    return `
      <table class="schedule-table">
        <thead>${headerRow}</thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  // Generuj pary tabel (2 kolumny)
  const sections: string[] = [];
  for (const day of WEEKDAYS) {
    for (const slot of SLOTS) {
      const section = generateSectionHTML(day.id, day.name, slot.id, slot.time);
      if (section) sections.push(section);
    }
  }

  // Grupuj w pary (2 na wiersz)
  const pairs: string[] = [];
  for (let i = 0; i < sections.length; i += 2) {
    const left = sections[i] || "";
    const right = sections[i + 1] || "";
    pairs.push(`
      <div class="table-row">
        <div class="table-col">${left}</div>
        <div class="table-col">${right}</div>
      </div>
    `);
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Grafik - ${monthName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
          color: #000;
          background: #fff;
        }
        
        .page-header {
          text-align: left;
          margin-bottom: 10px;
          font-size: 11px;
        }
        
        .table-row {
          display: flex;
          gap: 15px;
          margin-bottom: 12px;
        }
        
        .table-col {
          flex: 1;
          min-width: 0;
        }
        
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        
        .schedule-table th,
        .schedule-table td {
          border: 1px solid #000;
          padding: 3px 4px;
          text-align: center;
          vertical-align: middle;
        }
        
        .header-cell {
          background: #f0f0f0;
          font-weight: bold;
        }
        
        .day-header {
          text-align: left;
          white-space: nowrap;
          padding: 5px 8px;
        }
        
        .date-header {
          width: 1%;
          white-space: nowrap;
          padding: 5px 6px;
        }
        
        .name-cell {
          text-align: left;
          white-space: nowrap;
          font-weight: normal;
          width: 1%;
          padding: 6px 10px;
        }
        
        .data-cell {
          width: 1%;
          white-space: nowrap;
          padding: 6px 6px;
          font-weight: bold;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="page-header">miesiąc: ${monthName}</div>
      ${pairs.join("")}
    </body>
    </html>
  `;

  // Otwórz nowe okno i drukuj
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
