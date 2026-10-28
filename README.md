# arb-execution-lab

Execution-aware arbitrage research in prediction markets, featuring opportunity scanning, synthetic order books, and latency-sensitive execution simulation.

## Interactive frontend

A responsive React dashboard with a dark research-terminal aesthetic, custom SVG visualizations, and Lucide icons. All data is **synthetic demo data**. There is no backend, exchange connection, wallet, or live execution.

### Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The server binds to loopback by default.

```sh
npm test          # domain model and scanner tests
npm run build    # production output in dist/
npm run preview  # preview the production build locally
```

### Explore

- **Overview:** compare synthetic venue quotes, hover for sample prices, switch sample windows, inspect cumulative depth and the order book, and pause/resume the demo stream.
- **Opportunity scanner:** search, filter by category and minimum gross edge, select a market to update details and execution inputs, or export the filtered demo rows to CSV. `⌘/Ctrl K` focuses search.
- **Execution lab:** adjust capital, latency and slippage; run a simulation to inspect modeled fees, slippage, latency decay and illustrative fill probability.
- **Research:** fixed illustrative cumulative returns and edge distribution, plus latency sensitivity calculated from the selected market and execution inputs.
- **Methodology:** model assumptions and data limitations; supports Escape to dismiss. Reduced-motion preferences disable animation.

### Model and limitations

The scanner assumes paired YES and complementary NO contracts with identical settlement rules, paying a combined $1. Gross edge in basis points is `(1 - yesCost - noCost) × 10,000`.

The model caps capital at displayed synthetic liquidity and rounds down to whole paired contracts. It subtracts $0.003 fees per pair, selected slippage in basis points per pair, and linear latency decay of `$0.000012 × latencyMs` per pair. These are intentionally illustrative assumptions, not venue fee schedules. Displayed confidence and fill probability are uncalibrated demo values. Net P&L assumes full paired fills; fill probability is shown separately and does not probability-weight P&L.

No real historical data or measured backtest is included. Chart ranges resample a synthetic waveform. Research headline returns and sample counts are fixed examples. Actual opportunity validation needs settlement equivalence, executable depth, venue fees, adverse selection, partial-fill/inventory risk, funding, and counterparty/settlement costs.

### Code map and backend seam

- `src/market.js`: synthetic fixtures, sampling, scanner filtering and pure execution model.
- `src/market.test.js`: calculation and filtering tests using Node's built-in runner.
- `src/main.jsx`: interactive React workspace and accessible controls.
- `src/style.css`: responsive layout, visual system and motion preferences.

To connect a backend, replace the fixture/sampling boundary with validated quote and depth adapters, including source timestamps and settlement identifiers. Keep the demo banner until real source availability and provenance are implemented. Do not use the current model to place orders.

Original repository license and ignore rules are preserved. Visual direction draws on the restraint and typographic hierarchy of institutional trading/research sites; no Optiver branding or assets are used.
