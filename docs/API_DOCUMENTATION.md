# Trade2Options REST API Documentation

Base URL: `http://localhost:8000`  
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Returns system status, environment, and version.
* **Response 200 OK:**
  ```json
  {
    "status": "HEALTHY",
    "timestamp": "2026-10-16T10:00:00Z",
    "version": "1.0.0",
    "environment": "LOCAL_DEV_INSTITUTIONAL"
  }
  ```

---

## 2. Market Data & Intelligence

### `GET /api/market/candles`
Retrieves cleaned, validated OHLCV bars.
* **Query Parameters:**
  * `symbol` (string, default: `BTCUSDT`)
  * `timeframe` (string: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`, default: `15m`)
  * `limit` (integer: `20` to `1000`, default: `250`)
  * `force_refresh` (boolean, default: `false`)

### `GET /api/market/indicators`
Computes Layer A (EMA 20/50/200), Layer B (EMA 9/21/200 Advisory), and momentum features.
* **Response Model:** `IndicatorSnapshot`
  * `primary_trend`: `ema20`, `ema50`, `ema200`, slopes in degrees, alignment.
  * `entry_timing`: `ema9`, `ema21`, `score` (0-100), `rating`, `factor_breakdown`.
  * `momentum`: `rsi_14`, `adx_14`, `atr_14`, `choppiness_index`, `directional_efficiency`.

### `GET /api/market/regime`
Evaluates deterministic 7-state market regime with multi-timeframe confirmation (M15, H1, H4).
* **Response Model:** `MarketRegimeSnapshot`
  * `regime`: `BULLISH_TREND`, `BEARISH_TREND`, `SIDEWAYS`, `CHOPPY`, `HIGH_VOLATILITY_SHOCK`, `TRANSITION_UNCERTAIN`, `INSUFFICIENT_DATA`.
  * `confidence_pct`: Calibrated certainty score.
  * `rationale`: Explainable natural language rationale.
  * `supporting_indicators`: List of positive evidence.
  * `conflicting_indicators`: List of divergent signals.

---

## 3. Research & Model Orchestration

### `GET /api/research/integrations`
Returns status of all connected and unconfigured research frameworks.
* **Response Model:** `List[IntegrationHealth]`
  * `Kronos_Forecasting`: `CONNECTED`
  * `Vibe_Trading`: `CONNECTED`
  * `TradingView_MCP`: `STALE`
  * `TORIC_Taurus_Research`: `NOT_CONFIGURED`

### `GET /api/research/kronos-forecast`
Runs multi-horizon probabilistic forecast benchmark against Last-Close Persistence.
* **Response Model:** `ForecastResult`
  * `last_known_close`: Spot price at prediction time.
  * `forecast_horizons`: Target timestamp, predicted close, expected volatility %, 90% prediction band.
  * `mae_vs_persistence`: Empirical baseline error.
  * `directional_accuracy_pct`: Empirical direction edge.

### `GET /api/research/backtest/comparison`
Runs out-of-sample strategy comparison (Baseline vs Candidate A vs Candidate B).
* **Response Model:** Object containing results for each configuration, equity curve, trade log, and regime-level metrics.

---

## 4. MT5 EA Monitoring Bridge

### `GET /api/ea/status`
Reads telemetry written by the MT5 EA.
* **Response Model:**
  ```json
  {
    "is_connected": true,
    "is_stale": false,
    "file_age_seconds": 4.2,
    "message": "Telemetry streaming active",
    "status": {
      "heartbeat": {
        "magic_number": 261016,
        "ea_name": "Trade2Options_BTC_Momentum",
        "symbol": "BTCUSD",
        "timeframe": "M15",
        "broker_server": "Exness-MT5Trial8",
        "account_mode": "DEMO",
        "is_trading_allowed": true
      },
      "risk": {
        "account_balance": 10542.50,
        "account_equity": 10618.20,
        "daily_loss_limit_usd": 500.0,
        "is_daily_limit_breached": false
      },
      "positions": []
    }
  }
  ```

### `POST /api/ea/simulate-heartbeat`
Writes a verified test telemetry file for development and offline testing.

### `GET /api/audit/logs`
Returns the append-only system audit log.
