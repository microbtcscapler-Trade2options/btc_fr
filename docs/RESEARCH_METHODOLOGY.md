# Trade2Options Research Methodology & Reproducibility Guide

## 1. Zero Lookahead Bias Architecture
To ensure research results are reproducible and credible in live markets:
* **Completed Bars Only:** Calculations for EMA 20/50/200, ROC, RSI, ADX, ATR, and Choppiness Index are executed strictly on closed bars (`is_closed=True`).
* **Order Execution Lag:** In the deterministic backtester, when an entry signal is detected at the close of candle $t$, the fill is simulated at the open of candle $t+1$ with spread and slippage applied.
* **Chronological Splits:** Walk-forward splits divide historical data into In-Sample (70%) and Out-of-Sample (30%) strictly by timestamp. Random cross-validation is prohibited on time-series.

---

## 2. Market Regime Engine Calibration
The Market Regime Engine avoids heuristic guessing by requiring mathematical confluence:
1. **High Volatility Shock:** Triggered when rolling 100-bar ATR percentile $\ge 92\%$. Stops new trend entries.
2. **Choppy / Low Directional Efficiency:** Triggered when Choppiness Index $\ge 60$ or Kaufman Efficiency Ratio $< 0.20$ with ADX $< 20$.
3. **Bullish Trend:** EMA 20 > EMA 50 > EMA 200, positive EMA slopes, ADX $\ge 20$, +DI > -DI. Confirmed by H1/H4 moving averages.
4. **Bearish Trend:** EMA 20 < EMA 50 < EMA 200, negative EMA slopes, ADX $\ge 20$, -DI > +DI. Confirmed by H1/H4 moving averages.
5. **Sideways / Range-Bound:** ADX $< 20$, flat EMA slopes ($|\text{slope}| < 6^\circ$).

---

## 3. Kronos Foundation Model Benchmark
* **Model Evaluated:** Kronos foundation architecture with RevIN normalization.
* **Baseline 1 (Persistence):** Assumes $P_{t+h} = P_t$.
* **Baseline 2 (Historical Drift):** Evaluates rolling 20-bar drift projection.
* **Empirical Findings on Bitcoin M15:**
  * Mean Absolute Error (MAE) vs Persistence: **$78.93**
  * Directional Accuracy: **41.7%** (Sub-random without momentum regime conditioning).
* **Research Policy:** Model outputs are strictly classified as **`RESEARCH_ONLY`** and are prohibited from overriding live EA order execution or broker risk controls.
