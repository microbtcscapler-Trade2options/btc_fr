"""
Trade2Options Deterministic Backtesting and Strategy Experiment Engine.
Evaluates Bitcoin Momentum Strategy across chronological In-Sample and Out-of-Sample splits.
Accounts for realistic spread, slippage, and commissions.
Breaks down performance by market regime and prevents lookahead bias.
"""

from __future__ import annotations
import math
import hashlib
import json
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
import numpy as np
import pandas as pd

from contracts.schemas import (
    Candle,
    TimeFrame,
    OrderSide,
    RegimeType,
    BacktestMetrics,
    BacktestResult
)
from research.features.indicators import IndicatorEngine
from research.regime.engine import MarketRegimeEngine
from research.data.canonical import CandleValidator


class TradeRecord:
    def __init__(
        self,
        entry_time: str,
        exit_time: str,
        side: OrderSide,
        entry_price: float,
        exit_price: float,
        volume_btc: float,
        pnl_usd: float,
        fees_usd: float,
        regime: str,
        reason: str
    ):
        self.entry_time = entry_time
        self.exit_time = exit_time
        self.side = side
        self.entry_price = entry_price
        self.exit_price = exit_price
        self.volume_btc = volume_btc
        self.pnl_usd = pnl_usd
        self.fees_usd = fees_usd
        self.regime = regime
        self.reason = reason


