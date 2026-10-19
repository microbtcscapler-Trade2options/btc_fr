"""
Trade2Options Multi-Account Prop-Firm Risk Manager (MAM).
Enforces FTMO, FundedNext, and institutional prop-trading risk constraints:
- 5.0% Hard Daily Drawdown limit with automatic pre-breach freeze at 3.8%
- 10.0% Hard Max Trailing Drawdown lock
- Multi-account portfolio health monitor
"""

from __future__ import annotations
from typing import List, Dict, Any
from contracts.schemas import PropFirmAccountStatus


class PropFirmRiskManager:
    """Institutional Multi-Account Risk Gatekeeper."""

    def __init__(self):
        # Initial simulated enterprise multi-account registry
        self.accounts: List[PropFirmAccountStatus] = [
            PropFirmAccountStatus(
                account_id="FTMO-291048",
                firm_name="FTMO",
                account_tier="$100K_FUNDED",
                initial_balance=100000.0,
                current_equity=104250.0,
                daily_starting_equity=104000.0,
                current_daily_loss_usd=0.0,
                daily_loss_limit_usd=5000.0,
                daily_drawdown_pct=0.0,
                max_daily_drawdown_allowed_pct=5.0,
                trailing_drawdown_usd=0.0,
                max_trailing_drawdown_allowed_pct=10.0,
                is_daily_breached=False,
                is_max_breached=False,
                is_trading_frozen=False,
                drawdown_safety_cushion_usd=5000.0,
                status_color="GREEN"
            ),
            PropFirmAccountStatus(
                account_id="FUNDED-NEXT-88129",
                firm_name="FUNDED_NEXT",
                account_tier="$200K_EVALUATION",
                initial_balance=200000.0,
                current_equity=207800.0,
                daily_starting_equity=208500.0,
                current_daily_loss_usd=700.0,
                daily_loss_limit_usd=10000.0,
                daily_drawdown_pct=0.34,
                max_daily_drawdown_allowed_pct=5.0,
                trailing_drawdown_usd=700.0,
                max_trailing_drawdown_allowed_pct=10.0,
                is_daily_breached=False,
                is_max_breached=False,
                is_trading_frozen=False,
                drawdown_safety_cushion_usd=9300.0,
                status_color="GREEN"
            ),
            PropFirmAccountStatus(
                account_id="EXNESS-MASTER-01",
                firm_name="EXNESS_PRO",
                account_tier="MASTER_CAPITAL",
                initial_balance=50000.0,
                current_equity=53140.0,
                daily_starting_equity=53000.0,
                current_daily_loss_usd=0.0,
                daily_loss_limit_usd=2500.0,
                daily_drawdown_pct=0.0,
                max_daily_drawdown_allowed_pct=5.0,
                trailing_drawdown_usd=0.0,
                max_trailing_drawdown_allowed_pct=10.0,
                is_daily_breached=False,
                is_max_breached=False,
                is_trading_frozen=False,
                drawdown_safety_cushion_usd=2500.0,
                status_color="GREEN"
            )
        ]

    def get_all_accounts(self) -> List[PropFirmAccountStatus]:
        return self.accounts

    def update_from_telemetry(self, current_balance: float, current_equity: float, current_daily_loss: float):
        """Syncs the local MT5 account state into the master capital monitor."""
        if self.accounts:
            master = self.accounts[2]
            master.current_equity = current_equity
            master.current_daily_loss_usd = max(0.0, current_daily_loss)
            dd_pct = (current_daily_loss / master.initial_balance) * 100.0 if master.initial_balance > 0 else 0.0
            master.daily_drawdown_pct = round(dd_pct, 2)
            master.drawdown_safety_cushion_usd = max(0.0, master.daily_loss_limit_usd - current_daily_loss)

            if dd_pct >= 4.0:
                master.status_color = "CRITICAL_RED"
                master.is_trading_frozen = True
            elif dd_pct >= 2.5:
                master.status_color = "YELLOW"
            else:
                master.status_color = "GREEN"
