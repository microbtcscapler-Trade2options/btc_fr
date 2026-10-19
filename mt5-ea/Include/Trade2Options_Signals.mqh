//+------------------------------------------------------------------+
//|                                     Trade2Options_Signals.mqh     |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include "Trade2Options_Defines.mqh"
#include "Trade2Options_Config.mqh"

class CSignalEngine
{
public:
   // Evaluates closed-bar signal based on approved Primary EMA 20/50/200 Trend Strategy
   static ENUM_SIGNAL_TYPE Evaluate(const SMarketState &state)
   {
      // 1. Spread Check
      if(state.spread_points > InpMaxSpreadPoints)
      {
         PrintFormat("[SIGNAL FILTER] Spread too high (%0.1f > %0.1f pts). Signals suppressed.",
                     state.spread_points, InpMaxSpreadPoints);
         return SIGNAL_NONE;
      }

      // 2. Minimum Volatility Check (ATR > 0)
      if(state.atr14 <= 0.0)
      {
         return SIGNAL_NONE;
      }

      // 3. Primary Bullish Trend Condition:
      // EMA20 > EMA50 > EMA200, Close > EMA200
      // MTF Confirmation: H1 EMA50 > H1 EMA200
      if(state.is_bullish_aligned)
      {
         if(!InpUseMTFConfirmation || state.h1_bullish_aligned)
         {
            if(state.close_price >= state.ema20)
            {
               return SIGNAL_BUY;
            }
         }
      }

      // 4. Primary Bearish Trend Condition:
      // EMA20 < EMA50 < EMA200, Close < EMA200
      // MTF Confirmation: H1 EMA50 < H1 EMA200
      if(state.is_bearish_aligned)
      {
         if(!InpUseMTFConfirmation || state.h1_bearish_aligned)
         {
            if(state.close_price <= state.ema20)
            {
               return SIGNAL_SELL;
            }
         }
      }

      return SIGNAL_NONE;
   }

};
