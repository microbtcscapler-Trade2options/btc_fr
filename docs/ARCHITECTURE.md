# Trade2Options System Architecture

## Overview
Trade2Options is an institutional-grade systematic Bitcoin momentum research, market intelligence, and independent MetaTrader 5 (MT5) execution platform.

The system is architected around **strict operational decoupling**:
1. **Trade2Options Intelligence Dashboard & Research Layer** (FastAPI backend + React/TypeScript frontend + Python ML/Quant research).
2. **Trade2Options BTC Momentum MT5 Expert Advisor** (Standalone MQL5 execution system).

---

```mermaid
graph TD
    subgraph MarketData [Market Data Feeds]
        Binance[Binance Public Spot REST API] --> CanonicalPipeline[Canonical Data Ingestion & Sanitizer]
        Yahoo[Yahoo Finance Fallback] --> CanonicalPipeline
    end

    subgraph IntelligenceEngine [Research & Intelligence Engine]
        CanonicalPipeline --> IndicatorEngine[Deterministic Indicators Engine<br/>Layer A: EMA 20/50/200<br/>Layer B: EMA 9/21/200 Advisory]
        IndicatorEngine --> RegimeEngine[Deterministic Market Regime Engine<br/>7-State Classification + Multi-TF Agreement]
        CanonicalPipeline --> ResearchAdapters[Research Adapter Layer]
        ResearchAdapters --> KronosAdapter[Kronos Forecasting Adapter<br/>Multi-Horizon RevIN Sampling]
        ResearchAdapters --> VibeAdapter[Vibe-Trading Adapter<br/>Candidate Backtesting]
        ResearchAdapters --> TVAdapter[TradingView MCP Adapter<br/>Status: STALE / DISCONNECTED]
        ResearchAdapters --> ToricAdapter[TORIC/Taurus Adapter<br/>Status: NOT CONFIGURED]
        CanonicalPipeline --> Backtester[Deterministic Backtester<br/>In-Sample 70% / Out-of-Sample 30%]
    end

    subgraph DashboardLayer [Institutional Research Terminal]
        IndicatorEngine --> FastAPIServer[FastAPI REST API Server :8000]
        RegimeEngine --> FastAPIServer
        KronosAdapter --> FastAPIServer
        Backtester --> FastAPIServer
        FastAPIServer --> ReactFrontend[React + TypeScript Dark Terminal UI<br/>7 Specialized Research Pages]
    end

    subgraph ExecutionLayer [Independent MT5 Execution System]
        MT5Feed[Broker MT5 BTC Symbol Feed] --> MQL5_EA[Trade2Options_BTC_Momentum.mq5<br/>Compiled Binary: .ex5]
        MQL5_EA --> IndicatorsInternal[Internal MT5 Moving Averages<br/>EMA 20 / 50 / 200]
        IndicatorsInternal --> SignalsInternal[Closed-Bar Signal Evaluation]
        SignalsInternal --> RiskManagerInternal[Internal Risk & Drawdown Controls<br/>Daily Loss Cap, DD Limit, Sizing]
        RiskManagerInternal --> MT5Broker[MT5 Broker Terminal / Execution Engine]
    end

    subgraph TelemetryBridge [One-Way Monitoring Telemetry Bridge]
        MQL5_EA -.->|Writes JSON Atomically| CommonFileBridge[Common/Files/trade2options_telemetry.json]
        CommonFileBridge -.->|Polls Telemetry (Non-Blocking)| FastAPIServer
    end
```

---

## Architectural Principles

### 1. Zero External Dependency for Order Execution
The MQL5 Expert Advisor does **not** rely on the Python backend, React frontend, an LLM, or an MCP server to open, modify, or close positions. If the dashboard or network disconnects, the EA continues to manage stops, targets, and risk limits natively within the MT5 terminal.

### 2. Separation of Analytical Layers
* **Layer A (Primary Trend Framework):** Uses EMA 20/50/200 on M15 with H1/H4 confirmation to establish primary market direction. This framework forms the strategy boundary implemented inside the EA.
* **Layer B (Entry Timing Framework):** Uses EMA 9/21/200 as an advisory momentum and pullback recovery indicator in the dashboard. It carries a mandatory advisory notice and does **not** alter the EA's trade signals without prior authorization.

### 3. Data Integrity & Lookahead Elimination
* Strategies and indicator values are calculated strictly on **completed closed bars** (`is_closed=True`).
* Out-of-sample data splits are strictly chronological.
* Incompatible broker execution feeds (`BTCUSD`) and exchange spot research feeds (`BTCUSDT`) are never conflated without accounting for price basis differences.
