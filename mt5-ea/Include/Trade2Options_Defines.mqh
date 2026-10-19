//+------------------------------------------------------------------+
//|                                     Trade2Options_Defines.mqh     |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"
#property version   "1.00"

enum ENUM_EXECUTION_MODE
{
   MODE_DEMO_TESTING = 0,    // Demo & Strategy Tester (Safe)
   MODE_LIVE_CAUTION = 1     // Live Trading (Explicit Authorization Required)
};

enum ENUM_SIGNAL_TYPE
{
   SIGNAL_NONE = 0,
   SIGNAL_BUY  = 1,
   SIGNAL_SELL = 2
};

struct SMarketState
{
   datetime bar_time;
   double   close_price;
   double   ema20;
   double   ema50;
   double   ema200;
   double   atr14;
   double   spread_points;
   bool     is_bullish_aligned;
   bool     is_bearish_aligned;
   bool     h1_bullish_aligned;
   bool     h1_bearish_aligned;
};


struct SPositionState
{
   ulong    ticket;
   int      type; // 0=Buy, 1=Sell
   double   volume;
   double   open_price;
   double   sl;
   double   tp;
   double   profit;
   datetime open_time;
};

struct SRiskMetrics
{
   double balance;
   double equity;
   double free_margin;
   double daily_loss_usd;
   double daily_loss_pct;
   int    consecutive_losses;
   bool   is_daily_limit_hit;
   bool   is_emergency_stop;
};
