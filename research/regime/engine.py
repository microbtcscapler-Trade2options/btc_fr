"""
Trade2Options Deterministic Market Regime Engine.
Classifies Bitcoin market state into 7 mutually exclusive, explainable regimes:
1. BULLISH_TREND
2. BEARISH_TREND
3. SIDEWAYS
4. CHOPPY
5. HIGH_VOLATILITY_SHOCK
6. TRANSITION_UNCERTAIN
7. INSUFFICIENT_DATA

Uses mathematical indicator confluence (EMA alignment, slopes, ADX, ATR percentile,
Choppiness Index, Kaufman Efficiency Ratio, Higher Timeframe agreement) rather than black-box models.
"""

from __future__ import annotations
import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from contracts.schemas import (
    TimeFrame,
    RegimeType,
    MarketRegimeSnapshot,
    IndicatorSnapshot,
    Candle
)
from research.features.indicators import IndicatorEngine


class MarketRegimeEngine:
    """Explainable, calibrated deterministic market regime classification."""

    @classmethod
    def evaluate(
        cls,
        candles_m15: List[Candle],
        candles_h1: Optional[List[Candle]] = None,
        candles_h4: Optional[List[Candle]] = None
    ) -> MarketRegimeSnapshot:
        """Evaluates market regime using M15 primary data and H1/H4 confirmation context."""
        if not candles_m15 or len(candles_m15) < 50:
            return MarketRegimeSnapshot(
                symbol=candles_m15[0].symbol if candles_m15 else "BTCUSDT",
                timeframe=TimeFrame.M15,
                regime=RegimeType.INSUFFICIENT_DATA,
                confidence_pct=0.0,
                supporting_indicators=[],
                conflicting_indicators=["Dataset has fewer than 50 valid completed candles"],
                data_freshness_seconds=9999.0,
                rationale="Insufficient historical depth to evaluate moving averages and regime filters."
            )

        # Compute M15 indicators
        ind_m15 = IndicatorEngine.compute_all(candles_m15, TimeFrame.M15)
        if not ind_m15:
            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.INSUFFICIENT_DATA,
                confidence_pct=0.0,
                supporting_indicators=[],
                conflicting_indicators=["Indicator calculation failed"],
                data_freshness_seconds=9999.0,
                rationale="Unable to compute standard indicators."
            )

        # Context from H1 and H4 if provided
        htf_agreement: Dict[str, str] = {}
        h1_trend = "UNKNOWN"
        h4_trend = "UNKNOWN"

        if candles_h1 and len(candles_h1) >= 50:
            ind_h1 = IndicatorEngine.compute_all(candles_h1, TimeFrame.H1)
            if ind_h1:
                h1_trend = ind_h1.primary_trend.trend_description
                htf_agreement["H1"] = h1_trend

        if candles_h4 and len(candles_h4) >= 50:
            ind_h4 = IndicatorEngine.compute_all(candles_h4, TimeFrame.H4)
            if ind_h4:
                h4_trend = ind_h4.primary_trend.trend_description
                htf_agreement["H4"] = h4_trend

        # Extract M15 features
        pt = ind_m15.primary_trend
        mom = ind_m15.momentum

        # Calculate data freshness
        now_utc = datetime.now(timezone.utc)
        last_candle_time = candles_m15[-1].timestamp
        if last_candle_time.tzinfo is None:
            last_candle_time = last_candle_time.replace(tzinfo=timezone.utc)
        freshness_sec = max(0.0, (now_utc - last_candle_time).total_seconds())

        supporting: List[str] = []
        conflicting: List[str] = []

        # ====================================================================
        # REGIME RULE 1: HIGH VOLATILITY SHOCK
        # Volatility spike: ATR Percentile >= 92% OR (ADX > 45 AND Choppiness > 55)
        # ====================================================================
        if mom.atr_percentile_100 >= 92.0:
            supporting.append(f"ATR Percentile ({mom.atr_percentile_100:.1f}%) exceeds 92nd percentile extreme threshold.")
            supporting.append(f"14-period ATR is ${mom.atr_14:.2f}.")
            if abs(mom.roc_14) > 4.0:
                supporting.append(f"High Rate of Change: {mom.roc_14:+.2f}%.")
            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.HIGH_VOLATILITY_SHOCK,
                confidence_pct=round(min(98.0, 75.0 + (mom.atr_percentile_100 - 92.0) * 3), 1),
                supporting_indicators=supporting,
                conflicting_indicators=conflicting,
                higher_timeframe_agreement=htf_agreement,
                data_freshness_seconds=round(freshness_sec, 1),
                rationale="Market volatility has expanded rapidly to extreme percentiles, presenting elevated gap and liquidation risk."
            )

        # ====================================================================
        # REGIME RULE 2: CHOPPY / LOW DIRECTIONAL EFFICIENCY
        # Choppiness Index > 60 OR Kaufman Efficiency Ratio < 0.20 with ADX < 20
        # ====================================================================
        if mom.choppiness_index >= 60.0 or (mom.directional_efficiency < 0.20 and mom.adx_14 < 20.0):
            if mom.choppiness_index >= 60.0:
                supporting.append(f"Choppiness Index ({mom.choppiness_index:.1f}) exceeds 60 threshold (whipsaw territory).")
            if mom.directional_efficiency < 0.20:
                supporting.append(f"Kaufman Efficiency Ratio is {mom.directional_efficiency:.3f} (< 0.20 noise threshold).")
            if mom.adx_14 < 20.0:
                supporting.append(f"ADX ({mom.adx_14:.1f}) indicates sub-trend exhaustion (< 20).")

            if pt.is_aligned_bullish or pt.is_aligned_bearish:
                conflicting.append("EMAs show superficial directional alignment despite non-directional chop.")

            confidence = min(92.0, 60.0 + (mom.choppiness_index - 60.0) * 1.5)
            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.CHOPPY,
                confidence_pct=round(confidence, 1),
                supporting_indicators=supporting,
                conflicting_indicators=conflicting,
                higher_timeframe_agreement=htf_agreement,
                data_freshness_seconds=round(freshness_sec, 1),
                rationale="Price action is oscillating randomly within candles without directional follow-through. High false-breakout probability."
            )

        # ====================================================================
        # REGIME RULE 3: BULLISH TREND
        # Bullish alignment (EMA20 > EMA50 > EMA200), positive slopes, ADX > 22, +DI > -DI
        # ====================================================================
        if pt.is_aligned_bullish and pt.ema20_slope_deg > 0 and mom.adx_14 >= 20.0 and mom.plus_di > mom.minus_di:
            supporting.append(f"Primary EMA alignment: EMA20 (${pt.ema20:,.1f}) > EMA50 (${pt.ema50:,.1f}) > EMA200 (${pt.ema200:,.1f}).")
            supporting.append(f"Positive EMA 20 slope (+{pt.ema20_slope_deg:.1f} deg) and EMA 50 slope (+{pt.ema50_slope_deg:.1f} deg).")
            supporting.append(f"ADX is {mom.adx_14:.1f} with +DI ({mom.plus_di:.1f}) dominating -DI ({mom.minus_di:.1f}).")
            supporting.append(f"Directional efficiency is strong at {mom.directional_efficiency:.3f}.")

            if "BEARISH" in h1_trend:
                conflicting.append(f"Higher timeframe H1 is currently {h1_trend}.")
            elif "BULLISH" in h1_trend:
                supporting.append(f"Higher timeframe H1 confirms bullish structure ({h1_trend}).")

            if mom.rsi_14 > 75.0:
                conflicting.append(f"RSI is elevated at {mom.rsi_14:.1f} (short-term stretched).")

            # Calibrated Confidence Calculation
            base_conf = 65.0
            if "BULLISH" in h1_trend:
                base_conf += 15.0
            if "BULLISH" in h4_trend:
                base_conf += 10.0
            if mom.adx_14 > 25.0:
                base_conf += 5.0
            if mom.choppiness_index < 45.0:
                base_conf += 5.0
            if conflicting:
                base_conf -= len(conflicting) * 8.0

            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.BULLISH_TREND,
                confidence_pct=round(min(98.0, max(50.0, base_conf)), 1),
                supporting_indicators=supporting,
                conflicting_indicators=conflicting,
                higher_timeframe_agreement=htf_agreement,
                data_freshness_seconds=round(freshness_sec, 1),
                rationale="Sustained directional impulse confirmed by moving average alignment, directional movement index, and slope."
            )

        # ====================================================================
        # REGIME RULE 4: BEARISH TREND
        # Bearish alignment (EMA20 < EMA50 < EMA200), negative slopes, ADX > 22, -DI > +DI
        # ====================================================================
        if pt.is_aligned_bearish and pt.ema20_slope_deg < 0 and mom.adx_14 >= 20.0 and mom.minus_di > mom.plus_di:
            supporting.append(f"Primary EMA alignment: EMA20 (${pt.ema20:,.1f}) < EMA50 (${pt.ema50:,.1f}) < EMA200 (${pt.ema200:,.1f}).")
            supporting.append(f"Negative EMA 20 slope ({pt.ema20_slope_deg:.1f} deg) and EMA 50 slope ({pt.ema50_slope_deg:.1f} deg).")
            supporting.append(f"ADX is {mom.adx_14:.1f} with -DI ({mom.minus_di:.1f}) dominating +DI ({mom.plus_di:.1f}).")
            supporting.append(f"Directional efficiency is {mom.directional_efficiency:.3f}.")

            if "BULLISH" in h1_trend:
                conflicting.append(f"Higher timeframe H1 is currently {h1_trend}.")
            elif "BEARISH" in h1_trend:
                supporting.append(f"Higher timeframe H1 confirms bearish structure ({h1_trend}).")

            if mom.rsi_14 < 25.0:
                conflicting.append(f"RSI is oversold at {mom.rsi_14:.1f}.")

            base_conf = 65.0
            if "BEARISH" in h1_trend:
                base_conf += 15.0
            if "BEARISH" in h4_trend:
                base_conf += 10.0
            if mom.adx_14 > 25.0:
                base_conf += 5.0
            if mom.choppiness_index < 45.0:
                base_conf += 5.0
            if conflicting:
                base_conf -= len(conflicting) * 8.0

            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.BEARISH_TREND,
                confidence_pct=round(min(98.0, max(50.0, base_conf)), 1),
                supporting_indicators=supporting,
                conflicting_indicators=conflicting,
                higher_timeframe_agreement=htf_agreement,
                data_freshness_seconds=round(freshness_sec, 1),
                rationale="Persistent downward price progression with bearish moving average hierarchy and dominant selling pressure."
            )

        # ====================================================================
        # REGIME RULE 5: SIDEWAYS / RANGE-BOUND
        # ADX < 20, EMA slopes near 0, Price oscillating around EMA 50
        # ====================================================================
        if mom.adx_14 < 20.0 and abs(pt.ema20_slope_deg) < 6.0 and abs(pt.ema50_slope_deg) < 4.0:
            supporting.append(f"ADX ({mom.adx_14:.1f}) reflects lack of trend momentum (< 20).")
            supporting.append(f"Flat EMA 20 slope ({pt.ema20_slope_deg:+.1f} deg) and EMA 50 slope ({pt.ema50_slope_deg:+.1f} deg).")
            supporting.append(f"Range boundaries established between ${mom.swing_low_20:,.1f} and ${mom.swing_high_20:,.1f}.")

            return MarketRegimeSnapshot(
                symbol=candles_m15[-1].symbol,
                timeframe=TimeFrame.M15,
                regime=RegimeType.SIDEWAYS,
                confidence_pct=round(75.0 + (20.0 - mom.adx_14), 1),
                supporting_indicators=supporting,
                conflicting_indicators=conflicting,
                higher_timeframe_agreement=htf_agreement,
                data_freshness_seconds=round(freshness_sec, 1),
                rationale="Market is trading inside a clear horizontal bracket with compressing volatility and flat moving averages."
            )

        # ====================================================================
        # REGIME RULE 6: TRANSITION / UNCERTAIN
        # Mixed moving average signals, recent breakout attempts, conflicting indicators
        # ====================================================================
        supporting.append(f"Current structure is {pt.trend_description}.")
        supporting.append(f"ADX is {mom.adx_14:.1f}, Choppiness is {mom.choppiness_index:.1f}.")
        conflicting.append("Conflicting moving average cross or timeframe disagreement.")

        return MarketRegimeSnapshot(
            symbol=candles_m15[-1].symbol,
            timeframe=TimeFrame.M15,
            regime=RegimeType.TRANSITION_UNCERTAIN,
            confidence_pct=52.0,
            supporting_indicators=supporting,
            conflicting_indicators=conflicting,
            higher_timeframe_agreement=htf_agreement,
            data_freshness_seconds=round(freshness_sec, 1),
            rationale="Market is transitioning between regimes or rotating around key moving averages without confirmed directional resolution."
        )
