export const markets = [
  {
    id: "fed",
    title: "Fed rate cut in December?",
    category: "Economics",
    code: "FED-DEC",
    yes: 0.62,
    no: 0.356,
    liquidity: 48200,
    volume: "$1.84M",
    confidence: 96,
    color: "#d7b46a",
  },
  {
    id: "btc",
    title: "Bitcoin above $100k at year end?",
    category: "Crypto",
    code: "BTC-100K",
    yes: 0.54,
    no: 0.442,
    liquidity: 31500,
    volume: "$2.16M",
    confidence: 92,
    color: "#b3bdcc",
  },
  {
    id: "cpi",
    title: "US CPI below 3% in November?",
    category: "Economics",
    code: "CPI-NOV",
    yes: 0.71,
    no: 0.275,
    liquidity: 26300,
    volume: "$940K",
    confidence: 94,
    color: "#a0b9a1",
  },
  {
    id: "eth",
    title: "Ethereum above $4k at year end?",
    category: "Crypto",
    code: "ETH-4K",
    yes: 0.38,
    no: 0.607,
    liquidity: 18400,
    volume: "$720K",
    confidence: 88,
    color: "#a8a0bd",
  },
  {
    id: "gdp",
    title: "US Q4 GDP growth above 2%?",
    category: "Economics",
    code: "GDP-Q4",
    yes: 0.66,
    no: 0.329,
    liquidity: 12900,
    volume: "$610K",
    confidence: 91,
    color: "#9eb7b5",
  },
  {
    id: "space",
    title: "Next orbital launch before December?",
    category: "Science",
    code: "ORBIT-NOV",
    yes: 0.81,
    no: 0.182,
    liquidity: 8900,
    volume: "$284K",
    confidence: 85,
    color: "#c49d8c",
  },
];
export const edgeBps = (market) =>
  Math.round((1 - market.yes - market.no) * 10000);
export function simulate(market, budget, latency, slippage) {
  const cost = market.yes + market.no;
  const capital = Math.max(0, Math.min(Number(budget) || 0, market.liquidity));
  const contracts = Math.floor(capital / cost);
  const fees = contracts * 0.003;
  const slip = (contracts * Math.max(0, slippage)) / 10000;
  const decay = contracts * Math.min(1000, Math.max(0, latency)) * 0.000012;
  const gross = contracts * (1 - cost);
  return {
    contracts,
    capital: contracts * cost,
    fees,
    slip,
    decay,
    gross,
    net: gross - fees - slip - decay,
    fill: Math.max(5, Math.round(99 - latency * 0.095)),
    latency,
  };
}
export function series(market, range, tick = 0) {
  return Array.from({ length: 72 }, (_, i) => {
    const scale = range === "7D" ? 2.5 : range === "24H" ? 1.7 : 1;
    const wave =
      (Math.sin(i * 0.34 * scale + tick * 0.13) * 0.005 +
        Math.cos(i * 0.83) * 0.002) *
      scale;
    const trend = (i / 71 - 0.5) * 0.025;
    return {
      a: market.yes + wave + trend,
      b: 1 - market.no + wave * 0.7 + trend + Math.sin(i * 0.22) * 0.002,
      volume: 12 + Math.abs(Math.sin(i * 0.63)) * 34,
      time: i,
    };
  });
}
export function filterMarkets(query, category, minEdge) {
  return markets
    .filter(
      (m) =>
        (category === "All markets" || m.category === category) &&
        m.title.toLowerCase().includes(query.toLowerCase()) &&
        edgeBps(m) >= minEdge,
    )
    .sort((a, b) => edgeBps(b) - edgeBps(a));
}
