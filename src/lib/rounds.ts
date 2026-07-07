export interface MentoringRound {
  label: string;
  start: string; // inclusive, YYYY-MM-DD
  end: string; // inclusive, YYYY-MM-DD
}

export const MENTORING_ROUNDS: MentoringRound[] = [
  { label: "1차", start: "2026-07-06", end: "2026-07-16" },
  { label: "2차", start: "2026-07-17", end: "2026-07-23" },
  { label: "3차", start: "2026-07-24", end: "2026-07-31" },
];

export function getRoundIndex(dateStr: string): number {
  return MENTORING_ROUNDS.findIndex((r) => dateStr >= r.start && dateStr <= r.end);
}
