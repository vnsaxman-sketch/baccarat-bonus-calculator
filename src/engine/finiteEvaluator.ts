
import type {
  BetConfig,
  HandResult,
  OutcomeCode,
} from "../types";

export function classifyFiniteOutcome(
  hand: HandResult,
  bet: BetConfig,
): OutcomeCode {
  const p =
    hand.playerTotal;

  const b =
    hand.bankerTotal;

  if (
    bet.preset ===
      "dragon7" ||
    bet.preset ===
      "fortune7"
  ) {
    return (
      hand.bankerCards.length === 3 &&
      b === 7 &&
      b > p
    )
      ? "dragon7"
      : "loss";
  }

  if (
    bet.preset ===
    "panda8"
  ) {
    return (
      hand.playerCards.length === 3 &&
      p === 8 &&
      p > b
    )
      ? "panda8"
      : "loss";
  }

  const selectedTotal =
    bet.side === "player"
      ? p
      : b;

  const opponentTotal =
    bet.side === "player"
      ? b
      : p;

  const selectedCards =
    bet.side === "player"
      ? hand.playerCards
      : hand.bankerCards;

  const natural =
    selectedCards.length === 2 &&
    selectedTotal >= 8;

  if (
    natural &&
    selectedTotal >
      opponentTotal
  ) {
    return "naturalWin";
  }

  if (
    natural &&
    selectedTotal ===
      opponentTotal
  ) {
    return "naturalTie";
  }

  if (
    selectedTotal <=
    opponentTotal
  ) {
    return "loss";
  }

  const margin =
    selectedTotal -
    opponentTotal;

  if (margin >= 9) {
    return "win9";
  }

  if (margin === 8) {
    return "win8";
  }

  if (margin === 7) {
    return "win7";
  }

  if (margin === 6) {
    return "win6";
  }

  if (margin === 5) {
    return "win5";
  }

  if (margin === 4) {
    return "win4";
  }

  return "loss";
}

export function payoutForFiniteOutcome(
  outcome: OutcomeCode,
  bet: BetConfig,
): number {
  if (
    outcome === "dragon7" ||
    outcome === "panda8"
  ) {
    return bet.payTable.specialWin;
  }

  return bet.payTable[outcome];
}
