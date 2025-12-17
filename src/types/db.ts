export type Rank = {
  id: number;
  name: string;
  short_name: string;
  color: string;
};

export type Group = {
  id: number;
  name: string;
};

export type Ministrant = {
  id: number;
  first_name: string;
  last_name: string;
  rank_id: number;
  group_id: number | null;
  points: number;
  is_active: boolean;
  created_at: string;
  ranks?: Rank;
  groups?: Group;
};

export type AttendanceType = 'R' | 'W' | 'S' | 'N';

export type AttendanceLog = {
  id: number;
  ministrant_id: number;
  event_type: AttendanceType;
  score: number;
  event_date: string;
  created_at: string;
};

export type MinistrantWithLogs = Ministrant & {
  attendance_logs: AttendanceLog[];
};

export type MassTime = {
  id: number;
  start_time: string;
  description: string | null;
  display_order: number;
};

export type ScheduleEntry = {
  id: number;
  date: string;
  mass_time_id: number;
  group_id: number | null;
  groups?: Group;
  mass_times?: MassTime;
};

// ==================== GRAFIK TYGODNIOWY ====================

// Dzień tygodnia (1=Poniedziałek, 7=Niedziela)
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Slot czasowy
export type TimeSlot = 'RANO' | 'WIECZOR';

// Szablon grafiku tygodniowego - kto służy w który dzień/slot
export type WeekdayTemplate = {
  id: number;
  ministrant_id: number;
  day_of_week: DayOfWeek;
  time_slot: TimeSlot;
  ministrants?: Ministrant;
};

// Wpis obecności w grafiku tygodniowym - konkretna data
export type WeekdayScheduleEntry = {
  id: number;
  ministrant_id: number;
  date: string; // YYYY-MM-DD
  time_slot: TimeSlot;
  is_present: boolean | null; // null = jeszcze nie zaznaczono
  ministrants?: Ministrant;
};

// ==================== GRAFIK NIEDZIELNY ====================

// Wpis obecności ministranta na niedzielnej mszy
export type SundayAttendance = {
  id: number;
  ministrant_id: number;
  date: string; // YYYY-MM-DD (niedziela)
  status: 'N' | 'O' | null; // N=obecny, O=nieobecny
  ministrants?: Ministrant;
};