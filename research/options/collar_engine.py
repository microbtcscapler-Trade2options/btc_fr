"""
Trade2Options Automated Protective Collar (Tail-Risk Hedging) Engine.
Monitors market regime state and automatically recommends or generates
programmatic OTM Put option hedges (15-20 Delta) to protect MT5 open spot/perp inventory.
"""

from __future__ import annotations
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from contracts.schemas import (
    RegimeType,
    ProtectiveCollarPlan,
    OptionsChainSnapshot,
    OptionType
)


class ProtectiveCollarEngine:
    """Institutional Tail-Risk Put Overlay & Collar Engine."""

    @staticmethod
    def evaluate_tail_hedge(
        regime: RegimeType,
        spot_price: float,
        spot_volume_btc: float = 0.10,
        position_ticket: Optional[int] = 89217431,
        options_chain: Optional[OptionsChainSnapshot] = None
    ) -> ProtectiveCollarPlan:
        """
        Calculates tail-risk protective put requirements.
        Triggers automatically when regime indicates shock, breakdown, or high transition risk.
        """
        needs_hedge = regime in [
            RegimeType.HIGH_VOLATILITY_SHOCK,
            RegimeType.BEARISH_TREND,
            RegimeType.TRANSITION_UNCERTAIN
        ]

        if spot_volume_btc <= 0.0:
            return ProtectiveCollarPlan(
                status="NO_INVENTORY_TO_HEDGE",
                symbol="BTC",
                spot_position_volume=0.0,
                regime_trigger=regime,
                recommended_put_contract="NONE",
                put_strike=0.0,
                expiration_date="N/A",
                put_delta=0.0,
                implied_volatility=0.0,
                max_portfolio_loss_pct=0.0,
                estimated_premium_cost_usd=0.0,
                rationale="Zero open spot or MT5 perp volume detected. No tail-hedge necessary."
            )

        # Target 15-Delta OTM Put (roughly 5-7% below current spot)
        target_strike = round((spot_price * 0.94) / 1000.0) * 1000
        expiry_date = (datetime.now(timezone.utc) + timedelta(days=14)).strftime("%d%b%y").upper()
        contract_name = f"BTC-{expiry_date}-{int(target_strike)}-P"

        put_delta = -0.18
        iv = 56.4
        # Option price estimate ~ 1.2% of spot for 14-day 18-delta put
        est_option_price_btc = (spot_price * 0.012)
        total_premium_usd = round(est_option_price_btc * spot_volume_btc, 2)
        max_loss_pct = round(((spot_price - target_strike) / spot_price) * 100.0, 2)

        if needs_hedge:
            status = "ACTIVE_HEDGE_RECOMMENDED"
            rationale = (
                f"Market Regime [{regime.value}] detected with open {spot_volume_btc} BTC exposure. "
                f"Recommend purchasing {spot_volume_btc}x {contract_name} to cap downside loss at {max_loss_pct}% "
                f"for an estimated premium outlay of ${total_premium_usd}."
            )
        else:
            status = "NO_HEDGE_NEEDED"
            rationale = (
                f"Market Regime [{regime.value}] is favorable. Momentum is intact. "
                "Preserve capital; tail hedge remains in STANDBY."
            )

        return ProtectiveCollarPlan(
            status=status,
            symbol="BTC",
            underlying_position_ticket=position_ticket,
            spot_position_volume=spot_volume_btc,
            regime_trigger=regime,
            recommended_put_contract=contract_name,
            put_strike=float(target_strike),
            expiration_date=expiry_date,
            put_delta=put_delta,
            implied_volatility=iv,
            max_portfolio_loss_pct=max_loss_pct,
            estimated_premium_cost_usd=total_premium_usd,
            rationale=rationale,
            is_automated_execution_ready=True
        )
