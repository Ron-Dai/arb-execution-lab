import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDown,
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Command,
  Download,
  FlaskConical,
  Globe2,
  Layers,
  LayoutDashboard,
  Pause,
  Play,
  Radio,
  Search,
  Settings2,
  SlidersHorizontal,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { markets, edgeBps, simulate, series, filterMarkets } from "./market.js";
import "./style.css";
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
const Icon = ({ type: Type, ...props }) => (
  <Type size={17} strokeWidth={1.6} {...props} />
);
function App() {
  const [view, setView] = useState("Overview"),
    [market, setMarket] = useState(markets[0]),
    [running, setRunning] = useState(true),
    [tick, setTick] = useState(0),
    [range, setRange] = useState("1H"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All markets"),
    [minEdge, setMinEdge] = useState(0),
    [filters, setFilters] = useState(false),
    [budget, setBudget] = useState(5000),
    [latency, setLatency] = useState(45),
    [slip, setSlip] = useState(5),
    [result, setResult] = useState(null),
    [help, setHelp] = useState(false),
    [notice, setNotice] = useState(false),
    [hover, setHover] = useState(null);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    setResult(null);
    setHover(null);
  }, [market, budget, latency, slip]);
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setHelp(false);
        setNotice(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("Opportunity scanner");
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const rows = filterMarkets(query, category, minEdge),
    data = series(market, range, tick),
    calc = simulate(market, budget, latency, slip);
  const exportData = () => {
    const csv =
      "market,category,yes_cost,no_cost,gross_edge_bps,data_source\n" +
      rows
        .map(
          (m) =>
            `"${m.title}",${m.category},${m.yes},${m.no},${edgeBps(m)},synthetic_demo`,
        )
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "arb-demo-opportunities.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const nav = [
    ["Overview", LayoutDashboard],
    ["Opportunity scanner", Radio],
    ["Execution lab", Zap],
    ["Research", FlaskConical],
  ];
  const select = (m) => {
    setMarket(m);
    setView("Overview");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  function chart() {
    const lo = market.yes - 0.027,
      hi = market.yes + 0.05;
    const y = (v) => 188 - ((v - lo) / (hi - lo)) * 166;
    const line = (key) =>
      data
        .map((p, i) => `${i ? "L" : "M"}${(i * 700) / 71},${y(p[key])}`)
        .join(" ");
    return (
      <div className="price-chart" onMouseLeave={() => setHover(null)}>
        <div className="chart-labels">
          {[hi, hi - 0.02, hi - 0.04, hi - 0.06].map((v) => (
            <span key={v} style={{ top: `${(y(v) / 230) * 100}%` }}>
              {(v * 100).toFixed(1)}¢
            </span>
          ))}
        </div>
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 700 230"
          role="img"
          aria-label={`Synthetic price comparison for ${market.title}`}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setHover(
              Math.min(
                71,
                Math.max(0, Math.round(((e.clientX - r.left) / r.width) * 71)),
              ),
            );
          }}
        >
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#c5edb3" stopOpacity=".16" />
              <stop offset="1" stopColor="#c5edb3" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[24, 70, 116, 162].map((y) => (
            <line key={y} x1="0" x2="700" y1={y} y2={y} className="grid-line" />
          ))}
          {data.map((d, i) => (
            <rect
              key={i}
              x={(i * 700) / 71}
              y={230 - d.volume * 0.65}
              width="5"
              height={d.volume * 0.65}
              fill="#728071"
              opacity=".23"
            />
          ))}
          <path d={`${line("a")} L700,188 L0,188Z`} fill="url(#area)" />
          <path d={line("b")} className="line orange" />
          <path d={line("a")} className="line green" />
          {hover !== null && (
            <g>
              <line
                x1={(hover * 700) / 71}
                x2={(hover * 700) / 71}
                y1="0"
                y2="230"
                stroke="#b9c3b4"
                strokeDasharray="3 4"
              />
              <circle
                cx={(hover * 700) / 71}
                cy={y(data[hover].a)}
                r="4"
                fill="#cfecbb"
              />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div className="chart-tooltip">
            Sample {hover + 1} · A {(data[hover].a * 100).toFixed(2)}¢ · B YES
            equiv. {(data[hover].b * 100).toFixed(2)}¢
          </div>
        )}
        <div className="x-labels">
          {(range === "1H"
            ? ["13:00", "13:10", "13:20", "13:30", "13:40", "13:50", "14:00"]
            : range === "24H"
              ? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"]
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          ).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    );
  }
  function scanner() {
    return (
      <section className="panel scanner" id="scanner">
        <div className="panel-title">
          <div>
            <span className="eyebrow">DISCOVER THE DISLOCATION</span>
            <h2>
              Opportunity scanner <span className="count">{rows.length}</span>
            </h2>
          </div>
          <button className="subtle" onClick={exportData}>
            <Icon type={Download} /> Export
          </button>
        </div>
        <div className="filters">
          <label className="search">
            <Icon type={Search} />
            <input
              ref={searchRef}
              aria-label="Search markets"
              placeholder="Search markets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span>⌘ K</span>
          </label>
          <label className="select-wrap">
            <select
              aria-label="Market category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["All markets", "Economics", "Crypto", "Science"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Icon type={ChevronDown} />
          </label>
          <button
            aria-expanded={filters}
            className={"filter-button " + (filters ? "active" : "")}
            onClick={() => setFilters(!filters)}
          >
            <Icon type={SlidersHorizontal} /> Filters
          </button>
        </div>
        {filters && (
          <div className="filter-options">
            <label>
              Minimum gross edge{" "}
              <select
                aria-label="Minimum gross edge"
                value={minEdge}
                onChange={(e) => setMinEdge(Number(e.target.value))}
              >
                <option value="0">Any edge</option>
                <option value="100">100 bps</option>
                <option value="150">150 bps</option>
                <option value="200">200 bps</option>
              </select>
            </label>
            <span>Gross edge excludes fees and execution risk.</span>
          </div>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>MARKET</th>
                <th>VENUE A · YES</th>
                <th>VENUE B · NO</th>
                <th>GROSS EDGE ↓</th>
                <th>LIQUIDITY</th>
                <th>CONFIDENCE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className={m.id === market.id ? "selected" : ""}
                  onClick={() => select(m)}
                >
                  <td>
                    <button className="market-cell" onClick={() => select(m)}>
                      <span className="market-icon" style={{ color: m.color }}>
                        {m.code.slice(0, 1)}
                      </span>
                      <span>
                        <strong>{m.title}</strong>
                        <small>
                          {m.category} <span>•</span> {m.code}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    {(m.yes * 100).toFixed(1)}
                    <small>¢</small>
                  </td>
                  <td>
                    {(m.no * 100).toFixed(1)}
                    <small>¢</small>
                  </td>
                  <td>
                    <span className="edge">
                      +{edgeBps(m)} <small>bps</small>
                    </span>
                  </td>
                  <td>${(m.liquidity / 1000).toFixed(1)}K</td>
                  <td>
                    <span className="confidence">
                      <i style={{ width: m.confidence * 0.43 }} />
                      {m.confidence}%
                    </span>
                  </td>
                  <td>
                    <button
                      aria-label={`Inspect ${m.title}`}
                      className="icon-button"
                      onClick={() => select(m)}
                    >
                      <Icon type={ArrowUpRight} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="empty">
              No demo markets match your filters. Try a broader search.
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            <i className="dot" />{" "}
            {running ? "Scanning synthetic markets" : "Demo feed paused"} ·{" "}
            {markets.length} markets indexed
          </span>
          <span>
            Paired contracts assume identical settlement rules{" "}
            <Icon type={CircleHelp} />
          </span>
        </div>
      </section>
    );
  }
  function execution() {
    return (
      <section className="panel execution">
        <div className="panel-title">
          <div>
            <span className="eyebrow">FROM SIGNAL TO FILL</span>
            <h2>
              Execution sandbox{" "}
              <span className="execution-market">/ {market.title}</span>
            </h2>
          </div>
          <span className="tag">SIMULATION</span>
        </div>
        <div className="sandbox-grid">
          <div>
            <div className="route">
              <span>
                <b>A</b> Buy YES{" "}
                <strong>{(market.yes * 100).toFixed(1)}¢</strong>
              </span>
              <ArrowRight size={19} />
              <span>
                <b>B</b> Buy NO <strong>{(market.no * 100).toFixed(1)}¢</strong>
              </span>
              <span className="payout">
                $1.00
                <br />
                <small>paired payout</small>
              </span>
            </div>
            <div className="controls">
              <label>
                Capital allocation{" "}
                <div className="amount">
                  <span>$</span>
                  <input
                    aria-label="Capital allocation"
                    type="number"
                    step="100"
                    min="0"
                    max={market.liquidity}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                  <span>USD</span>
                </div>
              </label>
              <label>
                Latency <b>{latency} ms</b>
                <input
                  aria-label="Latency"
                  type="range"
                  min="10"
                  max="350"
                  value={latency}
                  onChange={(e) => setLatency(Number(e.target.value))}
                />
              </label>
              <label>
                Slippage <b>{slip} bps</b>
                <input
                  aria-label="Slippage"
                  type="range"
                  min="0"
                  max="40"
                  value={slip}
                  onChange={(e) => setSlip(Number(e.target.value))}
                />
              </label>
            </div>
          </div>
          <div className="sim-result">
            <div>
              <span>EST. NET P&L</span>
              <strong className={calc.net >= 0 ? "positive" : "negative"}>
                {money(calc.net)}
              </strong>
              <small>after modeled execution costs</small>
            </div>
            <button className="primary" onClick={() => setResult({ ...calc })}>
              <Icon type={Play} /> Run simulation <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
        {result && (
          <div className="result-detail" role="status">
            <Check size={16} /> Simulation complete ·{" "}
            {result.contracts.toLocaleString()} paired contracts · fees{" "}
            {money(result.fees)} · slippage {money(result.slip)} · latency decay{" "}
            {money(result.decay)} · modeled fill probability {result.fill}%
          </div>
        )}
        <div className="model-note">
          Illustrative model: $0.003 fees / pair + selected slippage + linear
          latency decay. No orders are sent.
        </div>
      </section>
    );
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("Overview");
          }}
        >
          <span className="brand-mark">
            a<span>↗</span>
          </span>
          <span>
            arb<span className="brand-slash"> / </span>
            <small>execution lab</small>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Layers size={17} />
          </span>
          <span>
            Research workspace<small>Personal / Sandbox</small>
          </span>
          <ChevronDown size={14} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {nav.map(([name, Type]) => (
            <button
              className={view === name ? "nav-item current" : "nav-item"}
              key={name}
              aria-label={name}
              title={name}
              aria-current={view === name ? "page" : undefined}
              onClick={() => {
                setView(name);
                if (name !== "Opportunity scanner")
                  window.scrollTo({ top: 0, behavior: "instant" });
                if (name === "Opportunity scanner")
                  setTimeout(
                    () =>
                      document.getElementById("scanner")?.scrollIntoView({
                        behavior: window.matchMedia(
                          "(prefers-reduced-motion: reduce)",
                        ).matches
                          ? "instant"
                          : "smooth",
                        block: "start",
                      }),
                    30,
                  );
              }}
            >
              <Icon type={Type} />
              {name}
              {name === "Opportunity scanner" && (
                <span className="nav-count">6</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="engine-card">
            <div>
              <i className="dot" /> DEMO ENGINE
            </div>
            <p>
              A proving ground
              <br />
              for your next edge.
            </p>
            <span>
              Explore. Simulate. Refine. <ArrowUpRight size={14} />
            </span>
          </div>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <Icon type={BookOpen} /> Lab documentation{" "}
            <ArrowUpRight size={14} />
          </button>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <Icon type={CircleHelp} /> Help & methodology
          </button>
          <div className="profile">
            <span>RD</span>
            <div>
              Ron Dai<small>Researcher</small>
            </div>
            <button
              aria-label="Workspace information"
              className="icon-button"
              onClick={() => setHelp(true)}
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div className="breadcrumb">
            Workspace <ChevronRight size={12} /> <strong>{view}</strong>
          </div>
          <div className="header-right">
            <span className="demo-badge">
              <i /> DEMO ENVIRONMENT
            </span>
            <span className="header-time">
              SIM{" "}
              {new Date(Date.UTC(2026, 9, 28, 14, 0, tick * 2))
                .toISOString()
                .slice(11, 19)}{" "}
              UTC
            </span>
            <button
              aria-label="Notifications"
              className="icon-button"
              onClick={() => setNotice(!notice)}
            >
              <Bell size={17} />
            </button>
          </div>
          {notice && (
            <div className="notification">
              <strong>You're in the sandbox</strong>
              <p>
                All feeds, fills, and research metrics are synthetic. No backend
                is connected.
              </p>
            </div>
          )}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="mini-line" /> PREDICTION MARKETS / RESEARCH
                TERMINAL
              </div>
              <h1>
                {view === "Overview"
                  ? "Find your edge."
                  : view === "Opportunity scanner"
                    ? "Every spread. In focus."
                    : view === "Execution lab"
                      ? "Test the path to execution."
                      : "Turn observations into insight."}
              </h1>
              <p>
                {view === "Research"
                  ? "Explore synthetic strategy performance and market microstructure."
                  : "A clearer view of inefficiency. A smarter path to execution."}
              </p>
            </div>
            <button
              className={"feed-button " + (!running ? "paused" : "")}
              onClick={() => setRunning(!running)}
            >
              <i className="dot" />
              {running ? "Demo feed running" : "Demo feed paused"}
              <Icon type={running ? Pause : Play} />
            </button>
          </div>
          <div className="demo-strip">
            <FlaskConical size={14} />
            <span>
              <b>Research mode.</b> All market data and performance metrics are
              simulated. No live trading or real funds.
            </span>
            <button onClick={() => setHelp(true)}>
              Methodology <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="metrics">
            {[
              [
                "Monitored markets",
                "6",
                "2 venues · synthetic universe",
                Globe2,
              ],
              [
                "Best gross edge",
                `+${Math.max(...markets.map(edgeBps))}`,
                "bps before execution costs",
                ArrowDownUp,
              ],
              [
                "Available liquidity",
                "$146.2",
                "K across monitored pairs",
                Layers,
              ],
              [
                "Modeled latency",
                String(latency),
                "ms · configurable in sandbox",
                Activity,
              ],
            ].map(([title, val, desc, Type], i) => (
              <div className="metric" key={title}>
                <div>
                  {title}
                  <Icon type={Type} />
                </div>
                <strong>
                  {val}
                  {i === 1 && <small>bps</small>}
                  {i === 2 && <small>K</small>}
                  {i === 3 && <small>ms</small>}
                </strong>
                <span>
                  <i className={i === 1 ? "positive" : ""}>
                    {i === 1 ? "↗ Highest spread" : "◦"}
                  </i>{" "}
                  {desc}
                </span>
                <div className={"spark spark-" + i}>
                  <svg viewBox="0 0 100 30">
                    <path
                      d={
                        i % 2
                          ? "M0 26L8 20L16 24L24 16L32 18L40 8L48 16L56 12L64 13L72 4L80 9L90 3L100 5"
                          : "M0 22L8 24L16 14L24 18L32 9L40 16L48 8L56 11L64 3L72 9L80 5L90 9L100 2"
                      }
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          {view === "Research" ? (
            <>
              <section className="research-hero panel">
                <div>
                  <span className="eyebrow">
                    SYNTHETIC BACKTEST / 30 SESSIONS
                  </span>
                  <h2>Small edges. Compounding insight.</h2>
                  <p>
                    Paired-contract strategy · fixed synthetic samples · no
                    out-of-sample validation
                  </p>
                </div>
                <div className="research-stats">
                  <div>
                    <span>Net demo return</span>
                    <strong>+3.42%</strong>
                  </div>
                  <div>
                    <span>Max drawdown</span>
                    <strong>−1.18%</strong>
                  </div>
                  <div>
                    <span>Sample trades</span>
                    <strong>1,284</strong>
                  </div>
                </div>
                <svg
                  viewBox="0 0 1000 190"
                  role="img"
                  aria-label="Synthetic cumulative research returns"
                >
                  <path
                    d="M0 175L40 160L70 165L100 150L140 156L170 128L210 135L250 118L280 125L310 90L350 102L390 80L430 96L470 67L500 74L540 55L580 73L620 42L660 49L700 24L750 37L790 15L830 32L870 10L910 20L950 5L1000 0"
                    className="line green"
                  />
                </svg>
              </section>
              <div className="research-grid">
                {[
                  ["Edge distribution", "Distribution of 6 demo market pairs"],
                  [
                    "Latency sensitivity",
                    "Net P&L across modeled route delays",
                  ],
                  ["Research notebook", "Assumptions behind the signal"],
                ].map(([title, desc], i) => (
                  <section className="panel" key={title}>
                    <h2>{title}</h2>
                    <p className="muted">{desc}</p>
                    {i === 0 ? (
                      markets.map((m) => (
                        <div className="distribution" key={m.id}>
                          <span>{m.code}</span>
                          <i style={{ width: edgeBps(m) * 0.6 }} />
                          <b>{edgeBps(m)}</b>
                        </div>
                      ))
                    ) : i === 1 ? (
                      [10, 50, 100, 200, 350].map((ms) => (
                        <div className="sensitivity" key={ms}>
                          <span>{ms} ms</span>
                          <strong
                            className={
                              simulate(market, budget, ms, slip).net >= 0
                                ? "positive"
                                : "negative"
                            }
                          >
                            {money(simulate(market, budget, ms, slip).net)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className="notebook">
                        <p>01 / Match settlement conditions</p>
                        <p>02 / Measure paired payout edge</p>
                        <p>03 / Subtract fees and slippage</p>
                        <p>04 / Stress execution latency</p>
                        <button
                          className="subtle"
                          onClick={() => setHelp(true)}
                        >
                          Read model notes <ArrowUpRight size={14} />
                        </button>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </>
          ) : (
            <>
              {view !== "Execution lab" && (
                <div className="market-grid">
                  <section className="panel price-panel">
                    <div className="panel-title">
                      <div>
                        <span className="eyebrow">
                          CROSS-VENUE PRICE DISCOVERY
                        </span>
                        <h2>
                          {market.title}{" "}
                          <span className="tag">{market.code}</span>
                        </h2>
                      </div>
                      <div className="segmented">
                        {["1H", "24H", "7D"].map((r) => (
                          <button
                            className={range === r ? "chosen" : ""}
                            key={r}
                            onClick={() => setRange(r)}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="chart-summary">
                      <strong>
                        {(market.yes * 100).toFixed(1)}
                        <small>¢</small>
                      </strong>
                      <span className="positive">
                        ↗ +{edgeBps(market)} bps paired edge
                      </span>
                      <div className="legend">
                        <span>
                          <i className="legend-green" /> Venue A · YES
                        </span>
                        <span>
                          <i className="legend-orange" /> Venue B · YES
                          equivalent
                        </span>
                      </div>
                    </div>
                    {chart()}
                    <div className="chart-footer">
                      <span>
                        <i className="dot" />{" "}
                        {running ? "Synthetic stream" : "Paused"} · sample{" "}
                        {tick + 1}
                      </span>
                      <span>
                        Volume <strong>{market.volume}</strong>
                      </span>
                    </div>
                  </section>
                  <section className="panel depth-panel">
                    <div className="panel-title">
                      <div>
                        <span className="eyebrow">LIQUIDITY PROFILE</span>
                        <h2>Market depth</h2>
                      </div>
                      <Icon type={Layers} />
                    </div>
                    <div className="depth-legend">
                      <span>
                        <i className="legend-green" /> Bid (YES)
                      </span>
                      <span>
                        <i className="legend-orange" /> Ask (YES)
                      </span>
                    </div>
                    <svg
                      className="depth-chart"
                      viewBox="0 0 300 118"
                      role="img"
                      aria-label="Synthetic cumulative YES order book depth"
                    >
                      <path
                        d="M5 12H28V24H54V37H77V55H100V66H124V84H146V112H5Z"
                        fill="#a7c494"
                        fillOpacity=".13"
                      />
                      <path
                        d="M5 12H28V24H54V37H77V55H100V66H124V84H146V112"
                        fill="none"
                        stroke="#b7dca1"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M154 112V87H174V72H195V51H220V35H245V20H271V8H295V112Z"
                        fill="#dc9f73"
                        fillOpacity=".12"
                      />
                      <path
                        d="M154 112V87H174V72H195V51H220V35H245V20H271V8H295"
                        fill="none"
                        stroke="#d9a37e"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="150"
                        x2="150"
                        y1="0"
                        y2="118"
                        stroke="#60645b"
                        strokeDasharray="3 4"
                      />
                    </svg>
                    <div className="depth-prices">
                      <span>{(market.yes * 100 - 2).toFixed(1)}¢</span>
                      <span>{(market.yes * 100).toFixed(1)}¢</span>
                      <span>{(market.yes * 100 + 2).toFixed(1)}¢</span>
                    </div>
                    <div className="orderbook">
                      <div className="book-head">
                        <span>BID SIZE</span>
                        <span>PRICE</span>
                        <span>ASK SIZE</span>
                      </div>
                      {[0, 1, 2].map((i) => (
                        <div className="book-row" key={i}>
                          <span
                            style={{
                              background: `linear-gradient(to left, #a8c69520 ${75 - i * 17}%, transparent 0)`,
                            }}
                          >
                            {(
                              3240 +
                              i * 750 +
                              (tick % 9) * 12
                            ).toLocaleString()}
                          </span>
                          <b>
                            {(market.yes * 100 + (i - 1) * 0.1).toFixed(1)}¢
                          </b>
                          <span
                            style={{
                              background: `linear-gradient(to right, #d49b7920 ${50 + i * 15}%, transparent 0)`,
                            }}
                          >
                            {(
                              2480 +
                              i * 620 +
                              (tick % 7) * 14
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="depth-footer">
                      Spread <strong>0.2¢</strong>
                      <span>Venue A · demo</span>
                    </div>
                  </section>
                </div>
              )}
              {view !== "Execution lab" && scanner()}
              {execution()}
            </>
          )}
          <footer>
            <span>
              <span className="footer-mark">a↗</span> BUILT FOR THE CURIOUS.
              ENGINEERED FOR THE EDGE.
            </span>
            <span>
              ARB EXECUTION LAB <i> / </i> DEMO v0.1 <i> / </i>{" "}
              <i className="dot" /> SYSTEM NOMINAL
            </span>
          </footer>
        </main>
      </div>
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal"
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                const focusables = e.currentTarget.querySelectorAll("button");
                const first = focusables[0],
                  last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              aria-label="Close methodology"
              autoFocus
              onClick={() => setHelp(false)}
            >
              <X size={20} />
            </button>
            <span className="eyebrow">LAB DOCUMENTATION</span>
            <h2 id="help-title">An environment for exploration.</h2>
            <p>
              Every market, quote, depth level, and research result in this
              workspace is synthetic. Venue A and Venue B are fictional; no
              exchange or backend is connected.
            </p>
            <h3>How the paired model works</h3>
            <p>
              Buy one YES and one complementary NO contract with identical
              settlement rules. Gross edge is $1 minus both purchase prices.
              Settlement mismatch, partial fills and venue risk can invalidate a
              theoretical opportunity.
            </p>
            <h3>Execution assumptions</h3>
            <p>
              Capital is capped at the displayed demo liquidity. Fees are $0.003
              per pair; slippage is selected in basis points per pair; latency
              decay is $0.000012 × milliseconds per pair. Fill probability is
              illustrative and does not change the full-fill net estimate. This
              model omits funding, settlement, counterparty and inventory costs.
            </p>
            <h3>Chart & research notes</h3>
            <p>
              Price charts show synthetic oscillations. Range buttons resample
              the synthetic model over different windows; these are not
              historical observations. Confidence scores are illustrative
              fixture values, not calibrated probabilities. Venue B is plotted
              as 1 − NO for comparison. Research returns are fixed illustrative
              samples, not measured strategy performance.
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              Back to the lab <ArrowRight size={15} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
