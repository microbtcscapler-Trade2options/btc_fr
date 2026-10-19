"""
Trade2Options Systematic Covered Call (Yield Harvesting) Desk.
When momentum stagnates or market enters SIDEWAYS / CHOPPY regimes,
this engine identifies high-probability Out-of-the-Money Call sales (10-15 Delta)
to monetize time decay (Theta) and enhance annualized strategy returns.
"""

from __future__ import annotations
from typing import Optional
from datetime import datetime, timezone, timedelta

from contracts.schemas import (
    RegimeType,
    CoveredCallPlan
)


class CoveredCallEngine:
    """Institutional Yield Harvesting & Covered Call Overlay Engine."""

    @staticmethod
    def evaluate_yield_harvest(
        regime: RegimeType,
        spot_price: float,
        spot_volume_btc: float = 0.10,
        position_ticket: Optional[int] = 89217431
    ) -> CoveredCallPlan:
        """
        Evaluates theta decay yield opportunities during non-trending regimes.
        """
        is_yield_regime = regime in [RegimeType.SIDEWAYS, RegimeType.CHOPPY]

        if spot_volume_btc <= 0.0:
            return CoveredCallPlan(
                status="NO_LONG_INVENTORY",
                symbol="BTC",
                spot_position_volume=0.0,
                regime_trigger=regime,
                recommended_call_contract="NONE",
                call_strike=0.0,
                expiration_date="N/A",
                call_delta=0.0,
                estimated_yield_usd=0.0,
                annualized_yield_pct=0.0,
                upside_cushion_pct=0.0,
                rationale="No long inventory held. Selling calls naked is prohibited by institutional risk policy."
            )

        # Target 12-Delta OTM Call (roughly 6-8% above spot, 7 days out)
        target_strike = round((spot_price * 1.07) / 1000.0) * 1000
        expiry_date = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%d%b%y").upper()
        contract_name = f"BTC-{expiry_date}-{int(target_strike)}-C"

        call_delta = 0.12
        # 7-day 12-delta call premium ~ 0.55% of spot
        est_premium_per_btc = spot_price * 0.0055
        est_yield_usd = round(est_premium_per_btc * spot_volume_btc, 2)
        annualized_yield_pct = round((est_premium_per_btc / spot_price) * (365.0 / 7.0) * 100.0, 2)
        upside_cushion = round(((target_strike - spot_price) / spot_price) * 100.0, 2)

        if is_yield_regime:
            status = "HARVEST_RECOMMENDED"
            rationale = (
                f"Regime [{regime.value}] detected. Directional momentum has flattened. "
                f"Recommend selling {spot_volume_btc}x {contract_name} with {upside_cushion}% upside cushion. "
                f"Collects ${est_yield_usd} in 7-day theta decay ({annualized_yield_pct}% annualized yield)."
            )
        else:
            status = "HOLD_OFF_TRENDING"
            rationale = (
                f"Regime [{regime.value}] is actively directional. Do NOT cap upside with short calls. "
                "Let momentum run to target."
            )

        return CoveredCallPlan(
            status=status,
            symbol="BTC",
            spot_position_volume=spot_volume_btc,
            regime_trigger=regime,
            recommended_call_contract=contract_name,
            call_strike=float(target_strike),
            expiration_date=expiry_date,
            call_delta=call_delta,
            estimated_yield_usd=est_yield_usd,
            annualized_yield_pct=annualized_yield_pct,
            upside_cushion_pct=upside_cushion,
            rationale=rationale
        )
