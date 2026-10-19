"""
Trade2Options Deterministic Technical Indicators & Momentum Engine.
Implements exact, reference-grade calculations for:
- Layer A: EMA 20/50/200 Primary Trend Framework
- Layer B: EMA 9/21/200 Entry Timing Framework (Advisory)
- Momentum features: ROC, RSI, ADX, +DI/-DI, ATR, ATR Percentile, Choppiness Index,
  Kaufman Directional Efficiency, Relative Volume, Swing Highs/Lows.
"""

from __future__ import annotations
import math
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
import pandas as pd

from contracts.schemas import (
    TimeFrame,
    Candle,
    PrimaryTrendSnapshot,
    EntryTimingAssessment,
    EntryTimingRating,
    MomentumFeatures,
    IndicatorSnapshot
)
from research.data.canonical import CandleValidator


def calculate_ema(series: pd.Series, span: int) -> pd.Series:
    """Calculates Exponential Moving Average with standard alpha = 2 / (span + 1)."""
    return series.ewm(span=span, adjust=False).mean()


def calculate_slope_degrees(series: pd.Series, lookback: int = 5, price_norm: float = 1.0) -> float:
    """
    Calculates angle of slope in normalized degrees (-90 to +90).
    Normalizes price delta by current price level and bar distance.
    """
    if len(series) < lookback + 1:
        return 0.0
    val_now = series.iloc[-1]
    val_prev = series.iloc[-1 - lookback]
    if price_norm <= 0:
        price_norm = val_now if val_now > 0 else 1.0
    pct_change_per_bar = ((val_now - val_prev) / price_norm) / lookback * 100.0
    # Map to degrees using atan
    angle_rad = math.atan(pct_change_per_bar * 10.0)  # Scaling factor for readable angle
    return math.degrees(angle_rad)


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Wilder's smoothed Relative Strength Index."""
    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)

    avg_gain = gain.ewm(alpha=1.0 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0.0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.fillna(50.0)


def calculate_atr(df: pd.DataFrame, period: int = 14) -> Tuple[pd.Series, pd.Series]:
    """Calculates True Range and Wilder's Average True Range (ATR)."""
    high = df["high"]
    low = df["low"]
    prev_close = df["close"].shift(1)

    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1.0 / period, adjust=False).mean()
    return tr, atr


def calculate_adx(df: pd.DataFrame, period: int = 14) -> Tuple[pd.Series, pd.Series, pd.Series]:
    """Calculates ADX, +DI, and -DI using standard Wilder smoothing."""
    high = df["high"]
    low = df["low"]
    prev_high = high.shift(1)
    prev_low = low.shift(1)

    up_move = high - prev_high
    down_move = prev_low - low

    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)

    _, atr = calculate_atr(df, period)
    atr_safe = atr.replace(0.0, np.nan)

    plus_di = 100.0 * (pd.Series(plus_dm, index=df.index).ewm(alpha=1.0 / period, adjust=False).mean() / atr_safe)
    minus_di = 100.0 * (pd.Series(minus_dm, index=df.index).ewm(alpha=1.0 / period, adjust=False).mean() / atr_safe)

    di_sum = (plus_di + minus_di).replace(0.0, np.nan)
    dx = 100.0 * ((plus_di - minus_di).abs() / di_sum)
    adx = dx.ewm(alpha=1.0 / period, adjust=False).mean()

    return adx.fillna(20.0), plus_di.fillna(20.0), minus_di.fillna(20.0)


def calculate_choppiness_index(df: pd.DataFrame, period: int = 14) -> float:
    """
    Choppiness Index (CI):
    CI = 100 * LOG10( SUM(ATR(1), n) / (MaxHigh(n) - MinLow(n)) ) / LOG10(n)
    Values > 61.8 indicate consolidation/chop. Values < 38.2 indicate strong trend.
    """
    if len(df) < period + 1:
        return 50.0

    tr, _ = calculate_atr(df, period=1)
    sum_tr = tr.iloc[-period:].sum()
    highest_high = df["high"].iloc[-period:].max()
    lowest_low = df["low"].iloc[-period:].min()
    diff = highest_high - lowest_low

    if diff <= 0 or sum_tr <= 0:
        return 50.0

    ci = 100.0 * (math.log10(sum_tr / diff) / math.log10(period))
    return float(np.clip(ci, 0.0, 100.0))


def calculate_directional_efficiency(df: pd.DataFrame, period: int = 14) -> float:
    """
    Kaufman Efficiency Ratio (ER):
    ER = |Close - Close_n| / SUM(|Close_i - Close_i-1|)
    Values close to 1.0 indicate smooth directional trend; near 0 indicates noisy chop.
    """
    if len(df) < period + 1:
        return 0.5
    closes = df["close"].iloc[-period - 1:]
    net_change = abs(closes.iloc[-1] - closes.iloc[0])
    total_travel = closes.diff().abs().iloc[1:].sum()
    if total_travel <= 0:
        return 0.0
    return float(np.clip(net_change / total_travel, 0.0, 1.0))


