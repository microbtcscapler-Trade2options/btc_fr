//+------------------------------------------------------------------+
//|                                  Trade2Options_BTC_Momentum.mq5   |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//|                                      https://trade2options.com   |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, Trade2Options"
#property link        "https://trade2options.com"
#property version     "1.00"
#property description "Trade2Options Institutional Bitcoin Momentum Microbot"
#property description "Independent MT5 execution system implementing Primary EMA 20/50/200 Trend Framework"

#include "..\Include\Trade2Options_Defines.mqh"
#include "..\Include\Trade2Options_Config.mqh"
#include "..\Include\Trade2Options_Indicators.mqh"
#include "..\Include\Trade2Options_Signals.mqh"
#include "..\Include\Trade2Options_Risk.mqh"
#include "..\Include\Trade2Options_Execution.mqh"
#include "..\Include\Trade2Options_Telemetry.mqh"

//--- Global Engine Modules
CIndicatorsManager g_indicators;
CRiskManager       g_risk;
CSignalEngine      g_signals;
CExecutionManager  g_execution;
CTelemetryBridge   g_telemetry;

datetime           g_last_bar_time = 0;
string             g_last_signal_str = "NONE";
string             g_last_error_str = "None";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("==================================================================");
   Print("  TRADE2OPTIONS BITCOIN MOMENTUM MICROBOT INITIALIZING            ");
   PrintFormat("  Symbol: %s | Timeframe: %s | Magic: %I64u", _Symbol, EnumToString(InpStrategyTimeframe), InpMagicNumber);
   PrintFormat("  Execution Mode: %s", (InpExecutionMode == MODE_DEMO_TESTING ? "DEMO_TESTING" : "LIVE_CAUTION"));
   Print("==================================================================");

   // 1. Initialize Indicator Handles
   if(!g_indicators.Init(_Symbol, InpStrategyTimeframe))
   {
      Print("[FATAL ERROR] Failed to initialize technical indicators.");
      return INIT_FAILED;
   }

   // 2. Initialize Risk Manager
   g_risk.Init();

   // 3. Start Telemetry Timer (1-second heartbeat)
   EventSetTimer(1);

   Print("[SUCCESS] Trade2Options EA initialized successfully.");
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   g_indicators.Release();
   PrintFormat("[DEINIT] Trade2Options EA terminated. Reason code: %d", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Always manage trailing stops on tick updates
   SMarketState cur_mkt;
   if(g_indicators.GetCompletedBarState(_Symbol, InpStrategyTimeframe, cur_mkt))
   {
      g_execution.ManageTrailingStop(_Symbol, cur_mkt.atr14);
   }

   // Enforce Closed-Bar processing to eliminate intra-bar noise and lookahead bias
   datetime current_bar_time = iTime(_Symbol, InpStrategyTimeframe, 0);
   if(current_bar_time == 0 || current_bar_time == g_last_bar_time)
   {
      return; // Wait for new bar open
   }

   // Mark new bar reached
   g_last_bar_time = current_bar_time;

   // 1. Retrieve completed bar market state
   SMarketState mkt;
   if(!g_indicators.GetCompletedBarState(_Symbol, InpStrategyTimeframe, mkt))
   {
      g_last_error_str = "Failed to copy indicator buffers";
      return;
   }

   // 2. Update Risk State
   SRiskMetrics risk;
   g_risk.EvaluateRiskMetrics(risk);

   // 3. Evaluate Signal on Closed Bar
   ENUM_SIGNAL_TYPE signal = g_signals.Evaluate(mkt);
   if(signal == SIGNAL_BUY)  g_last_signal_str = "BUY";
   else if(signal == SIGNAL_SELL) g_last_signal_str = "SELL";
   else g_last_signal_str = "HOLD/NONE";

   if(signal == SIGNAL_NONE)
   {
      return;
   }

   // 4. Pre-Execution Safety and Risk Validation
   string reject_reason = "";
   if(!g_risk.CanOpenNewTrade(_Symbol, reject_reason))
   {
      g_last_error_str = reject_reason;
      PrintFormat("[RISK LOCK] Trade blocked: %s", reject_reason);
      return;
   }

   // 5. Position Limit Verification
   int open_positions = g_execution.CountOpenPositions(_Symbol);
   if(open_positions >= InpMaxOpenPositions)
   {
      g_last_error_str = StringFormat("Position cap reached (%d/%d)", open_positions, InpMaxOpenPositions);
      return;
   }

   // 6. Calculate Position Size and Distance Parameters
   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);
   if(point <= 0.0) return;

   double sl_distance_pts = (InpATR_SL_Mult * mkt.atr14) / point;
   double tp_distance_pts = (InpATR_TP_Mult * mkt.atr14) / point;

   double volume = g_risk.CalculateLotSize(_Symbol, sl_distance_pts);
   if(volume <= 0.0)
   {
      g_last_error_str = "Calculated volume is zero or invalid";
      return;
   }

   // 7. Execute Order
   bool ok = g_execution.ExecuteOrder(_Symbol, signal, volume, sl_distance_pts, tp_distance_pts);
   if(ok)
   {
      g_last_error_str = "None";
   }
   else
   {
      g_last_error_str = "Order rejected by broker";
   }
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   SMarketState mkt;
   if(g_indicators.GetCompletedBarState(_Symbol, InpStrategyTimeframe, mkt))
   {
      SRiskMetrics risk;
      g_risk.EvaluateRiskMetrics(risk);
      g_telemetry.PublishTelemetry(_Symbol, InpStrategyTimeframe, mkt, risk, g_last_signal_str, g_last_error_str);
   }
}
