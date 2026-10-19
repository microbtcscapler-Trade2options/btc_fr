# Trade2Options: Bitcoin Momentum Systematic Platform

Institutional-Style Quant Research, Intelligence Dashboard & Independent MT5 Execution System.

---

## Workspace Structure

```
trade2options/
├── contracts/                  # Canonical Pydantic schemas and versioned data models
├── research/
│   ├── data/                   # Canonical data pipeline, Binance Spot loader, Yahoo fallback
│   ├── features/               # Deterministic Technical Indicators (Layer A, Layer B, Momentum)
│   ├── regime/                 # Deterministic 7-State Market Regime Engine
│   ├── adapters/               # Kronos, Vibe-Trading, TradingView MCP, TORIC adapters
│   ├── experiments/            # Deterministic backtester, strategy comparison, artifacts
│   └── validation/             # Multi-horizon baseline benchmarks
├── mt5-ea/
│   ├── Experts/                # Standalone MQL5 EA (Trade2Options_BTC_Momentum.mq5 / .ex5)
│   ├── Include/                # Modular EA headers (Config, Indicators, Signals, Risk, Telemetry)
│   └── Tests/                  # EA mathematical logic and risk limit unit tests
├── dashboard/
│   ├── backend/                # FastAPI REST API, telemetry bridge, market data endpoints
│   └── frontend/               # React + TypeScript dark trading terminal (7 research pages)
├── docs/                       # Architecture, API docs, EA install guide, methodology, limitations
└── scripts/
    ├── compile_ea.py           # MetaEditor compiler & binary verification script
    ├── run_backend.py          # FastAPI dashboard server runner (:8000)
    ├── run_all_tests.py        # Master acceptance test runner
    └── evaluate_kronos.py      # Kronos multi-horizon evaluation vs persistence baseline
```

---

## Quick Start Commands

### 1. Run Complete Acceptance Test Suite
Verifies EA logic unit tests, compiles the EA with MetaEditor, runs API tests, and verifies market data ingestion:
```bash
python scripts/run_all_tests.py
```

### 2. Launch the Intelligence Dashboard (Backend + Frontend)
Starts the FastAPI server serving the compiled React terminal on `http://localhost:8000`:
```bash
python scripts/run_backend.py
```
Open your browser to:
* **Research Terminal:** `http://localhost:8000/`
* **Swagger API Documentation:** `http://localhost:8000/docs`

### 3. Compile the MT5 Expert Advisor
Generates `Trade2Options_BTC_Momentum.ex5` via the local MetaEditor toolchain:
```bash
python scripts/compile_ea.py
```

### 4. Evaluate Kronos Foundation Model
Runs multi-horizon probabilistic benchmarks against Last-Close Persistence:
```bash
python scripts/evaluate_kronos.py
```
