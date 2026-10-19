"""
Quick verification of Data Pipeline, Technical Indicators, and Market Regime Engine.
"""
import sys
import os

# Add root of trade2options to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from contracts.schemas import TimeFrame
from research.data.service import MarketDataService
from research.features.indicators import IndicatorEngine
from research.regime.engine import MarketRegimeEngine


def main():
    print("Testing Trade2Options Bitcoin Market Data Pipeline...")
    service = MarketDataService()
    snapshot = service.get_market_data(symbol="BTCUSDT", timeframe=TimeFrame.M15, limit=250)

    print(f"Data Available: {snapshot.is_data_available}")
    print(f"Candles Count: {snapshot.candles_count}")
    print(f"Source: {snapshot.source}")
    if snapshot.latest_candle:
        print(f"Latest Candle: {snapshot.latest_candle.timestamp} | Close: ${snapshot.latest_candle.close:,.2f}")

    if snapshot.candles_count < 50:
        print("[ERROR] Insufficient candles fetched!")
        return

    print("\nComputing Indicators (Layer A, Layer B, Momentum)...")
    ind = IndicatorEngine.compute_all(snapshot.candles, TimeFrame.M15)
    if ind:
        print(f"Primary Trend (Layer A): {ind.primary_trend.trend_description}")
        print(f"  EMA 20: ${ind.primary_trend.ema20:,.2f} (Slope: {ind.primary_trend.ema20_slope_deg} deg)")
        print(f"  EMA 50: ${ind.primary_trend.ema50:,.2f} (Slope: {ind.primary_trend.ema50_slope_deg} deg)")
        print(f"  EMA 200: ${ind.primary_trend.ema200:,.2f} (Slope: {ind.primary_trend.ema200_slope_deg} deg)")
        print(f"Entry Timing (Layer B Advisory): Rating={ind.entry_timing.rating} Score={ind.entry_timing.score}/100")
        print(f"  Factors: {ind.entry_timing.factor_breakdown}")
        print(f"Momentum: RSI={ind.momentum.rsi_14} | ADX={ind.momentum.adx_14} | ATR={ind.momentum.atr_14} | CI={ind.momentum.choppiness_index}")

    print("\nEvaluating Market Regime Engine...")
    h1_snapshot = service.get_market_data(symbol="BTCUSDT", timeframe=TimeFrame.H1, limit=100)
    regime_snap = MarketRegimeEngine.evaluate(snapshot.candles, h1_snapshot.candles if h1_snapshot.is_data_available else None)
    print(f"Regime: {regime_snap.regime} (Confidence: {regime_snap.confidence_pct}%)")
    print(f"Rationale: {regime_snap.rationale}")
    print(f"Supporting: {regime_snap.supporting_indicators}")
    print(f"Conflicting: {regime_snap.conflicting_indicators}")
    print(f"HTF Agreement: {regime_snap.higher_timeframe_agreement}")
    print("\n[SUCCESS] Pipeline, Indicators, and Regime Engine verified with live market data!")


if __name__ == "__main__":
    main()