class IndicatorEngine:
    """Unified engine producing Layer A (Primary Trend), Layer B (Advisory Entry), and Momentum."""

    @classmethod
    def compute_all(cls, candles: List[Candle], timeframe: TimeFrame) -> Optional[IndicatorSnapshot]:
        if len(candles) < 50:
            return None

        df = CandleValidator.to_dataframe(candles)
        close = df["close"]
        high = df["high"]
        low = df["low"]
        vol = df["volume"]
        current_close = float(close.iloc[-1])

        # ----------------------------------------------------
        # 1. EMAs Calculation
        # ----------------------------------------------------
        ema9 = calculate_ema(close, 9)
        ema20 = calculate_ema(close, 20)
        ema21 = calculate_ema(close, 21)
        ema50 = calculate_ema(close, 50)
        ema200 = calculate_ema(close, 200)

        val_ema9 = float(ema9.iloc[-1])
        val_ema20 = float(ema20.iloc[-1])
        val_ema21 = float(ema21.iloc[-1])
        val_ema50 = float(ema50.iloc[-1])
        val_ema200 = float(ema200.iloc[-1]) if len(close) >= 200 else float(ema50.iloc[-1])

        # ----------------------------------------------------
        # 2. Layer A: Primary Trend (EMA 20/50/200)
        # ----------------------------------------------------
        slope20 = calculate_slope_degrees(ema20, 5, current_close)
        slope50 = calculate_slope_degrees(ema50, 10, current_close)
        slope200 = calculate_slope_degrees(ema200, 20, current_close) if len(close) >= 200 else 0.0

        is_bullish_aligned = (val_ema20 > val_ema50) and (val_ema50 > val_ema200) and (current_close > val_ema20)
        is_bearish_aligned = (val_ema20 < val_ema50) and (val_ema50 < val_ema200) and (current_close < val_ema20)

        price_to_ema200_pct = ((current_close - val_ema200) / val_ema200) * 100.0 if val_ema200 > 0 else 0.0

        if is_bullish_aligned and slope20 > 5 and slope50 > 2:
            trend_desc = "STRONG_BULLISH_TREND"
        elif is_bearish_aligned and slope20 < -5 and slope50 < -2:
            trend_desc = "STRONG_BEARISH_TREND"
        elif current_close > val_ema200 and val_ema20 > val_ema50:
            trend_desc = "MODERATE_BULLISH"
        elif current_close < val_ema200 and val_ema20 < val_ema50:
            trend_desc = "MODERATE_BEARISH"
        else:
            trend_desc = "MIXED_OR_CONSOLIDATION"

        primary_trend = PrimaryTrendSnapshot(
            timeframe=timeframe,
            ema20=round(val_ema20, 2),
            ema50=round(val_ema50, 2),
            ema200=round(val_ema200, 2),
            price_to_ema200_pct=round(price_to_ema200_pct, 2),
            ema20_slope_deg=round(slope20, 1),
            ema50_slope_deg=round(slope50, 1),
            ema200_slope_deg=round(slope200, 1),
            is_aligned_bullish=is_bullish_aligned,
            is_aligned_bearish=is_bearish_aligned,
            trend_description=trend_desc
        )

        # ----------------------------------------------------
        # 3. Momentum & Volatility
        # ----------------------------------------------------
        _, atr_series = calculate_atr(df, 14)
        current_atr = float(atr_series.iloc[-1]) if len(atr_series) else 100.0

        # ATR Percentile across last 100 bars
        atr_window = atr_series.iloc[-100:] if len(atr_series) >= 100 else atr_series
        atr_pctile = float((atr_window < current_atr).mean() * 100.0)

        adx_series, plus_di_series, minus_di_series = calculate_adx(df, 14)
        current_adx = float(adx_series.iloc[-1])
        current_plus_di = float(plus_di_series.iloc[-1])
        current_minus_di = float(minus_di_series.iloc[-1])

        rsi_series = calculate_rsi(close, 14)
        current_rsi = float(rsi_series.iloc[-1])

        # ROC 14
        roc_14 = float(((close.iloc[-1] - close.iloc[-15]) / close.iloc[-15]) * 100.0) if len(close) >= 15 else 0.0

        # Relative Volume (Current volume / 20-bar SMA of volume)
        vol_sma20 = vol.rolling(20).mean().iloc[-1]
        rel_vol = float(vol.iloc[-1] / vol_sma20) if vol_sma20 > 0 else 1.0

        chop_index = calculate_choppiness_index(df, 14)
        dir_eff = calculate_directional_efficiency(df, 14)

        swing_h = float(high.iloc[-20:].max()) if len(high) >= 20 else current_close
        swing_l = float(low.iloc[-20:].min()) if len(low) >= 20 else current_close

        momentum = MomentumFeatures(
            roc_14=round(roc_14, 2),
            rsi_14=round(current_rsi, 2),
            adx_14=round(current_adx, 2),
            plus_di=round(current_plus_di, 2),
            minus_di=round(current_minus_di, 2),
            atr_14=round(current_atr, 2),
            atr_percentile_100=round(atr_pctile, 1),
            relative_volume=round(rel_vol, 2),
            choppiness_index=round(chop_index, 1),
            directional_efficiency=round(dir_eff, 3),
            swing_high_20=round(swing_h, 2),
            swing_low_20=round(swing_l, 2)
        )

        # ----------------------------------------------------
        # 4. Layer B: Entry Timing (EMA 9/21/200) - ADVISORY ONLY
        # ----------------------------------------------------
        ema9_above_ema21 = val_ema9 > val_ema21

        # Calculate crossover age (number of bars since EMA9 and EMA21 crossed)
        crossover_diff = ema9 - ema21
        crossings = np.where(np.diff(np.sign(crossover_diff)) != 0)[0]
        crossover_age = int(len(close) - 1 - crossings[-1]) if len(crossings) > 0 else 50

        price_vs_ema9_pct = ((current_close - val_ema9) / val_ema9) * 100.0 if val_ema9 > 0 else 0.0
        pullback_depth = abs(current_close - val_ema21) / current_atr if current_atr > 0 else 0.0

        # Deterministic Factor Breakdown for Entry Timing Score (0 to 100)
        # Factors: Alignment (25), Crossover Freshness (20), Pullback Quality (20), Slope (20), Volume (15)
        factors: Dict[str, float] = {}

        # 1. Alignment with Primary Trend
        agreement_with_primary = (
            (is_bullish_aligned and ema9_above_ema21) or
            (is_bearish_aligned and not ema9_above_ema21)
        )
        factors["primary_trend_alignment"] = 25.0 if agreement_with_primary else (10.0 if trend_desc != "MIXED_OR_CONSOLIDATION" else 0.0)

        # 2. Crossover Freshness (ideal is between 1 and 8 bars ago)
        if 1 <= crossover_age <= 8:
            factors["crossover_freshness"] = 20.0
        elif 9 <= crossover_age <= 20:
            factors["crossover_freshness"] = 12.0
        else:
            factors["crossover_freshness"] = 5.0

        # 3. Pullback Quality (Pullback within 0.5 to 1.5 ATR of EMA21)
        if 0.2 <= pullback_depth <= 1.5:
            factors["pullback_discipline"] = 20.0
        elif pullback_depth < 0.2:
            factors["pullback_discipline"] = 14.0  # Near retest
        else:
            factors["pullback_discipline"] = 5.0   # Extended/Overbought/Oversold

        # 4. Short-term Slope
        slope9 = calculate_slope_degrees(ema9, 3, current_close)
        if (ema9_above_ema21 and slope9 > 10) or (not ema9_above_ema21 and slope9 < -10):
            factors["momentum_slope"] = 20.0
        elif abs(slope9) > 5:
            factors["momentum_slope"] = 12.0
        else:
            factors["momentum_slope"] = 4.0

        # 5. Volume Confirmation
        factors["volume_expansion"] = 15.0 if rel_vol >= 1.2 else (10.0 if rel_vol >= 0.9 else 4.0)

        # Penalize if market is excessively choppy (CI > 61.8)
        if chop_index > 61.8:
            factors["choppiness_penalty"] = -15.0

        raw_score = sum(factors.values())
        final_score = float(np.clip(raw_score, 0.0, 100.0))

        if final_score >= 80.0 and agreement_with_primary:
            rating = EntryTimingRating.FAVORABLE
        elif final_score >= 60.0:
            rating = EntryTimingRating.IMPROVING
        elif not agreement_with_primary and final_score >= 50.0:
            rating = EntryTimingRating.CONFLICTING
        elif final_score >= 40.0:
            rating = EntryTimingRating.NEUTRAL
        else:
            rating = EntryTimingRating.WEAKENING

        entry_timing = EntryTimingAssessment(
            timeframe=timeframe,
            ema9=round(val_ema9, 2),
            ema21=round(val_ema21, 2),
            ema200=round(val_ema200, 2),
            ema9_above_ema21=ema9_above_ema21,
            crossover_age_bars=crossover_age,
            price_vs_ema9_pct=round(price_vs_ema9_pct, 2),
            pullback_depth_atr=round(pullback_depth, 2),
            score=round(final_score, 1),
            rating=rating,
            factor_breakdown={k: round(v, 1) for k, v in factors.items()},
            agreement_with_primary_trend=agreement_with_primary
        )

        return IndicatorSnapshot(
            symbol=candles[-1].symbol,
            timeframe=timeframe,
            primary_trend=primary_trend,
            entry_timing=entry_timing,
            momentum=momentum
        )
