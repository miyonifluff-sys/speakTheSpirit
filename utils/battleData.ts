export interface BattleRound {
  question: string;
  correct: string;
  options: string[];
}

export const BATTLE_ROUNDS: BattleRound[] = [
  {
    question: "For God so ________ the world...",
    correct: "Loved",
    options: ["Hated", "Loved", "Forgot", "Created"],
  },
  {
    question: "...that He gave His only begotten ________...",
    correct: "Son",
    options: ["Servant", "Prophet", "Son", "Book"],
  },
  {
    question: "...that whoever believes in Him should not perish but have eternal ________.",
    correct: "Life",
    options: ["Riches", "Life", "Fame", "Comfort"],
  }
];
