import type {
  HandResult,
  Side,
} from "../types";

export type ShoeCounts = number[];

export function createEightDeckShoe(
  decks = 8,
): ShoeCounts {
  const counts = new Array(10).fill(0);

  /*
    Index 0 = ten/J/Q/K cards
    Index 1 = ace
    Index 2..9 = numerical cards
  */

  counts[0] = 16 * decks;

  for (let value = 1; value <= 9; value++) {
    counts[value] = 4 * decks;
  }

  return counts;
}

export function totalCards(
  counts: ShoeCounts,
): number {
  return counts.reduce(
    (sum, count) => sum + count,
    0,
  );
}

export function cardValue(
  card: number,
): number {
  if (card === 0) {
    return 0;
  }

  return card;
}

export function handTotal(
  cards: number[],
): number {
  return (
    cards.reduce(
      (sum, card) => sum + cardValue(card),
      0,
    ) % 10
  );
}

export function isNatural(
  cards: number[],
): boolean {
  return (
    cards.length === 2 &&
    handTotal(cards) >= 8
  );
}

export function winner(
  playerTotal: number,
  bankerTotal: number,
): "player" | "banker" | "tie" {
  if (playerTotal > bankerTotal) {
    return "player";
  }

  if (bankerTotal > playerTotal) {
    return "banker";
  }

  return "tie";
}

function bankerShouldDraw(
  bankerTotal: number,
  playerThird: number | null,
): boolean {
  if (playerThird === null) {
    return bankerTotal <= 5;
  }

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

function drawFromShoe(
  counts: ShoeCounts,
  card: number,
): void {
  if (counts[card] <= 0) {
    throw new Error(
      `Card value ${card} is unavailable.`,
    );
  }

  counts[card]--;
}

function restoreToShoe(
  counts: ShoeCounts,
  card: number,
): void {
  counts[card]++;
}

function randomCard(
  counts: ShoeCounts,
): number {
  const total = totalCards(counts);

  let target =
    Math.random() * total;

  for (
    let value = 0;
    value < counts.length;
    value++
  ) {
    target -= counts[value];

    if (target < 0) {
      return value;
    }
  }

  return 0;
}

export function dealHand(
  counts: ShoeCounts,
): HandResult {
  const player: number[] = [];
  const banker: number[] = [];

  function draw(): number {
    const card = randomCard(counts);

    drawFromShoe(counts, card);

    return card;
  }

  player.push(draw());
  banker.push(draw());

  player.push(draw());
  banker.push(draw());

  let playerTotal =
    handTotal(player);

  let bankerTotal =
    handTotal(banker);

  const playerNatural =
    playerTotal >= 8;

  const bankerNatural =
    bankerTotal >= 8;

  if (
    playerNatural ||
    bankerNatural
  ) {
    return {
      playerCards: player,
      bankerCards: banker,

      playerTotal,
      bankerTotal,

      playerNatural,
      bankerNatural,

      winner: winner(
        playerTotal,
        bankerTotal,
      ),

      cardsUsed: 4,
    };
  }

  let playerThird: number | null =
    null;

  if (playerTotal <= 5) {
    playerThird = draw();

    player.push(playerThird);

    playerTotal =
      handTotal(player);
  }

  bankerTotal =
    handTotal(banker);

  if (
    bankerShouldDraw(
      bankerTotal,
      playerThird,
    )
  ) {
    banker.push(draw());

    bankerTotal =
      handTotal(banker);
  }

  return {
    playerCards: player,
    bankerCards: banker,

    playerTotal,
    bankerTotal,

    playerNatural: false,
    bankerNatural: false,

    winner: winner(
      playerTotal,
      bankerTotal,
    ),

    cardsUsed:
      player.length +
      banker.length,
  };
}

export function cloneShoe(
  counts: ShoeCounts,
): ShoeCounts {
  return [...counts];
}

export function removeCard(
  counts: ShoeCounts,
  card: number,
): void {
  drawFromShoe(counts, card);
}

export function addCard(
  counts: ShoeCounts,
  card: number,
): void {
  restoreToShoe(counts, card);
}

export function selectedTotal(
  hand: HandResult,
  side: Side,
): number {
  return side === "player"
    ? hand.playerTotal
    : hand.bankerTotal;
}

export function selectedCards(
  hand: HandResult,
  side: Side,
): number[] {
  return side === "player"
    ? hand.playerCards
    : hand.bankerCards;
}
