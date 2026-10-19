"""
Trade2Options Kronos Forecasting Validation & Baseline Benchmark Runner.
Compares Kronos multi-horizon predictions against:
1. Last-Close Persistence
2. Historical Drift
3. Technical Trend Model
Measures MAE, directional accuracy, and economic significance after fees.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contracts.schemas import TimeFrame
from research.data.service import MarketDataService
from research.adapters.kronos_adapter import KronosResearchAdapter
from research.experiments.orchestrator import ResearchOrchestrator


def main():
    print("==================================================================")
    print("   TRADE2OPTIONS KRONOS INSTITUTIONAL FORECASTING EVALUATION       ")
    print("==================================================================")

    data_service = MarketDataService()
    print("1. Ingesting Bitcoin Market Data...")
    snapshot = data_service.get_market_data(symbol="BTCUSDT", timeframe=TimeFrame.M15, limit=300)

    if not snapshot.is_data_available or snapshot.candles_count < 50:
        print(f"[ERROR] Insufficient data: {snapshot.error_message}")
        sys.exit(1)

    print(f"   Loaded {snapshot.candles_count} validated bars from {snapshot.source}.")
    print(f"   Latest Close: ${snapshot.latest_candle.close:,.2f}")

    print("\n2. Initializing Kronos Research Adapter...")
    adapter = KronosResearchAdapter()
    health = adapter.check_health()
    print(f"   Adapter State: {health.state}")
    print(f"   Message: {health.message}")
    print(f"   Details: {health.details}")

    print("\n3. Running Multi-Horizon Forecast Benchmark (1-bar, 4-bar, 12-bar)...")
    forecast_res = adapter.run_forecast_benchmark(snapshot.candles, horizons=[1, 4, 12])

    print("\n--- FORECAST EVALUATION RESULTS ---")
    print(f"Experiment ID:           {forecast_res.experiment_id}")
    print(f"Model:                   {forecast_res.model_name} (v{forecast_res.model_version})")
    print(f"Validation Status:       {forecast_res.validation_status}")
    print(f"MAE vs Persistence:      ${forecast_res.mae_vs_persistence:.2f}")
    print(f"Directional Accuracy:    {forecast_res.directional_accuracy_pct:.1f}%")

    print("\n--- MULTI-HORIZON PROBABILISTIC TARGETS ---")
    for h_name, h in forecast_res.forecast_horizons.items():
        print(f"\n[{h_name.upper()}] (Horizon: {h.horizon_candles} candles = {h.horizon_candles * 15} mins)")
        print(f"  Target UTC Time:       {h.target_timestamp}")
        print(f"  Predicted Price:       ${h.predicted_close:,.2f} ({h.predicted_change_pct:+.2f}%)")
        print(f"  Expected Volatility:   {h.expected_volatility_pct:.2f}%")
        print(f"  90% Prediction Band:   ${h.interval_90_lower:,.2f} to ${h.interval_90_upper:,.2f}")
        print(f"  Calibrated Confidence: {h.confidence_pct:.1f}%")

    print("\n4. Running Strategy Ablation & Backtest Comparison (Baseline vs Regime vs Advisory)...")
    orchestrator = ResearchOrchestrator()
    comp_results = orchestrator.run_strategy_comparison(symbol="BTCUSDT", timeframe=TimeFrame.M15)

    print("\n--- STRATEGY COMPARISON MATRIX ---")
    header = f"{'Configuration':<35} | {'Net PnL ($)':<12} | {'Win Rate':<10} | {'Profit Factor':<14} | {'Sharpe':<8} | {'Max DD ($)':<10}"
    print(header)
    print("-" * len(header))

    for name, res in comp_results.items():
        m = res.out_of_sample_metrics
        line = f"{name:<35} | ${m.net_profit_usd:<11.2f} | {m.win_rate_pct:<9.1f}% | {m.profit_factor:<14.2f} | {m.sharpe_ratio:<8.2f} | ${m.max_drawdown_usd:<9.2f}"
        print(line)

    print("\n[CONCLUSION] Kronos evaluation complete. Forecasts properly isolated as RESEARCH_ONLY.")


if __name__ == "__main__":
    main()
