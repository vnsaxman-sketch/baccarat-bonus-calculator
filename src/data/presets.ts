import type {
  BetPreset,
  PayTable,
} from "../types";

export const dragonBonusPayTable: PayTable = {
  win9: 30,
  win8: 10,
  win7: 6,
  win6: 4,
  win5: 2,
  win4: 1,

  naturalWin: 1,
  naturalTie: 0,

  specialWin: 0,
  loss: -1,
};

export const dragon7PayTable: PayTable = {
  win9: 0,
  win8: 0,
  win7: 0,
  win6: 0,
  win5: 0,
  win4: 0,

  naturalWin: 0,
  naturalTie: 0,

  specialWin: 40,
  loss: -1,
};

export const panda8PayTable: PayTable = {
  win9: 0,
  win8: 0,
  win7: 0,
  win6: 0,
  win5: 0,
  win4: 0,

  naturalWin: 0,
  naturalTie: 0,

  specialWin: 25,
  loss: -1,
};

export const presets: Record<
  BetPreset,
  {
    name: string;
    description: string;
    side: "player" | "banker";
    payTable: PayTable;
  }
> = {
  playerDragonBonus: {
    name: "Player Dragon Bonus",
    description:
      "Natural Player winner or non-natural Player win by at least 4 points.",
    side: "player",
    payTable: dragonBonusPayTable,
  },

  bankerDragonBonus: {
    name: "Banker Dragon Bonus",
    description:
      "Natural Banker winner or non-natural Banker win by at least 4 points.",
    side: "banker",
    payTable: dragonBonusPayTable,
  },

  dragon7: {
    name: "Dragon 7",
    description:
      "Banker wins with a three-card total of 7.",
    side: "banker",
    payTable: dragon7PayTable,
  },

  panda8: {
    name: "Panda 8",
    description:
      "Player wins with a three-card total of 8.",
    side: "player",
    payTable: panda8PayTable,
  },

  fortune7: {
    name: "Fortune 7",
    description:
      "Fortune 7 / Dragon 7: Banker wins with a three-card total of 7.",
    side: "banker",
    payTable: dragon7PayTable,
  },
};
