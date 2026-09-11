import type {
  BetConfig,
  ExactResult,
  OutcomeCode,
  ProbabilityRow,
} from "../types";

import {
  createEightDeckShoe,
  handTotal,
} from "./baccarat";

type State = {
  counts: number[];

  stage:
    | "p1"
    | "b1"
    | "p2"
    | "b2"
    | "player3"
    | "banker3"
    | "complete";

  player: number[];
  banker: number[];

  playerThird: number | null;
};

type Distribution = Record<
  OutcomeCode,
  number
>;

function emptyDistribution(): Distribution {
  return {
    win9: 0,
    win8: 0,
    win7: 0,
    win6: 0,
    win5: 0,
    win4: 0,
    naturalWin: 0,
    naturalTie: 0,
    dragon7: 0,
    panda8: 0,
    loss: 0,
  };
}

function addDistribution(
  target: Distribution,
  source: Distribution,
  multiplier: number,
): void {
  (
    Object.keys(source) as OutcomeCode[]
  ).forEach((key) => {
    target[key] +=
      source[key] * multiplier;
  });
}

function bankerDraws(
  bankerTotal: number,
  playerThird: number,
): boolean {
  if (bankerTotal <= 2) {
    return true;
  }

  if (bankerTotal === 3) {
    return playerThird !== 8;
  }

  if (bankerTotal === 4) {
    return (
      playerThird >= 2 &&
      playerThird <= 7
    );
  }

  if (bankerTotal === 5) {
    return (
      playerThird >= 4 &&
      playerThird <= 7
    );
  }

  if (bankerTotal === 6) {
    return (
      playerThird === 6 ||
      playerThird === 7
    );
  }

  return false;
}

function classify(
  player: number[],
  banker: number[],
  bet: BetConfig,
): OutcomeCode {
  const p =
    handTotal(player);

  const b =
    handTotal(banker);

  const naturalPlayer =
    player.length === 2 &&
    p >= 8;

  const naturalBanker =
    banker.length === 2 &&
    b >= 8;

  /*
   * Dragon 7 / Fortune 7
   */
  if (
    bet.preset === "dragon7" ||
    bet.preset === "fortune7"
  ) {
    if (
      banker.length === 3 &&
      b === 7 &&
      b > p
    ) {
      return "dragon7";
    }

    return "loss";
  }

  /*
   * Panda 8
   */
  if (
    bet.preset === "panda8"
  ) {
    if (
      player.length === 3 &&
      p === 8 &&
      p > b
    ) {
      return "panda8";
    }

    return "loss";
  }

  const selected =
    bet.side === "player"
      ? {
          cards: player,
          total: p,
          opponent: b,
          natural: naturalPlayer,
          wins: p > b,
        }
      : {
          cards: banker,
          total: b,
          opponent: p,
          natural: naturalBanker,
          wins: b > p,
        };

  if (
    selected.natural &&
    selected.wins
  ) {
    return "naturalWin";
  }

  if (
    selected.natural &&
    !selected.wins &&
    selected.total === selected.opponent
  ) {
    return "naturalTie";
  }

  if (!selected.wins) {
    return "loss";
  }

  const margin =
    selected.total -
    selected.opponent;

  switch (margin) {
    case 9:
      return "win9";

    case 8:
      return "win8";

    case 7:
      return "win7";

    case 6:
      return "win6";

    case 5:
      return "win5";

    case 4:
      return "win4";

    default:
      return "loss";
  }
}

