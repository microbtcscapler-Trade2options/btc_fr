# Trade2Options Known Limitations & Governance Record

## 1. Third-Party Integration Status
* **TORIC / Taurus Research:** The repository URL has not been established in the workspace or git references. Explicitly recorded as **`NOT CONFIGURED`**. No placeholder code or counterfeit dependencies have been introduced.
* **TradingView MCP:** The TradingView MCP adapter is registered. However, the connection reports **`STALE / DISCONNECTED`** because the TradingView desktop application is not currently launched with Chrome DevTools Protocol (`--remote-debugging-port`) enabled.
* **Kronos Forecasting:** Evaluated and connected. Directional accuracy is documented at 41.7% on raw M15 BTC bars; model outputs remain research-only.

## 2. Broker Feed vs Exchange Feed Basis
* The EA runs on broker execution symbols (e.g. `BTCUSD` on Exness MT5).
* The research dashboard connects to Binance Spot (`BTCUSDT`) and Yahoo Finance (`BTC-USD`).
* Spot exchange and CFD broker spreads/funding rates vary; therefore, backtest results assume institutional slippage ($10-$20/BTC) and typical spreads (15-25 points).

## 3. Governance Decisions Pending User Authorization
* **Live Trading Authorization:** EA defaults to `MODE_DEMO_TESTING`. Switching to `MODE_LIVE_CAUTION` requires explicit user authorization.
* **Advisory Layer Execution:** The EMA 9/21/200 layer remains advisory-only on Page 3 of the dashboard and is not injected into MT5 order execution without documented approval.
