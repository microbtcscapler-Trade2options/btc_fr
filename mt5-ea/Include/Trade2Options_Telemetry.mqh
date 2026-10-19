//+------------------------------------------------------------------+
//|                                  Trade2Options_Telemetry.mqh      |
//|                        Trade2Options Institutional Research EA    |
//|                                   Copyright 2026, Trade2Options  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Trade2Options"
#property link      "https://trade2options.com"

#include "Trade2Options_Defines.mqh"
#include "Trade2Options_Config.mqh"

class CTelemetryBridge
{
private:
   datetime m_last_published;

public:
   CTelemetryBridge() : m_last_published(0) {}

   void PublishTelemetry(string symbol, ENUM_TIMEFRAMES tf, const SMarketState &mkt, const SRiskMetrics &risk, const string last_signal, const string last_err)
   {
      if(!InpEnableTelemetry) return;

      datetime now = TimeCurrent();
      if(now - m_last_published < InpTelemetryInterval) return;
      m_last_published = now;

      // Build JSON payload without sensitive account passwords or credentials
      string json = "{\n";
      json += "  \"schema_version\": \"1.0.0\",\n";
      json += "  \"heartbeat\": {\n";
      json += StringFormat("    \"magic_number\": %I64u,\n", InpMagicNumber);
      json += "    \"ea_name\": \"Trade2Options_BTC_Momentum\",\n";
      json += "    \"ea_version\": \"1.0.0\",\n";
      json += StringFormat("    \"symbol\": \"%s\",\n", symbol);
      json += StringFormat("    \"timeframe\": \"%s\",\n", EnumToString(tf));
      json += StringFormat("    \"terminal_time\": \"%s\",\n", TimeToString(now, TIME_DATE|TIME_SECONDS));
      json += StringFormat("    \"broker_server\": \"%s\",\n", AccountInfoString(ACCOUNT_SERVER));
      json += StringFormat("    \"account_mode\": \"%s\",\n", (AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_REAL ? "LIVE" : "DEMO"));
      json += StringFormat("    \"is_trading_allowed\": %s,\n", (TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) ? "true" : "false"));
      json += StringFormat("    \"is_connected\": %s,\n", (TerminalInfoInteger(TERMINAL_CONNECTED) ? "true" : "false"));
      json += StringFormat("    \"last_tick_time\": \"%s\",\n", TimeToString(mkt.bar_time, TIME_DATE|TIME_MINUTES));
      json += StringFormat("    \"spread_points\": %0.1f\n", mkt.spread_points);
      json += "  },\n";

      // Risk Block
      json += "  \"risk\": {\n";
      json += StringFormat("    \"account_balance\": %0.2f,\n", risk.balance);
      json += StringFormat("    \"account_equity\": %0.2f,\n", risk.equity);
      json += StringFormat("    \"free_margin\": %0.2f,\n", risk.free_margin);
      json += StringFormat("    \"current_daily_drawdown_usd\": %0.2f,\n", risk.daily_loss_usd);
      json += StringFormat("    \"current_daily_drawdown_pct\": %0.2f,\n", risk.daily_loss_pct);
      json += StringFormat("    \"daily_loss_limit_usd\": %0.2f,\n", InpDailyLossLimitUSD);
      json += StringFormat("    \"max_drawdown_limit_pct\": %0.2f,\n", InpMaxAccountDDPct);
      json += StringFormat("    \"is_daily_limit_breached\": %s,\n", (risk.is_daily_limit_hit ? "true" : "false"));
      json += StringFormat("    \"max_lot_size\": %0.2f,\n", InpMaxLotSize);
      json += StringFormat("    \"open_positions_count\": %d,\n", PositionsTotal());
      json += StringFormat("    \"max_allowed_positions\": %d\n", InpMaxOpenPositions);
      json += "  },\n";

      // Positions Array
      json += "  \"positions\": [\n";
      bool first_pos = true;
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0 && PositionGetInteger(POSITION_MAGIC) == (long)InpMagicNumber)
         {
            if(!first_pos) json += ",\n";
            first_pos = false;

            string dir_str = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? "BUY" : "SELL";
            json += "    {\n";
            json += StringFormat("      \"ticket\": %I64u,\n", ticket);
            json += StringFormat("      \"symbol\": \"%s\",\n", PositionGetString(POSITION_SYMBOL));
            json += StringFormat("      \"direction\": \"%s\",\n", dir_str);
            json += StringFormat("      \"volume\": %0.2f,\n", PositionGetDouble(POSITION_VOLUME));
            json += StringFormat("      \"open_price\": %0.2f,\n", PositionGetDouble(POSITION_PRICE_OPEN));
            json += StringFormat("      \"current_price\": %0.2f,\n", PositionGetDouble(POSITION_PRICE_CURRENT));
            json += StringFormat("      \"stop_loss\": %0.2f,\n", PositionGetDouble(POSITION_SL));
            json += StringFormat("      \"take_profit\": %0.2f,\n", PositionGetDouble(POSITION_TP));
            json += StringFormat("      \"profit_usd\": %0.2f,\n", PositionGetDouble(POSITION_PROFIT));
            json += StringFormat("      \"open_time\": \"%s\",\n", TimeToString(PositionGetInteger(POSITION_TIME), TIME_DATE|TIME_SECONDS));
            json += StringFormat("      \"magic_number\": %I64u\n", InpMagicNumber);
            json += "    }";
         }
      }
      json += "\n  ],\n";

      json += StringFormat("  \"last_signal\": \"%s\",\n", last_signal);
      json += StringFormat("  \"last_error\": \"%s\",\n", last_err);
      json += StringFormat("  \"telemetry_updated_at\": \"%s\"\n", TimeToString(now, TIME_DATE|TIME_SECONDS));
      json += "}\n";

      // Write to Common or local MT5 Files folder atomically
      int file_flags = FILE_WRITE | FILE_TXT | FILE_ANSI;
      if(InpUseCommonFolder) file_flags |= FILE_COMMON;

      int handle = FileOpen(InpTelemetryFileName, file_flags);
      if(handle != INVALID_HANDLE)
      {
         FileWriteString(handle, json);
         FileClose(handle);
      }
   }
};
