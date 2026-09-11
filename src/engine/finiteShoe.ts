import type {
  BetConfig,
  FiniteShoePoint,
  FiniteShoeResult,
} from "../types";

import {
  createEightDeckShoe,
  dealHand,
  totalCards,
} from "./baccarat";

import {
  classifyFiniteOutcome,
  payoutForFiniteOutcome,
} from "./finiteEvaluator";

export function shuffleShoe(
  counts: number[],
): number[] {
  const cards: number[] = [];

  counts.forEach(
    (count, value) => {
      for (
        let i = 0;
        i < count;
        i++
      ) {
        cards.push(value);
      }
    },
  );

  for (
    let i = cards.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() *
          (i + 1),
      );

    [
      cards[i],
      cards[j],
    ] = [
      cards[j],
      cards[i],
    ];
  }

  return cards;
}

function cardsToCounts(
  cards: number[],
): number[] {
  const counts =
    new Array(10).fill(0);

  cards.forEach(
    (card) => {
      counts[card]++;
    },
  );

  return counts;
}

export function simulateFiniteShoe(
  bet: BetConfig,
  decks = 8,
  targetHands = 76,
  cutCardsFromEnd = 14,
  simulations = 10000,
): FiniteShoeResult {
  let totalHands = 0;

  let wins = 0;
  let losses = 0;
  let pushes = 0;

  const handBuckets:
    FiniteShoePoint[] = [];

  let totalProfit = 0;

  for (
    let simulation = 0;
    simulation < simulations;
    simulation++
  ) {
    const starting =
      createEightDeckShoe(
        decks,
      );

    const shuffled =
      shuffleShoe(
        starting,
      );

    const counts =
      cardsToCounts(
        shuffled,
      );

    let handsPlayed = 0;

    while (
      handsPlayed <
        targetHands &&
      totalCards(counts) >
        cutCardsFromEnd
    ) {
      const before =
        totalCards(counts);

      const hand =
        dealHand(counts);

      const after =
        totalCards(counts);

      if (after >= before) {
        break;
      }

      const outcome =
        classifyFiniteOutcome(
          hand,
          bet,
        );

      const payout =
        payoutForFiniteOutcome(
          outcome,
          bet,
        );

      if (payout > 0) {
        wins++;
      } else if (
        payout === 0
      ) {
        pushes++;
      } else {
        losses++;
      }

      totalHands++;
      handsPlayed++;

      totalProfit +=
        payout;

      const handProbability =
        totalHands > 0
          ? wins / totalHands
          : 0;

      const runningEV =
        totalHands > 0
          ? totalProfit /
            totalHands
          : 0;

      const point: FiniteShoePoint =
        handBuckets[
          handsPlayed - 1
        ] ?? {
          handNumber:
            handsPlayed,

          probability: 0,
          ev: 0,

          remainingCards: 0,
        };

      point.probability +=
        handProbability;

      point.ev +=
        runningEV;

      point.remainingCards +=
        totalCards(counts);

      handBuckets[
        handsPlayed - 1
      ] = point;
    }
  }

  handBuckets.forEach(
    (point) => {
      point.probability /=
        simulations;

      point.ev /=
        simulations;

      point.remainingCards /=
        simulations;
    },
  );

  const winningHitRate =
    totalHands > 0
      ? wins / totalHands
      : 0;

  const lossRate =
    totalHands > 0
      ? losses / totalHands
      : 0;

  const pushRate =
    totalHands > 0
      ? pushes / totalHands
      : 0;

  const hitRate =
    winningHitRate +
    pushRate;

  const evPerUnit =
    totalHands > 0
      ? totalProfit /
        totalHands
      : 0;

  return {
    handsPlayed:
      targetHands,

    totalHands,

    wins,
    losses,
    pushes,

    winningHitRate,
    hitRate,

    lossRate,
    pushRate,

    evPerUnit,

    houseEdge:
      -evPerUnit,

    expectedProfitPerShoe:
      evPerUnit *
      targetHands,

    expectedProfitPer100Hands:
      evPerUnit *
      100,

    expectedProfitPer1000Hands:
      evPerUnit *
      1000,

    handByHand:
      handBuckets,
  };
}
