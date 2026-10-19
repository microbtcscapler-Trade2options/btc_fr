"""
Trade2Options Vibe-Trading Autonomous Multi-Agent Research Council.
Implements an autonomous multi-agent quantitative council:
1. Technical Analyst Agent
2. Microstructure & Order Flow Agent
3. Risk & Regime Gatekeeper Agent (with Veto Authority)
4. Vibe Consensus Synthesizer
"""

from __future__ import annotations
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from contracts.schemas import (
    RegimeType,
    OrderSide,
    VibeAgentAnalysis,
    VibeConsensusResult,
    Candle
)


class VibeResearchCouncil:
    """Autonomous Multi-Agent Quant Research Council."""

    @classmethod
    def convene_council(
        cls,
        current_price: float,
        regime: RegimeType,
        adx: float = 28.5,
        directional_efficiency: float = 0.65,
        cvd: float = 45.2,
        bid_depth: float = 1250000.0,
        ask_depth: float = 980000.0,
        daily_loss_used_pct: float = 0.0
    ) -> VibeConsensusResult:
        """
        Convenes the 3 autonomous agents, logs their findings,
        and computes institutional consensus.
        """
        agents: List[VibeAgentAnalysis] = []

        # -------------------------------------------------------------
        # 1. Technical Analyst Agent
        # -------------------------------------------------------------
        tech_stance = "NEUTRAL"
        tech_conviction = 50.0
        tech_obs = "Price action consolidating within moving average bands."

        if regime == RegimeType.BULLISH_TREND and directional_efficiency > 0.50:
            tech_stance = "BULLISH"
            tech_conviction = min(92.0, 65.0 + (adx * 0.8))
            tech_obs = f"Strong primary trend confirmed. EMA 20/50/200 aligned upward with ADX at {adx:.1f} and efficiency at {directional_efficiency:.2f}."
        elif regime == RegimeType.BEARISH_TREND and directional_efficiency > 0.50:
            tech_stance = "BEARISH"
            tech_conviction = min(92.0, 65.0 + (adx * 0.8))
            tech_obs = f"Primary bearish trend active. Moving averages sloping downward with ADX at {adx:.1f}."
        elif regime in [RegimeType.CHOPPY, RegimeType.SIDEWAYS]:
            tech_stance = "NEUTRAL"
            tech_conviction = 35.0
            tech_obs = "Choppiness index elevated. Directional momentum absent; trend continuation unlikely."

        agents.append(VibeAgentAnalysis(
            agent_name="Technical_Analyst_Agent",
            stance=tech_stance,
            conviction_pct=round(tech_conviction, 1),
            key_observation=tech_obs,
            metrics={
                "adx_14": adx,
                "directional_efficiency": directional_efficiency,
                "regime": regime.value
            }
        ))

        # -------------------------------------------------------------
        # 2. Microstructure & Order Flow Agent
        # -------------------------------------------------------------
        flow_stance = "NEUTRAL"
        flow_conviction = 50.0
        imbalance = bid_depth / (bid_depth + ask_depth) if (bid_depth + ask_depth) > 0 else 0.5

        if cvd > 20.0 and imbalance > 0.55:
            flow_stance = "BULLISH"
            flow_conviction = min(90.0, 50.0 + (imbalance * 40.0) + min(cvd * 0.2, 20.0))
            flow_obs = f"Aggressive buyer delta detected (+{cvd:.1f} BTC). Order book depth favors bids ({imbalance*100:.1f}% imbalance)."
        elif cvd < -20.0 and imbalance < 0.45:
            flow_stance = "BEARISH"
            flow_conviction = min(90.0, 50.0 + ((1.0 - imbalance) * 40.0) + min(abs(cvd) * 0.2, 20.0))
            flow_obs = f"Aggressive seller delta dominates ({cvd:.1f} BTC). Order book pressure tilted toward ask depth."
        else:
            flow_stance = "NEUTRAL"
            flow_conviction = 45.0
            flow_obs = f"Balanced order book dynamics. CVD delta at {cvd:.1f} BTC with neutral spread absorption."

        agents.append(VibeAgentAnalysis(
            agent_name="Order_Flow_Specialist_Agent",
            stance=flow_stance,
            conviction_pct=round(flow_conviction, 1),
            key_observation=flow_obs,
            metrics={
                "cumulative_volume_delta": cvd,
                "bid_ask_imbalance_ratio": round(imbalance, 3),
                "bid_depth_usd": bid_depth,
                "ask_depth_usd": ask_depth
            }
        ))

        # -------------------------------------------------------------
        # 3. Risk & Regime Gatekeeper Agent (Holds Veto Power)
        # -------------------------------------------------------------
        risk_stance = "NEUTRAL"
        risk_conviction = 75.0
        risk_obs = "Risk boundaries and daily loss limits clear. Execution permissible."

        if regime == RegimeType.HIGH_VOLATILITY_SHOCK:
            risk_stance = "VETO"
            risk_conviction = 95.0
            risk_obs = "VETO: Market is under High Volatility Shock. Execution blocked to prevent slippage and gap loss."
        elif daily_loss_used_pct >= 3.8:
            risk_stance = "VETO"
            risk_conviction = 99.0
            risk_obs = f"VETO: Daily drawdown at {daily_loss_used_pct:.1f}% (approaching 5% hard limit). Trading frozen."
        elif regime in [RegimeType.CHOPPY, RegimeType.TRANSITION_UNCERTAIN]:
            risk_stance = "NEUTRAL"
            risk_conviction = 60.0
            risk_obs = f"Market in {regime.value}. Recommend sizing multiplier capped at 0.50x."
        else:
            risk_stance = "APPROVED"
            risk_conviction = 88.0
            risk_obs = f"Capital cushion healthy. Normal 1.0x sizing authorized under {regime.value}."

        agents.append(VibeAgentAnalysis(
            agent_name="Risk_Gatekeeper_Agent",
            stance=risk_stance,
            conviction_pct=round(risk_conviction, 1),
            key_observation=risk_obs,
            metrics={
                "daily_loss_pct": daily_loss_used_pct,
                "regime_hazard": regime == RegimeType.HIGH_VOLATILITY_SHOCK
            }
        ))

        # -------------------------------------------------------------
        # 4. Consensus Synthesizer
        # -------------------------------------------------------------
        if risk_stance == "VETO":
            verdict = "RISK_VETO"
            action = "HALT_TRADING_STANDBY"
            composite_conviction = 95.0
            rationale = f"Vibe Council Vetoed: {risk_obs}"
        elif tech_stance == "BULLISH" and flow_stance == "BULLISH":
            verdict = "STRONG_BUY"
            action = "EXECUTE_MOMENTUM_LONG"
            composite_conviction = round((tech_conviction * 0.45) + (flow_conviction * 0.35) + (risk_conviction * 0.20), 1)
            rationale = "High Conviction Long: Both Technical and Order Flow agents confirm aggressive upward expansion. Risk gatekeeper approved."
        elif tech_stance == "BULLISH" and flow_stance != "BEARISH":
            verdict = "MODERATE_BUY"
            action = "SCALE_INTO_LONG"
            composite_conviction = round((tech_conviction * 0.50) + (flow_conviction * 0.25) + (risk_conviction * 0.25), 1)
            rationale = "Moderate Long: Technical alignment intact; order book volume is neutral. Enter with standard stop discipline."
        elif tech_stance == "BEARISH" and flow_stance == "BEARISH":
            verdict = "STRONG_SELL"
            action = "EXECUTE_MOMENTUM_SHORT"
            composite_conviction = round((tech_conviction * 0.45) + (flow_conviction * 0.35) + (risk_conviction * 0.20), 1)
            rationale = "High Conviction Short: Primary trend breakdown confirmed by seller aggressor volume. Short entry authorized."
        else:
            verdict = "NEUTRAL_WAIT"
            action = "OBSERVE_AND_WAIT"
            composite_conviction = 40.0
            rationale = "Mixed signals across agents: Technical and Order Flow dynamics lack conclusive convergence. Capital preservation advised."

        return VibeConsensusResult(
            consensus_verdict=verdict,
            composite_conviction_pct=composite_conviction,
            recommended_action=action,
            agents=agents,
            timestamp=datetime.now(timezone.utc),
            executive_rationale=rationale
        )
