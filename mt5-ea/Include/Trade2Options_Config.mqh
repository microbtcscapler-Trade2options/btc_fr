//+------------------------------------------------------------------+
//|                                      Trade2Options_Config.mqh     |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include "Trade2Options_Defines.mqh"

//--- Operational Controls
input group "=== System & Safety Safeguards ==="
input ENUM_EXECUTION_MODE InpExecutionMode    = MODE_DEMO_TESTING; // Execution Mode (Default: DEMO/TESTING)
input bool                InpEmergencyStop     = false;            // Emergency Trading Disable (Halt)
input ulong               InpMagicNumber       = 261016;           // Magic Number (Unique ID)
input ulong               InpDeviationPoints   = 30;               // Maximum Slippage (Deviation Points)
input string              InpTradeComment      = "T2O_BTC_Mom";    // Trade Order Comment

//--- Strategy Parameters (Primary EMA 20/50/200 Framework)
input group "=== Strategy Parameters (Primary Trend) ==="
input ENUM_TIMEFRAMES     InpStrategyTimeframe = PERIOD_M15;       // Execution Timeframe (Default: M15)
input int                 InpEMA20_Period      = 20;               // Fast Trend EMA Period
input int                 InpEMA50_Period      = 50;               // Medium Trend EMA Period
input int                 InpEMA200_Period     = 200;              // Macro Baseline EMA Period
input int                 InpATR_Period        = 14;               // Volatility ATR Period
input double              InpATR_SL_Mult       = 1.5;              // Stop Loss ATR Multiplier
input double              InpATR_TP_Mult       = 3.0;              // Take Profit ATR Multiplier (1:2 R:R)
input bool                InpUseTrailingStop   = true;             // Enable ATR Trailing Stop
input double              InpTrailing_ATR_Mult = 1.8;              // Trailing Stop Distance (ATR)
input bool                InpUseMTFConfirmation= true;             // Require H1 Trend Confirmation (EMA 50 > 200)


//--- Risk Management Constraints
input group "=== Institutional Risk Limits ==="
input bool                InpUsePercentRisk    = true;             // Use Account % Risk (false = Fixed Lots)
input double              InpRiskPercent       = 1.0;              // Risk Per Trade (% of Balance)
input double              InpFixedLotSize      = 0.01;             // Fixed Lot Size (if % risk false)
input double              InpMaxLotSize        = 2.0;              // Hard Max Lot Size Cap
input int                 InpMaxOpenPositions  = 1;                // Max Concurrent Positions
input double              InpDailyLossLimitUSD = 500.0;            // Daily Loss Limit ($ USD)
input double              InpDailyLossLimitPct = 4.0;              // Daily Loss Limit (% of Starting Balance)
input double              InpMaxAccountDDPct   = 10.0;             // Max Total Drawdown Limit (%)
input int                 InpMaxConsecutiveLoss= 3;                // Max Consecutive Losses Before Cooldown
input double              InpMaxSpreadPoints   = 80.0;             // Maximum Permissible Spread Points

//--- Telemetry Monitoring Bridge
input group "=== Telemetry & Intelligence Bridge ==="
input bool                InpEnableTelemetry   = true;             // Enable Local Telemetry Output
input bool                InpUseCommonFolder   = true;             // Write to MT5 Common Files Directory
input string              InpTelemetryFileName = "trade2options_telemetry.json"; // Output JSON filename
input int                 InpTelemetryInterval = 5;                // Telemetry Heartbeat Interval (Seconds)
