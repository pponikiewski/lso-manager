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