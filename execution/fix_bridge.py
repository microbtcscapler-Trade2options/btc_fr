"""
Trade2Options FIX 4.4 Protocol Execution Bridge.
Generates institutional Financial Information eXchange (FIX) 4.4 tag-value messages
for institutional prime brokerage execution (FalconX, Coinbase Prime, LMAX).
"""

from __future__ import annotations
import time
from typing import Dict, Any
from datetime import datetime, timezone


class FIX44Bridge:
    """Institutional FIX 4.4 Message Constructor and Parser."""

    SOH = "\x01"  # Standard FIX Start of Header delimiter

    def __init__(self, sender_comp_id: str = "TRADE2OPTIONS", target_comp_id: str = "PRIME_BROKER"):
        self.sender_comp_id = sender_comp_id
        self.target_comp_id = target_comp_id
        self.seq_num = 1

    def _compute_checksum(self, message: str) -> str:
        """Computes modulo 256 checksum for FIX message."""
        total = sum(ord(c) for c in message) % 256
        return f"{total:03d}"

    def build_new_order_single(
        self,
        cl_ord_id: str,
        symbol: str,
        side: int,  # 1=Buy, 2=Sell
        order_qty: float,
        price: float,
        ord_type: int = 2  # 2=Limit, 1=Market
    ) -> str:
        """Constructs a NewOrderSingle (35=D) message."""
        transact_time = datetime.now(timezone.utc).strftime("%Y%m%d-%H:%M:%S.%f")[:-3]

        body = (
            f"35=D{self.SOH}"
            f"49={self.sender_comp_id}{self.SOH}"
            f"56={self.target_comp_id}{self.SOH}"
            f"34={self.seq_num}{self.SOH}"
            f"52={transact_time}{self.SOH}"
            f"11={cl_ord_id}{self.SOH}"
            f"55={symbol}{self.SOH}"
            f"54={side}{self.SOH}"
            f"60={transact_time}{self.SOH}"
            f"38={order_qty}{self.SOH}"
            f"40={ord_type}{self.SOH}"
            f"44={price}{self.SOH}"
            f"59=0{self.SOH}"  # TimeInForce = Day
        )
        self.seq_num += 1

        body_len = len(body)
        header = f"8=FIX.4.4{self.SOH}9={body_len}{self.SOH}"
        raw_msg = header + body
        checksum = self._compute_checksum(raw_msg)
        return raw_msg + f"10={checksum}{self.SOH}"
