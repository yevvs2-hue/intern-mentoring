export const DEADLINES: Record<string, { text: string; color: string; round?: number }[]> = {
  "2026-07-10": [{ text: "계획서", color: "gray" }],
  "2026-07-16": [{ text: "멘토링 1차", color: "blue", round: 0 }, { text: "탐구 1차", color: "purple", round: 0 }],
  "2026-07-23": [{ text: "멘토링 2차", color: "blue", round: 1 }, { text: "탐구 2차", color: "purple", round: 1 }],
  "2026-07-30": [{ text: "멘토링 3차", color: "blue", round: 2 }, { text: "탐구 3차", color: "purple", round: 2 }, { text: "멘토링 리뷰", color: "green" }],
};
