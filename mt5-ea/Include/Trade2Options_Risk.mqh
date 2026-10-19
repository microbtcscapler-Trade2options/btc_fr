//+------------------------------------------------------------------+
//|                                       Trade2Options_Risk.mqh      |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include "Trade2Options_Defines.mqh"
#include "Trade2Options_Config.mqh"

class CRiskManager
{
private:
   double m_peak_equity;
   datetime m_last_day;
   double m_daily_starting_balance;
   int    m_consecutive_losses;

public:
   CRiskManager() : m_peak_equity(0.0),
                    m_last_day(0),
                    m_daily_starting_balance(0.0),
                    m_consecutive_losses(0) {}

   void Init()
   {
      double eq = AccountInfoDouble(ACCOUNT_EQUITY);
      double bal = AccountInfoDouble(ACCOUNT_BALANCE);
      m_peak_equity = (eq > 0) ? eq : bal;
      m_daily_starting_balance = bal;
      m_last_day = TimeCurrent() / 86400;
   }

   void UpdateDailyState()
   {
      datetime current_day = TimeCurrent() / 86400;
      if(current_day != m_last_day)
      {
         m_last_day = current_day;
         m_daily_starting_balance = AccountInfoDouble(ACCOUNT_BALANCE);
         m_consecutive_losses = 0;
         PrintFormat("[RISK RESET] New trading day started. Starting Balance: $%0.2f", m_daily_starting_balance);
      }

      double current_eq = AccountInfoDouble(ACCOUNT_EQUITY);
      if(current_eq > m_peak_equity)
      {
         m_peak_equity = current_eq;
      }
   }

   bool EvaluateRiskMetrics(SRiskMetrics &out_metrics)
   {
      UpdateDailyState();

      out_metrics.balance = AccountInfoDouble(ACCOUNT_BALANCE);
      out_metrics.equity = AccountInfoDouble(ACCOUNT_EQUITY);
      out_metrics.free_margin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
      out_metrics.consecutive_losses = m_consecutive_losses;
      out_metrics.is_emergency_stop = InpEmergencyStop;

      // Calculate Daily Realized P&L from Midnight UTC
      datetime midnight = (TimeCurrent() / 86400) * 86400;
      double daily_realized = 0.0;

      if(HistorySelect(midnight, TimeCurrent()))
      {
         int total_deals = HistoryDealsTotal();
         for(int i = 0; i < total_deals; i++)
         {
            ulong ticket = HistoryDealGetTicket(i);
            if(ticket > 0)
            {
               if(HistoryDealGetInteger(ticket, DEAL_MAGIC) == (long)InpMagicNumber)
               {
                  daily_realized += HistoryDealGetDouble(ticket, DEAL_PROFIT);
                  daily_realized += HistoryDealGetDouble(ticket, DEAL_SWAP);
                  daily_realized += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
               }
            }
         }
      }

      out_metrics.daily_loss_usd = (daily_realized < 0) ? -daily_realized : 0.0;
      out_metrics.daily_loss_pct = (m_daily_starting_balance > 0) ? (out_metrics.daily_loss_usd / m_daily_starting_balance) * 100.0 : 0.0;

      // Check daily loss limits
      bool daily_usd_breach = (out_metrics.daily_loss_usd >= InpDailyLossLimitUSD);
      bool daily_pct_breach = (out_metrics.daily_loss_pct >= InpDailyLossLimitPct);
      out_metrics.is_daily_limit_hit = (daily_usd_breach || daily_pct_breach);

      return true;
   }

   bool CanOpenNewTrade(string symbol, string &reject_reason)
   {
      // 1. Emergency Killswitch
      if(InpEmergencyStop)
      {
         reject_reason = "Emergency Stop is active (InpEmergencyStop=true).";
         return false;
      }

      // 2. Demo/Live safety gate
      if(InpExecutionMode == MODE_LIVE_CAUTION)
      {
         // Verify live account trading permissions
         if(AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_REAL)
         {
            // Allowed only if explicitly set
         }
      }

      // 3. Broker trade permission
      if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) || !MQLInfoInteger(MQL_TRADE_ALLOWED))
      {
         reject_reason = "Trading not allowed by MT5 terminal permissions.";
         return false;
      }

      ENUM_SYMBOL_TRADE_MODE trade_mode = (ENUM_SYMBOL_TRADE_MODE)SymbolInfoInteger(symbol, SYMBOL_TRADE_MODE);
      if(trade_mode != SYMBOL_TRADE_MODE_FULL)
      {
         reject_reason = "Broker symbol trading mode is not set to FULL.";
         return false;
      }

      // 4. Daily Loss Limits
      SRiskMetrics metrics;
      EvaluateRiskMetrics(metrics);
      if(metrics.is_daily_limit_hit)
      {
         reject_reason = StringFormat("Daily loss limit breached! Realized Loss: $%0.2f (%0.1f%%).",
                                      metrics.daily_loss_usd, metrics.daily_loss_pct);
         return false;
      }

      // 5. Maximum Account Drawdown Limit
      if(m_peak_equity > 0)
      {
         double cur_dd_pct = ((m_peak_equity - metrics.equity) / m_peak_equity) * 100.0;
         if(cur_dd_pct >= InpMaxAccountDDPct)
         {
            reject_reason = StringFormat("Max Account Drawdown breached! DD: %0.2f%% >= Limit: %0.2f%%.",
                                         cur_dd_pct, InpMaxAccountDDPct);
            return false;
         }
      }

      // 6. Consecutive Loss Filter
      if(m_consecutive_losses >= InpMaxConsecutiveLoss)
      {
         reject_reason = StringFormat("Max consecutive losses reached (%d). Protection lock engaged.", m_consecutive_losses);
         return false;
      }

      return true;
   }

   double CalculateLotSize(string symbol, double sl_distance_points)
   {
      double min_lot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
      double max_lot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
      double lot_step = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);

      if(!InpUsePercentRisk)
      {
         double raw_lot = InpFixedLotSize;
         return NormalizeLot(raw_lot, min_lot, max_lot, lot_step);
      }

      if(sl_distance_points <= 0.0)
      {
         return min_lot;
      }

      double balance = AccountInfoDouble(ACCOUNT_BALANCE);
      double risk_amount = balance * (InpRiskPercent / 100.0);

      double tick_value = SymbolInfoDouble(symbol, SYMBOL_TRADE_TICK_VALUE);
      double tick_size  = SymbolInfoDouble(symbol, SYMBOL_TRADE_TICK_SIZE);
      double point      = SymbolInfoDouble(symbol, SYMBOL_POINT);

      if(tick_size <= 0.0 || point <= 0.0 || tick_value <= 0.0)
      {
         return min_lot;
      }

      double points_per_tick = tick_size / point;
      double risk_per_lot = (sl_distance_points / points_per_tick) * tick_value;

      if(risk_per_lot <= 0.0)
      {
         return min_lot;
      }

      double calculated_lot = risk_amount / risk_per_lot;
      return NormalizeLot(calculated_lot, min_lot, max_lot, lot_step);
   }

   double NormalizeLot(double raw_lot, double min_lot, double max_lot, double lot_step)
   {
      double lot = MathFloor(raw_lot / lot_step) * lot_step;
      lot = MathMax(lot, min_lot);
      lot = MathMin(lot, max_lot);
      lot = MathMin(lot, InpMaxLotSize); // Enforce hard cap
      return NormalizeDouble(lot, 2);
   }

   void RegisterTradeResult(double profit)
   {
      if(profit < 0)
      {
         m_consecutive_losses++;
      }
      else if(profit > 0)
      {
         m_consecutive_losses = 0;
      }
   }
};
