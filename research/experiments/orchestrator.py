"""
Trade2Options Research Orchestrator.
Coordinates backtest experiments, feature ablations, model benchmarks,
and experiment artifact persistence.
"""

from __future__ import annotations
import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from contracts.schemas import (
    BacktestResult,
    ResearchExperiment,
    TimeFrame,
    IntegrationHealth
)
from research.data.service import MarketDataService
from research.experiments.backtester import DeterministicBacktester
from research.adapters.kronos_adapter import KronosResearchAdapter
from research.adapters.vibe_adapter import VibeTradingAdapter
from research.adapters.tradingview_adapter import TradingViewMcpAdapter
from research.adapters.toric_adapter import ToricResearchAdapter

logger = logging.getLogger("Trade2Options.Research.Orchestrator")


class ResearchOrchestrator:
    def __init__(self, artifacts_dir: Optional[str] = None, data_service: Optional[MarketDataService] = None):
        if artifacts_dir is None:
            self.artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "artifacts"))
        else:
            self.artifacts_dir = artifacts_dir

        os.makedirs(self.artifacts_dir, exist_ok=True)
        self.data_service = data_service or MarketDataService()

        # Initialize adapters
        self.kronos_adapter = KronosResearchAdapter()
        self.vibe_adapter = VibeTradingAdapter()
        self.tv_adapter = TradingViewMcpAdapter()
        self.toric_adapter = ToricResearchAdapter()

        self._experiment_cache: Dict[str, BacktestResult] = {}

    def get_all_integration_health(self) -> List[IntegrationHealth]:
        """Queries health status across all research adapters."""
        return [
            self.kronos_adapter.check_health(),
            self.vibe_adapter.check_health(),
            self.tv_adapter.check_health(),
            self.toric_adapter.check_health()
        ]

    def run_strategy_comparison(
        self,
        symbol: str = "BTCUSDT",
        timeframe: TimeFrame = TimeFrame.M15
    ) -> Dict[str, BacktestResult]:
        """
        Runs institutional comparison across candidate configurations:
        1. Baseline: Pure Primary EMA 20/50/200 Trend without filters
        2. Candidate A: Primary Trend + Regime Engine Filter (Blocks Choppy/Shock regimes)
        3. Candidate B: Primary Trend + Regime Engine + Advisory EMA 9/21 Timing Filter
        """
        snapshot = self.data_service.get_market_data(symbol=symbol, timeframe=timeframe, limit=250, force_refresh=False)
        if not snapshot.is_data_available or snapshot.candles_count < 80:
            raise RuntimeError(f"Insufficient market data to conduct backtest: {snapshot.error_message}")

        backtester = DeterministicBacktester(
            initial_balance_usd=10000.0,
            fixed_lot_btc=0.1,
            spread_usd=15.0,
            slippage_usd=10.0,
            commission_pct=0.0004
        )

        results = {}

        # 1. Baseline
        res_baseline = backtester.run(
            candles=snapshot.candles,
            use_regime_filter=False,
            use_advisory_filter=False
        )
        res_baseline.strategy_name = "Baseline_Primary_EMA20_50_200"
        results["Baseline"] = res_baseline

        # 2. Candidate A: Regime Filtered
        res_cand_a = backtester.run(
            candles=snapshot.candles,
            use_regime_filter=True,
            use_advisory_filter=False
        )
        res_cand_a.strategy_name = "CandidateA_Regime_Filtered"
        results["Candidate_A"] = res_cand_a

        # 3. Candidate B: Full Stack (Regime + Advisory)
        res_cand_b = backtester.run(
            candles=snapshot.candles,
            use_regime_filter=True,
            use_advisory_filter=True
        )
        res_cand_b.strategy_name = "CandidateB_Regime_Plus_Advisory"
        results["Candidate_B"] = res_cand_b

        # Save artifacts
        for name, res in results.items():
            self._experiment_cache[res.experiment_id] = res
            artifact_file = os.path.join(self.artifacts_dir, f"{res.experiment_id}_{name}.json")
            try:
                with open(artifact_file, "w") as f:
                    json.dump(res.dict(), f, indent=2, default=str)
            except Exception as e:
                logger.error(f"Failed to persist experiment artifact: {e}")

        return results
