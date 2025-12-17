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
  group_id: number | null; // Może być null, jeśli ktoś nie ma grupy
  points: number;
  is_active: boolean;
  created_at: string;
  ranks?: Rank;
  groups?: Group; // <--- To pozwoli nam pobrać nazwę grupy (join)
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

// Zaktualizujmy też typ Ministrant, bo teraz będziemy chcieli pobierać go razem z historią
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
  // Opcjonalne do joinów:
  groups?: Group;
  mass_times?: MassTime;
};