class DeterministicBacktester:
    def __init__(
        self,
        initial_balance_usd: float = 10000.0,
        fixed_lot_btc: float = 0.1,
        spread_usd: float = 15.0,
        slippage_usd: float = 10.0,
        commission_pct: float = 0.0004  # 0.04% per trade
    ):
        self.initial_balance = initial_balance_usd
        self.fixed_lot_btc = fixed_lot_btc
        self.spread_usd = spread_usd
        self.slippage_usd = slippage_usd
        self.commission_pct = commission_pct

    def run(
        self,
        candles: List[Candle],
        use_regime_filter: bool = True,
        use_advisory_filter: bool = False,
        split_ratio: float = 0.70  # 70% In-sample, 30% Out-of-sample
    ) -> BacktestResult:
        """
        Executes backtest with zero lookahead bias:
        Signal evaluated strictly at candle close; execution simulated on next candle open.
        """
        if len(candles) < 80:
            raise ValueError("Insufficient candle history for chronological backtest")

        split_idx = int(len(candles) * split_ratio)
        is_candles = candles[:split_idx]
        oos_candles = candles[split_idx:]

        is_metrics, is_equity = self._simulate_window(is_candles, use_regime_filter, use_advisory_filter)
        oos_metrics, oos_equity = self._simulate_window(oos_candles, use_regime_filter, use_advisory_filter)

        # Full equity curve combining both
        combined_equity = is_equity + oos_equity

        # Create reproducible experiment hash
        config_summary = f"{candles[0].symbol}_{candles[0].timeframe}_{use_regime_filter}_{use_advisory_filter}_{len(candles)}"
        exp_hash = hashlib.sha256(config_summary.encode()).hexdigest()[:12]

        return BacktestResult(
            experiment_id=f"EXP-MOM-{exp_hash}",
            strategy_name="Trade2Options_BTC_Momentum",
            strategy_version="1.0.0",
            symbol=candles[0].symbol,
            timeframe=candles[0].timeframe,
            start_date=str(candles[0].timestamp),
            end_date=str(candles[-1].timestamp),
            in_sample_metrics=is_metrics,
            out_of_sample_metrics=oos_metrics,
            equity_curve=combined_equity,
            assumptions={
                "initial_balance_usd": self.initial_balance,
                "fixed_lot_btc": self.fixed_lot_btc,
                "spread_usd": self.spread_usd,
                "slippage_usd": self.slippage_usd,
                "commission_pct": self.commission_pct,
                "use_regime_filter": use_regime_filter,
                "use_advisory_filter": use_advisory_filter,
                "in_sample_bars": len(is_candles),
                "out_of_sample_bars": len(oos_candles)
            },
            reproducible_hash=exp_hash
        )

    def _simulate_window(
        self,
        candles: List[Candle],
        use_regime_filter: bool,
        use_advisory_filter: bool
    ) -> Tuple[BacktestMetrics, List[Dict[str, Any]]]:
        balance = self.initial_balance
        equity = balance
        peak_equity = balance
        max_dd_usd = 0.0
        max_dd_pct = 0.0

        trades: List[TradeRecord] = []
        equity_curve: List[Dict[str, Any]] = []

        active_trade: Optional[Dict[str, Any]] = None
        warmup_period = 50

        for i in range(warmup_period, len(candles) - 1):
            history_window = candles[:i + 1]
            next_candle = candles[i + 1]

            # 1. Update active trade stops / exits against next candle High/Low
            if active_trade:
                side = active_trade["side"]
                entry_p = active_trade["entry_price"]
                sl = active_trade["sl"]
                tp = active_trade["tp"]
                regime = active_trade["regime"]

                exit_price = None
                exit_reason = None

                if side == OrderSide.BUY:
                    if next_candle.low <= sl:
                        exit_price = sl - self.slippage_usd
                        exit_reason = "STOP_LOSS"
                    elif next_candle.high >= tp:
                        exit_price = tp - self.slippage_usd
                        exit_reason = "TAKE_PROFIT"
                elif side == OrderSide.SELL:
                    if next_candle.high >= sl:
                        exit_price = sl + self.slippage_usd
                        exit_reason = "STOP_LOSS"
                    elif next_candle.low <= tp:
                        exit_price = tp + self.slippage_usd
                        exit_reason = "TAKE_PROFIT"

                if exit_price:
                    # Calculate gross and net PnL
                    if side == OrderSide.BUY:
                        gross_pnl = (exit_price - entry_p) * self.fixed_lot_btc
                    else:
                        gross_pnl = (entry_p - exit_price) * self.fixed_lot_btc

                    fee = (entry_p + exit_price) * self.fixed_lot_btc * self.commission_pct
                    net_pnl = gross_pnl - fee
                    balance += net_pnl

                    trades.append(TradeRecord(
                        entry_time=str(active_trade["entry_time"]),
                        exit_time=str(next_candle.timestamp),
                        side=side,
                        entry_price=entry_p,
                        exit_price=exit_price,
                        volume_btc=self.fixed_lot_btc,
                        pnl_usd=round(net_pnl, 2),
                        fees_usd=round(fee, 2),
                        regime=regime,
                        reason=exit_reason
                    ))
                    active_trade = None

            # Track equity curve
            equity = balance
            if active_trade:
                cur_close = next_candle.close
                if active_trade["side"] == OrderSide.BUY:
                    unrealized = (cur_close - active_trade["entry_price"]) * self.fixed_lot_btc
                else:
                    unrealized = (active_trade["entry_price"] - cur_close) * self.fixed_lot_btc
                equity += unrealized

            if equity > peak_equity:
                peak_equity = equity
            dd_usd = peak_equity - equity
            dd_pct = (dd_usd / peak_equity) * 100.0 if peak_equity > 0 else 0.0

            if dd_usd > max_dd_usd:
                max_dd_usd = dd_usd
            if dd_pct > max_dd_pct:
                max_dd_pct = dd_pct

            equity_curve.append({
                "timestamp": str(next_candle.timestamp),
                "balance": round(balance, 2),
                "equity": round(equity, 2),
                "drawdown_pct": round(dd_pct, 2)
            })

            # 2. Check for new entry signal on closed candle i
            if active_trade is None:
                ind = IndicatorEngine.compute_all(history_window, candles[0].timeframe)
                if not ind:
                    continue

                regime_snap = MarketRegimeEngine.evaluate(history_window)
                regime_name = regime_snap.regime.value

                # Regime filter check
                if use_regime_filter and regime_snap.regime in [RegimeType.CHOPPY, RegimeType.HIGH_VOLATILITY_SHOCK]:
                    continue

                # Advisory timing filter check
                if use_advisory_filter and ind.entry_timing.score < 55.0:
                    continue

                pt = ind.primary_trend
                cur_close = float(history_window[-1].close)
                atr = ind.momentum.atr_14

                signal = OrderSide.HOLD
                if pt.is_aligned_bullish and cur_close >= pt.ema20:
                    signal = OrderSide.BUY
                elif pt.is_aligned_bearish and cur_close <= pt.ema20:
                    signal = OrderSide.SELL

                if signal != OrderSide.HOLD:
                    # Execute on next candle open
                    open_p = next_candle.open
                    if signal == OrderSide.BUY:
                        fill_price = open_p + (self.spread_usd / 2.0) + self.slippage_usd
                        sl = fill_price - (1.5 * atr)
                        tp = fill_price + (3.0 * atr)
                    else:
                        fill_price = open_p - (self.spread_usd / 2.0) - self.slippage_usd
                        sl = fill_price + (1.5 * atr)
                        tp = fill_price - (3.0 * atr)

                    active_trade = {
                        "side": signal,
                        "entry_time": next_candle.timestamp,
                        "entry_price": fill_price,
                        "sl": sl,
                        "tp": tp,
                        "regime": regime_name
                    }

        # Close remaining open position at end
        if active_trade:
            last_p = candles[-1].close
            if active_trade["side"] == OrderSide.BUY:
                gross_pnl = (last_p - active_trade["entry_price"]) * self.fixed_lot_btc
            else:
                gross_pnl = (active_trade["entry_price"] - last_p) * self.fixed_lot_btc
            fee = (active_trade["entry_price"] + last_p) * self.fixed_lot_btc * self.commission_pct
            net_pnl = gross_pnl - fee
            balance += net_pnl
            trades.append(TradeRecord(
                entry_time=str(active_trade["entry_time"]),
                exit_time=str(candles[-1].timestamp),
                side=active_trade["side"],
                entry_price=active_trade["entry_price"],
                exit_price=last_p,
                volume_btc=self.fixed_lot_btc,
                pnl_usd=round(net_pnl, 2),
                fees_usd=round(fee, 2),
                regime=active_trade["regime"],
                reason="END_OF_DATA"
            ))

        # Metrics aggregation
        total_trades = len(trades)
        winners = [t for t in trades if t.pnl_usd > 0]
        losers = [t for t in trades if t.pnl_usd <= 0]
        win_count = len(winners)
        loss_count = len(losers)

        gross_profit = sum(t.pnl_usd for t in winners)
        gross_loss = abs(sum(t.pnl_usd for t in losers))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (99.0 if gross_profit > 0 else 0.0)

        net_profit = balance - self.initial_balance
        net_ret_pct = (net_profit / self.initial_balance) * 100.0
        win_rate = (win_count / total_trades) * 100.0 if total_trades > 0 else 0.0
        expectancy = (net_profit / total_trades) if total_trades > 0 else 0.0

        avg_win = (gross_profit / win_count) if win_count > 0 else 0.0
        avg_loss = (gross_loss / loss_count) if loss_count > 0 else 0.0

        # Sharpe ratio estimation from trade returns
        trade_returns = [t.pnl_usd / self.initial_balance for t in trades]
        if len(trade_returns) > 1 and np.std(trade_returns) > 0:
            sharpe = float(np.mean(trade_returns) / np.std(trade_returns) * np.sqrt(252 * 24))
        else:
            sharpe = 0.0

        # Performance by market regime
        regime_breakdown: Dict[str, Dict[str, Any]] = {}
        for t in trades:
            reg = t.regime
            if reg not in regime_breakdown:
                regime_breakdown[reg] = {"trades": 0, "pnl": 0.0, "wins": 0}
            regime_breakdown[reg]["trades"] += 1
            regime_breakdown[reg]["pnl"] = round(regime_breakdown[reg]["pnl"] + t.pnl_usd, 2)
            if t.pnl_usd > 0:
                regime_breakdown[reg]["wins"] += 1

        for reg, stats in regime_breakdown.items():
            cnt = stats["trades"]
            stats["win_rate_pct"] = round((stats["wins"] / cnt) * 100.0, 1) if cnt > 0 else 0.0

        total_fees = sum(t.fees_usd for t in trades)

        metrics = BacktestMetrics(
            net_profit_usd=round(net_profit, 2),
            net_return_pct=round(net_ret_pct, 2),
            total_trades=total_trades,
            winning_trades=win_count,
            losing_trades=loss_count,
            win_rate_pct=round(win_rate, 1),
            profit_factor=round(profit_factor, 2),
            expectancy_usd=round(expectancy, 2),
            max_drawdown_usd=round(max_dd_usd, 2),
            max_drawdown_pct=round(max_dd_pct, 2),
            avg_win_usd=round(avg_win, 2),
            avg_loss_usd=round(avg_loss, 2),
            sharpe_ratio=round(sharpe, 2),
            total_fees_slippage_usd=round(total_fees, 2),
            regime_breakdown=regime_breakdown
        )

        return metrics, equity_curve
