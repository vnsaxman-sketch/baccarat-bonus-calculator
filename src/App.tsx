import {
  useState,
} from "react";

import type {
  BetConfig,
  BetPreset,
  ExactResult,
  FiniteShoeResult,
} from "./types";

import {
  presets,
} from "./data/presets";

import {
  exactProbability,
} from "./engine/exactProbability";

import {
  simulateFiniteShoe,
} from "./engine/finiteShoe";

import "./index.css";

const initialBet: BetConfig = {
  preset:
    "playerDragonBonus",

  side: "player",

  wager: 25,

  payTable:
    presets.playerDragonBonus.payTable,
};

function percent(
  value: number,
): string {
  return `${(
    value * 100
  ).toFixed(4)}%`;
}

function money(
  value: number,
): string {
  return `$${value.toFixed(4)}`;
}

function number(
  value: number,
): string {
  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 4,
    },
  );
}

function App() {
  const [
    bet,
    setBet,
  ] = useState<BetConfig>(
    initialBet,
  );

  const [
    decks,
    setDecks,
  ] = useState(8);

  const [
    cutCards,
    setCutCards,
  ] = useState(14);

  const [
    minHands,
    setMinHands,
  ] = useState(72);

  const [
    maxHands,
    setMaxHands,
  ] = useState(80);

  const [
    targetHands,
    setTargetHands,
  ] = useState(76);

  const [
    simulations,
    setSimulations,
  ] = useState(100);

  const [
    exact,
    setExact,
  ] = useState<ExactResult | null>(
    null,
  );

  const [
    finite,
    setFinite,
  ] =
    useState<FiniteShoeResult | null>(
      null,
    );

  const [
    running,
    setRunning,
  ] = useState(false);

  function selectPreset(
    value: BetPreset,
  ) {
    const preset =
      presets[value];

    setBet({
      preset: value,
      side: preset.side,
      wager: bet.wager,
      payTable:
        preset.payTable,
    });
  }

  function calculate() {
    setRunning(true);

    /*
     * Exact first/full-shoe theoretical
     * probability.
     */
    const exactResult =
      exactProbability(
        bet,
        decks,
      );

    setExact(
      exactResult,
    );

    /*
     * Finite shoe simulation.
     */
    const finiteResult =
      simulateFiniteShoe(
        bet,
        decks,
        targetHands,
        cutCards,
        simulations,
      );

    setFinite(
      finiteResult,
    );

    setRunning(false);
  }

  const totalCards =
    decks * 52;

  const cutPosition =
    totalCards -
    cutCards;

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>
            Baccarat Side-Bet
            Analyzer V2.0
          </h1>
	  <p>
            Exact finite 8-deck
            mathematics + cut-card
            shoe simulation
          </p>
          <p>
            Developed by: Long Nguyen
          </p>
        </div>

        <span className="badge">
          EDUCATIONAL
        </span>
      </header>

      <main className="container">
        <section className="notice">
          <strong>
            Important:
          </strong>{" "}
          This application calculates
          mathematical expectation. It
          does not predict which hand will
          win. A simulated positive EV is
          not evidence that a particular
          casino session will be profitable.
        </section>

        <section className="panel">
          <h2>
            Side-Bet Selection
          </h2>

          <div className="preset-grid">
            {(
              Object.keys(
                presets,
              ) as BetPreset[]
            ).map(
              (preset) => (
                <button
                  key={preset}
                  className={
                    bet.preset ===
                    preset
                      ? "preset active"
                      : "preset"
                  }
                  onClick={() =>
                    selectPreset(
                      preset,
                    )
                  }
                >
                  <strong>
                    {
                      presets[
                        preset
                      ].name
                    }
                  </strong>

                  <small>
                    {
                      presets[
                        preset
                      ].description
                    }
                  </small>
                </button>
              ),
            )}
          </div>
        </section>

        <div className="two-column">
          <section className="panel">
            <h2>
              Shoe Configuration
            </h2>

            <div className="form-grid">
              <label>
                Decks

                <input
                  type="number"
                  value={decks}
                  min={1}
                  onChange={(e) =>
                    setDecks(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Cards / deck

                <input
                  value={52}
                  disabled
                  readOnly
                />
              </label>

              <label>
                Total cards

                <input
                  value={
                    totalCards
                  }
                  disabled
                  readOnly
                />
              </label>

              <label>
                Cut cards from end

                <input
                  type="number"
                  min={1}
                  value={cutCards}
                  onChange={(e) =>
                    setCutCards(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Approx. minimum hands

                <input
                  type="number"
                  value={
                    minHands
                  }
                  onChange={(e) =>
                    setMinHands(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Approx. maximum hands

                <input
                  type="number"
                  value={
                    maxHands
                  }
                  onChange={(e) =>
                    setMaxHands(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Target hands

                <input
                  type="number"
                  min={
                    minHands
                  }
                  max={
                    maxHands
                  }
                  value={
                    targetHands
                  }
                  onChange={(e) =>
                    setTargetHands(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                Simulated shoes

                <input
                  type="number"
                  min={100}
                  value={
                    simulations
                  }
                  onChange={(e) =>
                    setSimulations(
                      Number(
                        e.target.value,
                      ),
                    )
                  }
                />
              </label>
            </div>

            <div className="shoe-info">
              Cut-card stopping
              position:{" "}
              <strong>
                {cutPosition}
              </strong>{" "}
              cards into the shoe.
            </div>
          </section>

          <section className="panel">
            <h2>
              Wager
            </h2>

            <div className="form-grid">
              <label>
                Side

                <select
                  value={
                    bet.side
                  }
                  onChange={(e) =>
                    setBet(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        side:
                          e.target
                            .value as
                            | "player"
                            | "banker",
                      }),
                    )
                  }
                >
                  <option value="player">
                    Player
                  </option>

                  <option value="banker">
                    Banker
                  </option>
                </select>
              </label>

              <label>
                Wager amount

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    bet.wager
                  }
                  onChange={(e) =>
                    setBet(
                      (
                        previous,
                      ) => ({
                        ...previous,
                        wager:
                          Number(
                            e.target
                              .value,
                          ),
                      }),
                    )
                  }
                />
              </label>
            </div>

            <div className="paytable">
              <h3>
                Active Pay Table
              </h3>

              {bet.preset.includes(
                "DragonBonus",
              ) ||
              bet.preset ===
                "playerDragonBonus" ||
              bet.preset ===
                "bankerDragonBonus" ? (
                <>
                  <Pay
                    label="Win by 9 points"
                    value={
                      bet.payTable
                        .win9
                    }
                  />

                  <Pay
                    label="Win by 8 points"
                    value={
                      bet.payTable
                        .win8
                    }
                  />

                  <Pay
                    label="Win by 7 points"
                    value={
                      bet.payTable
                        .win7
                    }
                  />

                  <Pay
                    label="Win by 6 points"
                    value={
                      bet.payTable
                        .win6
                    }
                  />

                  <Pay
                    label="Win by 5 points"
                    value={
                      bet.payTable
                        .win5
                    }
                  />

                  <Pay
                    label="Win by 4 points"
                    value={
                      bet.payTable
                        .win4
                    }
                  />

                  <Pay
                    label="Natural winner"
                    value={
                      bet.payTable
                        .naturalWin
                    }
                  />

                  <Pay
                    label="Natural tie"
                    value="Push"
                  />
                </>
              ) : (
                <Pay
                  label={
                    bet.preset ===
                    "panda8"
                      ? "Winning Player 3-card 8"
                      : "Winning Banker 3-card 7"
                  }
                  value={
                    bet.payTable
                      .specialWin
                  }
                />
              )}
            </div>
          </section>
        </div>

        <section className="panel action-panel">
          <button
            className="calculate"
            onClick={calculate}
            disabled={running}
          >
            {running
              ? "Calculating..."
              : "Calculate Exact + Finite Results"}
          </button>
        </section>

        {exact && (
          <section className="panel">
            <div className="result-heading">
              <div>
                <h2>
                  Exact 8-Deck
                  Probability
                </h2>

                <p>
                  One complete hand
                  using an 8-deck
                  without-replacement
                  shoe.
                </p>
              </div>

              <span className="exact-badge">
                EXACT
              </span>
            </div>

            <div className="stats">
              <Stat
                title="Winning hit rate"
                value={percent(
                  exact.winningHitRate,
                )}
              />

              <Stat
                title="Hit rate"
                value={percent(
                  exact.hitRate,
                )}
              />

              <Stat
                title="Loss rate"
                value={percent(
                  exact.lossProbability,
                )}
              />

              <Stat
                title="Push rate"
                value={percent(
                  exact.pushProbability,
                )}
              />

              <Stat
                title="EV / unit"
                value={
                  exact.evPerUnit.toFixed(
                    6,
                  )
                }
              />

              <Stat
                title="House edge"
                value={percent(
                  exact.houseEdge,
                )}
              />

              <Stat
                title="Player edge"
                value={percent(
                  exact.playerEdge,
                )}
              />

              <Stat
                title="Break-even payout"
                value={
                  exact.breakEvenPayout.toFixed(
                    4,
                  )
                }
              />
            </div>

            <ResultTable
              rows={
                exact.rows
              }
            />
          </section>
        )}

        {finite && (
          <section className="panel">
            <div className="result-heading">
              <div>
                <h2>
                  Finite Shoe
                  Simulation
                </h2>

                <p>
                  {number(
                    simulations,
                  )}{" "}
                  simulated shoes,
                  with cards removed
                  after every hand.
                </p>
              </div>

              <span className="simulation-badge">
                FINITE SHOE
              </span>
            </div>

            <div className="stats">
              <Stat
                title="Winning hit rate"
                value={percent(
                  finite.winningHitRate,
                )}
              />

              <Stat
                title="Hit rate"
                value={percent(
                  finite.hitRate,
                )}
              />

              <Stat
                title="Loss rate"
                value={percent(
                  finite.lossRate,
                )}
              />

              <Stat
                title="Push rate"
                value={percent(
                  finite.pushRate,
                )}
              />

              <Stat
                title="EV / unit"
                value={
                  finite.evPerUnit.toFixed(
                    6,
                  )
                }
              />

              <Stat
                title="House edge"
                value={percent(
                  finite.houseEdge,
                )}
              />

              <Stat
                title="EV / shoe"
                value={money(
                  finite.expectedProfitPerShoe,
                )}
              />

              <Stat
                title="EV / 1,000 hands"
                value={money(
                  finite.expectedProfitPer1000Hands,
                )}
              />
            </div>

            <h3>
              Hand-by-Hand Finite
              Shoe Results
            </h3>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      Hand
                    </th>

                    <th>
                      Win %
                    </th>

                    <th>
                      Running EV
                    </th>

                    <th>
                      Remaining cards
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {finite.handByHand.map(
                    (
                      row,
                    ) => (
                      <tr
                        key={
                          row.handNumber
                        }
                      >
                        <td>
                          {
                            row.handNumber
                          }
                        </td>

                        <td>
                          {percent(
                            row.probability,
                          )}
                        </td>

                        <td>
                          {row.ev.toFixed(
                            6,
                          )}
                        </td>

                        <td>
                          {row.remainingCards.toFixed(
                            1,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel">
          <h2>
            Rules Engine
          </h2>

          <div className="rules">
            <div>
              <strong>
                Player
              </strong>

              <p>
                Player draws on 0–5 and
                stands on 6–7. A total of
                8 or 9 is a natural.
              </p>
            </div>

            <div>
              <strong>
                Banker
              </strong>

              <p>
                Banker follows the standard
                third-card tableau based on
                the Player's third card.
              </p>
            </div>

            <div>
              <strong>
                Natural
              </strong>

              <p>
                An initial two-card 8 or 9
                ends the hand.
              </p>
            </div>

            <div>
              <strong>
                Finite shoe
              </strong>

              <p>
                Cards are removed after every
                hand. They are not replaced
                until the shoe is reshuffled.
              </p>
            </div>

            <div>
              <strong>
                Cut card
              </strong>

              <p>
                The cut-card depth controls
                penetration. The current hand
                is completed rather than
                interrupting a hand.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        Baccarat Side-Bet Analyzer V2
      </footer>
    </div>
  );
}

function Pay({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="pay">
      <span>
        {label}
      </span>

      <strong>
        {typeof value ===
        "number"
          ? `${value}:1`
          : value}
      </strong>
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="stat">
      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

function ResultTable({
  rows,
}: {
  rows: {
    outcome: string;
    probability: number;
    payout: number;
    contribution: number;
  }[];
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              Outcome
            </th>

            <th>
              Probability
            </th>

            <th>
              Payout
            </th>

            <th>
              EV contribution
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (row) => (
              <tr
                key={
                  row.outcome
                }
              >
                <td>
                  {formatOutcome(
                    row.outcome,
                  )}
                </td>

                <td>
                  {percent(
                    row.probability,
                  )}
                </td>

                <td>
                  {row.payout ===
                  0
                    ? "Push"
                    : `${row.payout}:1`}
                </td>

                <td>
                  {row.contribution.toFixed(
                    6,
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatOutcome(
  value: string,
): string {
  const labels: Record<
    string,
    string
  > = {
    win9:
      "Win by 9 points",

    win8:
      "Win by 8 points",

    win7:
      "Win by 7 points",

    win6:
      "Win by 6 points",

    win5:
      "Win by 5 points",

    win4:
      "Win by 4 points",

    naturalWin:
      "Natural winner",

    naturalTie:
      "Natural tie",

    dragon7:
      "Dragon 7 / Fortune 7",

    panda8:
      "Panda 8 / Golden 8",

    loss:
      "Loss",
  };

  return (
    labels[value] ??
    value
  );
}

export default App;
