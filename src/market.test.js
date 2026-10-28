import { test } from "node:test";
import assert from "node:assert/strict";
import { markets, simulate, edgeBps, filterMarkets } from "./market.js";
test("paired payout edge is based on YES plus complementary NO costs", () =>
  assert.equal(edgeBps(markets[0]), 240));
test("latency, fees and slippage reduce theoretical paired payout", () => {
  const fast = simulate(markets[0], 5000, 20, 2),
    slow = simulate(markets[0], 5000, 250, 20);
  assert.ok(fast.net > slow.net);
  assert.ok(fast.net < fast.gross);
  assert.equal(fast.contracts, 5122);
});
test("capital respects displayed liquidity and zero budgets", () => {
  assert.ok(
    simulate(markets[0], 1000000, 20, 2).capital <= markets[0].liquidity,
  );
  assert.equal(simulate(markets[0], -20, 20, 2).contracts, 0);
});
test("scanner combines search, category and minimum edge", () => {
  assert.equal(filterMarkets("Bitcoin", "Crypto", 150).length, 1);
  assert.equal(filterMarkets("Bitcoin", "Economics", 0).length, 0);
  assert.equal(filterMarkets("", "All markets", 250).length, 0);
});

test("execution stress can consume a small apparent arbitrage edge", () => {
  const stressed = simulate(markets[5], 5000, 350, 40);
  assert.ok(stressed.gross > 0);
  assert.ok(stressed.net < 0);
});
