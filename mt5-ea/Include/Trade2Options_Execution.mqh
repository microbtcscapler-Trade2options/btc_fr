//+------------------------------------------------------------------+
//|                                  Trade2Options_Execution.mqh      |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include <Trade\Trade.mqh>
#include "Trade2Options_Defines.mqh"
#include "Trade2Options_Config.mqh"

class CExecutionManager
{
private:
   CTrade m_trade;

public:
   CExecutionManager()
   {
      m_trade.SetExpertMagicNumber(InpMagicNumber);
      m_trade.SetDeviationInPoints(InpDeviationPoints);
      m_trade.SetTypeFilling(ORDER_FILLING_FOK);
   }

   int CountOpenPositions(string symbol)
   {
      int count = 0;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0)
         {
            if(PositionGetString(POSITION_SYMBOL) == symbol &&
               PositionGetInteger(POSITION_MAGIC) == (long)InpMagicNumber)
            {
               count++;
            }
         }
      }
      return count;
   }

   bool ExecuteOrder(string symbol, ENUM_SIGNAL_TYPE signal, double volume, double sl_distance_pts, double tp_distance_pts)
   {
      double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
      int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);

      MqlTick tick;
      if(!SymbolInfoTick(symbol, tick))
      {
         Print("[EXECUTION ERROR] SymbolInfoTick failed.");
         return false;
      }

      double price = 0.0;
      double sl = 0.0;
      double tp = 0.0;

      if(signal == SIGNAL_BUY)
      {
         price = tick.ask;
         sl = NormalizeDouble(price - (sl_distance_pts * point), digits);
         tp = NormalizeDouble(price + (tp_distance_pts * point), digits);

         PrintFormat("[ORDER ATTEMPT] BUY %s Vol: %0.2f Price: %0.2f SL: %0.2f TP: %0.2f",
                     symbol, volume, price, sl, tp);
         if(m_trade.Buy(volume, symbol, price, sl, tp, InpTradeComment))
         {
            PrintFormat("[ORDER SUCCESS] BUY Ticket #%I64u executed.", m_trade.ResultOrder());
            return true;
         }
         else
         {
            PrintFormat("[ORDER REJECTED] Retcode: %u, Error: %s", m_trade.ResultRetcode(), m_trade.ResultComment());
            return false;
         }
      }
      else if(signal == SIGNAL_SELL)
      {
         price = tick.bid;
         sl = NormalizeDouble(price + (sl_distance_pts * point), digits);
         tp = NormalizeDouble(price - (tp_distance_pts * point), digits);

         PrintFormat("[ORDER ATTEMPT] SELL %s Vol: %0.2f Price: %0.2f SL: %0.2f TP: %0.2f",
                     symbol, volume, price, sl, tp);
         if(m_trade.Sell(volume, symbol, price, sl, tp, InpTradeComment))
         {
            PrintFormat("[ORDER SUCCESS] SELL Ticket #%I64u executed.", m_trade.ResultOrder());
            return true;
         }
         else
         {
            PrintFormat("[ORDER REJECTED] Retcode: %u, Error: %s", m_trade.ResultRetcode(), m_trade.ResultComment());
            return false;
         }
      }

      return false;
   }

   void ManageTrailingStop(string symbol, double atr14)
   {
      if(!InpUseTrailingStop || atr14 <= 0.0) return;

      double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
      int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
      double trail_distance = InpTrailing_ATR_Mult * atr14;

      MqlTick tick;
      if(!SymbolInfoTick(symbol, tick)) return;

      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0)
         {
            if(PositionGetString(POSITION_SYMBOL) == symbol &&
               PositionGetInteger(POSITION_MAGIC) == (long)InpMagicNumber)
            {
               long pos_type = PositionGetInteger(POSITION_TYPE);
               double open_p  = PositionGetDouble(POSITION_PRICE_OPEN);
               double current_sl = PositionGetDouble(POSITION_SL);
               double current_tp = PositionGetDouble(POSITION_TP);

               if(pos_type == POSITION_TYPE_BUY)
               {
                  double target_sl = NormalizeDouble(tick.bid - trail_distance, digits);
                  // Only move SL up, and only after in profit
                  if(tick.bid > open_p + trail_distance && (target_sl > current_sl || current_sl == 0.0))
                  {
                     m_trade.PositionModify(ticket, target_sl, current_tp);
                     PrintFormat("[TRAILING SL] BUY #%I64u SL updated to %0.2f", ticket, target_sl);
                  }
               }
               else if(pos_type == POSITION_TYPE_SELL)
               {
                  double target_sl = NormalizeDouble(tick.ask + trail_distance, digits);
                  // Only move SL down
                  if(tick.ask < open_p - trail_distance && (target_sl < current_sl || current_sl == 0.0))
                  {
                     m_trade.PositionModify(ticket, target_sl, current_tp);
                     PrintFormat("[TRAILING SL] SELL #%I64u SL updated to %0.2f", ticket, target_sl);
                  }
               }
            }
         }
      }
   }
};