function payoutFor(
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

function recurse(
  state: State,
  bet: BetConfig,
  memo: Map<string, Distribution>,
): Distribution {
  const key = JSON.stringify([
    state.counts,
    state.stage,
    state.player,
    state.banker,
    state.playerThird,
  ]);

  const cached =
    memo.get(key);

  if (cached) {
    return cached;
  }

  const result =
    emptyDistribution();

  if (state.stage === "complete") {
    const outcome =
      classify(
        state.player,
        state.banker,
        bet,
      );

    result[outcome] = 1;

    memo.set(key, result);

    return result;
  }

  const remaining =
    state.counts.reduce(
      (sum, count) =>
        sum + count,
      0,
    );

  for (
    let card = 0;
    card <= 9;
    card++
  ) {
    const available =
      state.counts[card];

    if (available <= 0) {
      continue;
    }

    const probability =
      available / remaining;

    const next: State = {
      counts: [...state.counts],

      stage: state.stage,

      player: [
        ...state.player,
      ],

      banker: [
        ...state.banker,
      ],

      playerThird:
        state.playerThird,
    };

    next.counts[card]--;

    switch (state.stage) {
      case "p1":
        next.player.push(card);
        next.stage = "b1";
        break;

      case "b1":
        next.banker.push(card);
        next.stage = "p2";
        break;

      case "p2":
        next.player.push(card);
        next.stage = "b2";
        break;

      case "b2": {
        next.banker.push(card);

        const p =
          handTotal(next.player);

        const b =
          handTotal(next.banker);

        if (
          p >= 8 ||
          b >= 8
        ) {
          next.stage =
            "complete";
        } else if (p <= 5) {
          next.stage =
            "player3";
        } else {
          if (b <= 5) {
            next.stage =
              "banker3";
          } else {
            next.stage =
              "complete";
          }
        }

        break;
      }

      case "player3": {
        next.player.push(card);

        next.playerThird =
          card;

        const b =
          handTotal(next.banker);

        if (
          bankerDraws(
            b,
            card,
          )
        ) {
          next.stage =
            "banker3";
        } else {
          next.stage =
            "complete";
        }

        break;
      }

      case "banker3":
        next.banker.push(card);
        next.stage =
          "complete";
        break;
    }

    const branch =
      recurse(
        next,
        bet,
        memo,
      );

    addDistribution(
      result,
      branch,
      probability,
    );
  }

  memo.set(key, result);

  return result;
}

export function exactProbability(
  bet: BetConfig,
  decks = 8,
): ExactResult {
  const counts =
    createEightDeckShoe(
      decks,
    );

  const state: State = {
    counts,

    stage: "p1",

    player: [],
    banker: [],

    playerThird: null,
  };

  const distribution =
    recurse(
      state,
      bet,
      new Map(),
    );

  const rows: ProbabilityRow[] =
    (
      Object.keys(
        distribution,
      ) as OutcomeCode[]
    )
      .map((outcome) => {
        const probability =
          distribution[outcome];

        const payout =
          payoutFor(
            outcome,
            bet,
          );

        return {
          outcome,
          probability,
          payout,
          contribution:
            probability *
            payout,
        };
      })
      .filter(
        (row) =>
          row.probability > 0,
      );

  const winProbability =
    rows
      .filter(
        (row) =>
          row.payout > 0,
      )
      .reduce(
        (sum, row) =>
          sum + row.probability,
        0,
      );

  const pushProbability =
    rows
      .filter(
        (row) =>
          row.outcome ===
          "naturalTie",
      )
      .reduce(
        (sum, row) =>
          sum + row.probability,
        0,
      );

  const lossProbability =
    rows
      .filter(
        (row) =>
          row.payout === -1,
      )
      .reduce(
        (sum, row) =>
          sum + row.probability,
        0,
      );

  const evPerUnit =
    rows.reduce(
      (sum, row) =>
        sum +
        row.contribution,
      0,
    );

  const houseEdge =
    -evPerUnit;

  const playerEdge =
    evPerUnit;

  const breakEvenPayout =
    winProbability > 0
      ? (1 - lossProbability) /
        winProbability
      : 0;

  return {
    hands: 1,

    winProbability,
    lossProbability,
    pushProbability,

    winningHitRate:
      winProbability,

    hitRate:
      winProbability +
      pushProbability,

    evPerUnit,

    houseEdge,

    playerEdge,

    breakEvenPayout,

    rows,
  };
}
