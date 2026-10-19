//+------------------------------------------------------------------+
//|                                  Trade2Options_Indicators.mqh     |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include "Trade2Options_Defines.mqh"
#include "Trade2Options_Config.mqh"

class CIndicatorsManager
{
private:
   int m_handle_ema20;
   int m_handle_ema50;
   int m_handle_ema200;
   int m_handle_atr;
   int m_handle_h1_ema50;
   int m_handle_h1_ema200;
   bool m_is_initialized;

public:
   CIndicatorsManager() : m_handle_ema20(INVALID_HANDLE),
                          m_handle_ema50(INVALID_HANDLE),
                          m_handle_ema200(INVALID_HANDLE),
                          m_handle_atr(INVALID_HANDLE),
                          m_handle_h1_ema50(INVALID_HANDLE),
                          m_handle_h1_ema200(INVALID_HANDLE),
                          m_is_initialized(false) {}

   ~CIndicatorsManager()
   {
      Release();
   }

   bool Init(string symbol, ENUM_TIMEFRAMES tf)
   {
      Release();

      m_handle_ema20     = iMA(symbol, tf, InpEMA20_Period, 0, MODE_EMA, PRICE_CLOSE);
      m_handle_ema50     = iMA(symbol, tf, InpEMA50_Period, 0, MODE_EMA, PRICE_CLOSE);
      m_handle_ema200    = iMA(symbol, tf, InpEMA200_Period, 0, MODE_EMA, PRICE_CLOSE);
      m_handle_atr       = iATR(symbol, tf, InpATR_Period);
      m_handle_h1_ema50  = iMA(symbol, PERIOD_H1, InpEMA50_Period, 0, MODE_EMA, PRICE_CLOSE);
      m_handle_h1_ema200 = iMA(symbol, PERIOD_H1, InpEMA200_Period, 0, MODE_EMA, PRICE_CLOSE);

      if(m_handle_ema20 == INVALID_HANDLE || m_handle_ema50 == INVALID_HANDLE ||
         m_handle_ema200 == INVALID_HANDLE || m_handle_atr == INVALID_HANDLE)
      {
         PrintFormat("[ERROR] Failed to create indicator handles. EMA20=%d, EMA50=%d, EMA200=%d, ATR=%d",
                     m_handle_ema20, m_handle_ema50, m_handle_ema200, m_handle_atr);
         m_is_initialized = false;
         return false;
      }

      m_is_initialized = true;
      PrintFormat("[INIT] Indicator handles initialized successfully on %s (%s + H1 confirmation).", symbol, EnumToString(tf));
      return true;
   }

   void Release()
   {
      if(m_handle_ema20 != INVALID_HANDLE)     { IndicatorRelease(m_handle_ema20);     m_handle_ema20 = INVALID_HANDLE; }
      if(m_handle_ema50 != INVALID_HANDLE)     { IndicatorRelease(m_handle_ema50);     m_handle_ema50 = INVALID_HANDLE; }
      if(m_handle_ema200 != INVALID_HANDLE)    { IndicatorRelease(m_handle_ema200);    m_handle_ema200 = INVALID_HANDLE; }
      if(m_handle_atr != INVALID_HANDLE)       { IndicatorRelease(m_handle_atr);       m_handle_atr = INVALID_HANDLE; }
      if(m_handle_h1_ema50 != INVALID_HANDLE)  { IndicatorRelease(m_handle_h1_ema50);  m_handle_h1_ema50 = INVALID_HANDLE; }
      if(m_handle_h1_ema200 != INVALID_HANDLE) { IndicatorRelease(m_handle_h1_ema200); m_handle_h1_ema200 = INVALID_HANDLE; }
      m_is_initialized = false;
   }


   bool GetCompletedBarState(string symbol, ENUM_TIMEFRAMES tf, SMarketState &out_state)
   {
      if(!m_is_initialized) return false;

      // Copy index 1 (the last completed closed bar to prevent lookahead bias)
      double buf_ema20[2], buf_ema50[2], buf_ema200[2], buf_atr[1];
      MqlRates rates[2];

      if(CopyBuffer(m_handle_ema20, 0, 1, 2, buf_ema20) < 2) return false;
      if(CopyBuffer(m_handle_ema50, 0, 1, 2, buf_ema50) < 2) return false;
      if(CopyBuffer(m_handle_ema200, 0, 1, 2, buf_ema200) < 2) return false;
      if(CopyBuffer(m_handle_atr, 0, 1, 1, buf_atr) < 1) return false;
      if(CopyRates(symbol, tf, 1, 2, rates) < 2) return false;

      // In MqlRates and CopyBuffer with index 1 and count 2:
      // index 1 in buffer is bar 1 (most recent completed), index 0 is bar 2 (prior completed)
      double close1 = rates[1].close;
      double ema20_1 = buf_ema20[1];
      double ema50_1 = buf_ema50[1];
      double ema200_1 = buf_ema200[1];

      out_state.bar_time = rates[1].time;
      out_state.close_price = close1;
      out_state.ema20 = ema20_1;
      out_state.ema50 = ema50_1;
      out_state.ema200 = ema200_1;
      out_state.atr14 = buf_atr[0];

      long spread = 0;
      SymbolInfoInteger(symbol, SYMBOL_SPREAD, spread);
      out_state.spread_points = (double)spread;

      // Primary Trend Alignment rules (EMA 20/50/200)
      out_state.is_bullish_aligned = (ema20_1 > ema50_1) && (ema50_1 > ema200_1) && (close1 > ema200_1);
      out_state.is_bearish_aligned = (ema20_1 < ema50_1) && (ema50_1 < ema200_1) && (close1 < ema200_1);

      // Higher Timeframe (H1) Confirmation
      double buf_h1_50[1], buf_h1_200[1];
      if(m_handle_h1_ema50 != INVALID_HANDLE && m_handle_h1_ema200 != INVALID_HANDLE &&
         CopyBuffer(m_handle_h1_ema50, 0, 1, 1, buf_h1_50) >= 1 &&
         CopyBuffer(m_handle_h1_ema200, 0, 1, 1, buf_h1_200) >= 1)
      {
         out_state.h1_bullish_aligned = (buf_h1_50[0] > buf_h1_200[0]);
         out_state.h1_bearish_aligned = (buf_h1_50[0] < buf_h1_200[0]);
      }
      else
      {
         out_state.h1_bullish_aligned = true;
         out_state.h1_bearish_aligned = true;
      }

      return true;
   }

};
