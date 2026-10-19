# Trade2Options BTC Momentum MT5 EA Installation & User Guide

## Architecture Boundary Notice
The Trade2Options MT5 Expert Advisor (`Trade2Options_BTC_Momentum.mq5`) is an **independent execution system**. It calculates its own indicators, manages orders, trails stops, and enforces daily risk limits natively inside MetaTrader 5. It does **not** depend on Python, the Dashboard, or external APIs to execute trades.

---

## 1. File Structure & Installation

1. Copy the source files to your MT5 Data Folder:
   * **Source Directory:** `scratch/trade2options/mt5-ea/`
   * Open MT5, click **File > Open Data Folder**.
   * Copy `mt5-ea/Include/*.mqh` into `MQL5\Include\`.
   * Copy `mt5-ea/Experts/Trade2Options_BTC_Momentum.mq5` and `.ex5` into `MQL5\Experts\`.

2. Direct Compilation via MetaEditor:
   * Open **MetaEditor** (F4 in MT5).
   * Open `Trade2Options_BTC_Momentum.mq5`.
   * Press **F7 (Compile)**.
   * Verify compilation log: `0 errors, 0 warnings`.
   * The binary `Trade2Options_BTC_Momentum.ex5` will be created automatically.

---

## 2. Configurable Input Parameters

| Parameter | Type | Default | Institutional Purpose |
|---|---|---|---|
| `InpExecutionMode` | Enum | `MODE_DEMO_TESTING` | Defaults safely to Demo/Testing. Never default to Live. |
| `InpEmergencyStop` | bool | `false` | Immediate killswitch: halts new order placement when set to `true`. |
| `InpMagicNumber` | ulong | `261016` | Unique identifier separating EA orders from manual trades. |
| `InpStrategyTimeframe` | Enum | `PERIOD_M15` | Execution timeframe for closed-bar signals. |
| `InpEMA20_Period` | int | `20` | Fast primary trend EMA. |
| `InpEMA50_Period` | int | `50` | Medium primary trend EMA. |
| `InpEMA200_Period` | int | `200` | Macro baseline trend EMA. |
| `InpATR_Period` | int | `14` | Volatility measurement lookback. |
| `InpATR_SL_Mult` | double | `1.5` | Dynamic Stop Loss distance in ATRs. |
| `InpATR_TP_Mult` | double | `3.0` | Dynamic Take Profit distance in ATRs (1:2 Risk/Reward). |
| `InpUseTrailingStop` | bool | `true` | Trailing stop enabled after trade reaches 1.8 ATR profit. |
| `InpUsePercentRisk` | bool | `true` | Sizes position dynamically to risk 1.0% of account balance. |
| `InpDailyLossLimitUSD`| double | `500.0` | Hard loss cap in USD: locks trading for the remainder of the day if breached. |
| `InpMaxAccountDDPct` | double | `10.0` | Hard account drawdown cap from peak equity. |
| `InpMaxSpreadPoints` | double | `80.0` | Filters entries during high spread/illiquidity events. |
| `InpEnableTelemetry` | bool | `true` | Publishes one-way JSON heartbeat for dashboard monitoring. |

---

## 3. Telemetry Bridge Operation
* When `InpEnableTelemetry = true` and `InpUseCommonFolder = true`, the EA writes a lightweight sanitized snapshot every 5 seconds to:
  `%APPDATA%\MetaQuotes\Terminal\Common\Files\trade2options_telemetry.json`
* The Dashboard backend reads this file locally in read-only mode.
* If telemetry write fails or disk is full, the EA **ignores the telemetry failure and continues managing open trades safely**.
