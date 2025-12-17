export type Rank = {
  id: number;
  name: string;
  short_name: string;
  color: string;
};

export type Ministrant = {
  id: number;
  first_name: string;
  last_name: string;
  rank_id: number;
  points: number;
  is_active: boolean;
  created_at: string;
  // Opcjonalnie, jeśli dołączymy tabelę ranks w zapytaniu (join):
  ranks?: Rank; 
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