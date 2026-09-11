export type Side = "player" | "banker";

export type BetPreset =
  | "playerDragonBonus"
  | "bankerDragonBonus"
  | "dragon7"
  | "panda8"
  | "fortune7";

export type OutcomeCode =
  | "win9"
  | "win8"
  | "win7"
  | "win6"
  | "win5"
  | "win4"
  | "naturalWin"
  | "naturalTie"
  | "dragon7"
  | "panda8"
  | "loss";

export interface PayTable {
  win9: number;
  win8: number;
  win7: number;
  win6: number;
  win5: number;
  win4: number;
  naturalWin: number;
  naturalTie: number;
  specialWin: number;
  loss: number;
}

export interface ShoeConfig {
  decks: number;
  cardsPerDeck: number;

  cutCardsFromEnd: number;

  minHands: number;
  maxHands: number;
  targetHands: number;

  simulations: number;
}

export interface BetConfig {
  preset: BetPreset;
  side: Side;
  wager: number;
  payTable: PayTable;
}

export interface HandResult {
  playerCards: number[];
  bankerCards: number[];

  playerTotal: number;
  bankerTotal: number;

  playerNatural: boolean;
  bankerNatural: boolean;

  winner: "player" | "banker" | "tie";

  cardsUsed: number;
}

export interface ProbabilityRow {
  outcome: string;
  probability: number;
  payout: number;
  contribution: number;
}

export interface ExactResult {
  hands: number;

  winProbability: number;
  lossProbability: number;
  pushProbability: number;

  winningHitRate: number;
  hitRate: number;

  evPerUnit: number;
  houseEdge: number;
  playerEdge: number;

  breakEvenPayout: number;

  rows: ProbabilityRow[];
}

export interface FiniteShoePoint {
  handNumber: number;

  probability: number;
  ev: number;

  remainingCards: number;
}

export interface FiniteShoeResult {
  handsPlayed: number;

  totalHands: number;

  wins: number;
  losses: number;
  pushes: number;

  winningHitRate: number;
  hitRate: number;
  lossRate: number;
  pushRate: number;

  evPerUnit: number;
  houseEdge: number;

  expectedProfitPerShoe: number;
  expectedProfitPer100Hands: number;
  expectedProfitPer1000Hands: number;

  handByHand: FiniteShoePoint[];
}
