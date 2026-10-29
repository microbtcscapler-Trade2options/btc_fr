"""
Trade2Options Discord Webhook Alerting Service.
Dispatches real-time, institutional-grade signal cards and risk alerts to Discord.
Features:
- Rich colored embeds (Green for BUY, Red for SELL, Amber for Regime shifts)
- Multi-layer quantitative reasoning and R:R parameters
- State deduplication with anti-spam cooldowns
- Asynchronous and synchronous dispatching
"""

from __future__ import annotations
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Optional, Dict, Any

log = logging.getLogger("DiscordAlertService")

DEFAULT_WEBHOOK_URL = "https://discord.com/api/webhooks/1561838069135441992/frXmCbuIHQnsIm-5He0Icq_ROrCF_5SiSox2NvwOT0WHPShU0eQWgrPBWYx33drxCMM5"


class DiscordAlertService:
    def __init__(self, webhook_url: str = DEFAULT_WEBHOOK_URL, min_confidence_pct: float = 60.0):
        self.webhook_url = webhook_url
        self.min_confidence_pct = min_confidence_pct
        self.last_dispatched_action: Optional[str] = None
        self.last_dispatched_time: Optional[datetime] = None
        self.cooldown_seconds: float = 300.0  # 5-minute cooldown for identical direction

    def dispatch_payload(self, payload: Dict[str, Any]) -> bool:
        """Sends raw JSON payload to the configured Discord webhook."""
        if not self.webhook_url:
            log.warning("No Discord webhook URL configured.")
            return False

        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.webhook_url,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Trade2Options-Alert-Dispatcher/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=8.0) as resp:
                if resp.status in (200, 204):
                    log.info("Successfully dispatched Discord alert.")
                    return True
                else:
                    log.warning(f"Discord returned status {resp.status}")
                    return False
        except urllib.error.HTTPError as e:
            log.error(f"HTTPError sending to Discord webhook: {e.code} - {e.reason}")
            return False
        except Exception as e:
            log.error(f"Unexpected error sending to Discord webhook: {e}")
            return False

    def send_connection_confirmation(self) -> bool:
        """Dispatches an initial welcome/verification card to verify Discord channel connection."""
        now_iso = datetime.now(timezone.utc).isoformat()
        payload = {
            "username": "Trade2Options Institutional Bot",
            "avatar_url": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
            "embeds": [
                {
                    "title": "⚡ Trade2Options Alert System Connected",
                    "description": (
                        "Your Discord channel is now securely linked to the "
                        "**Trade2Options Bitcoin Momentum Systematic Platform**.\n\n"
                        "Real-time institutional signal cards, high-conviction BUY/SELL setups, "
                        "and risk management triggers will be delivered directly here."
                    ),
                    "color": 0x10B981,  # Emerald Green
                    "fields": [
                        {"name": "🎯 Target Instrument", "value": "`BTC/USDT`", "inline": True},
                        {"name": "📡 System Status", "value": "🟢 `ONLINE & STREAMING`", "inline": True},
                        {"name": "🛡️ Conviction Filter", "value": f"`≥ {self.min_confidence_pct:.1f}% Confidence`", "inline": True},
                        {
                            "name": "📊 6-Layer Quantitative Stack",
                            "value": (
                                "• **Layer 1:** Primary EMA 20/50/200 Trend Alignment\n"
                                "• **Layer 2:** Structural EMA 9/21 Pullback Advisory\n"
                                "• **Layer 3:** Momentum & Volatility Gate (ADX > 22, Chop < 60)\n"
                                "• **Layer 4:** Microstructure & Cumulative Volume Delta (CVD)\n"
                                "• **Layer 5:** Vibe-Trading Autonomous Multi-Agent Council\n"
                                "• **Layer 6:** Triple-Barrier Meta-Labeling Probability & Sizing"
                            ),
                            "inline": False
                        },
                        {
                            "name": "⚙️ Execution Specifications",
                            "value": (
                                "• **Target Risk/Reward:** `1:2.0+ R:R`\n"
                                "• **Protective Stop Loss:** Structural ATR-based dynamic buffer\n"
                                "• **Anti-Spam Filter:** State deduplication & 5-minute cooldown"
                            ),
                            "inline": False
                        }
                    ],
                    "footer": {
                        "text": "Trade2Options Intelligence Engine • Real-Time Alert Dispatcher"
                    },
                    "timestamp": now_iso
                }
            ]
        }
        return self.dispatch_payload(payload)

    def dispatch_signal_card(
        self,
        symbol: str,
        action: str,  # e.g., "STRONG_BUY", "MODERATE_BUY", "BUY", "SELL", "STRONG_SELL", "RISK_VETO", "STANDBY_NEUTRAL"
        confidence_pct: float,
        price: float,
        sl: float,
        tp: float,
        rr: float,
        regime: str,
        reason: str,
        layer_summaries: Optional[list] = None,
        force: bool = False
    ) -> bool:
        """
        Dispatches an institutional signal or market alert card to Discord.
        Enforces confidence thresholds and deduplication unless force=True.
        Supports BUY, SELL, RISK_VETO, and REGIME PULSE actions.
        """
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        clean_action = action.upper().strip()
        is_veto = "VETO" in clean_action or "RISK" in clean_action
        is_buy = ("BUY" in clean_action or "LONG" in clean_action) and not is_veto
        is_sell = ("SELL" in clean_action or "SHORT" in clean_action) and not is_veto

        # Identify candidate direction for vetoed signals
        if is_veto:
            if "BUY" in clean_action or "LONG" in clean_action:
                vetoed_side = "LONG / BUY"
                side_badge = "🟢 LONG / BUY"
                action_display = "RISK VETO (LONG / BUY BLOCKED)"
            elif "SELL" in clean_action or "SHORT" in clean_action:
                vetoed_side = "SHORT / SELL"
                side_badge = "🔴 SHORT / SELL"
                action_display = "RISK VETO (SHORT / SELL BLOCKED)"
            else:
                vetoed_side = "BOTH SIDES (CHOPPY RANGE)"
                side_badge = "⚪ BOTH SIDES"
                action_display = "RISK VETO (ALL SIDES BLOCKED)"
        else:
            action_display = clean_action
            vetoed_side = None
            side_badge = None

        # Filter out low-conviction or repeated signals unless forced
        if not force:
            if confidence_pct < self.min_confidence_pct and not is_veto:
                log.info(f"Signal confidence {confidence_pct:.1f}% is below {self.min_confidence_pct:.1f}%. Suppressing.")
                return False

            if self.last_dispatched_action == clean_action and self.last_dispatched_time is not None:
                elapsed = (now - self.last_dispatched_time).total_seconds()
                if elapsed < self.cooldown_seconds:
                    log.info(f"Suppressing duplicate {clean_action} alert within cooldown ({elapsed:.0f}s < {self.cooldown_seconds}s).")
                    return False

        if is_veto:
            color = 0xF59E0B  # Amber Warning
            icon = "⚠️"
            title = f"{icon} RISK VETO: {vetoed_side} BLOCKED | {symbol}"
            description = (
                f"The Quantitative Risk Pipeline / Autonomous Council has **VETOED** the candidate "
                f"**{vetoed_side}** setup to protect capital.\n\n"
                f"• **Target Attempt:** `{vetoed_side}`\n"
                f"• **Execution Status:** 🛑 `STRICTLY BLOCKED`\n"
                f"• **Defense Mode:** Capital preservation active."
            )
        elif is_buy:
            color = 0x10B981  # Emerald Green
            icon = "🟢"
            title = f"{icon} INSTITUTIONAL {clean_action} SIGNAL | {symbol}"
            description = (
                f"A validated high-conviction **LONG / BUY** setup has been identified by the "
                f"Trade2Options 6-Layer Multi-Filter Quantitative Pipeline."
            )
        elif is_sell:
            color = 0xEF4444  # Crimson Red
            icon = "🔴"
            title = f"{icon} INSTITUTIONAL {clean_action} SIGNAL | {symbol}"
            description = (
                f"A validated high-conviction **SHORT / SELL** setup has been identified by the "
                f"Trade2Options 6-Layer Multi-Filter Quantitative Pipeline."
            )
        else:
            color = 0x3B82F6  # Blue Pulse
            icon = "ℹ️"
            title = f"{icon} MARKET MOMENTUM REGIME PULSE | {symbol}"
            description = f"Autonomous Market Scanner update. Current status: **{clean_action}**."

        risk_dist = abs(price - sl)
        target_dist = abs(tp - price)
        risk_pct = (risk_dist / price) * 100 if price > 0 else 0
        target_pct = (target_dist / price) * 100 if price > 0 else 0

        fields = [
            {"name": "🎯 Signal State", "value": f"**{action_display}**", "inline": True},
            {"name": "⚡ Conviction Score", "value": f"**{confidence_pct:.1f}%**", "inline": True},
            {"name": "📈 Market Regime", "value": f"`{regime}`", "inline": True},
        ]

        if is_veto:
            fields.append({"name": "🚫 Vetoed Direction", "value": f"**{side_badge}**", "inline": True})
            fields.append({"name": "💵 Reference Price", "value": f"`${price:,.2f}`", "inline": True})
            fields.append({"name": "⚖️ Risk / Reward", "value": f"`1:{rr:.1f} R:R`", "inline": True})
            fields.append({"name": "🛑 Blocked Stop Loss", "value": f"`${sl:,.2f}` (-{risk_pct:.2f}%)", "inline": True})
            fields.append({"name": "🎯 Blocked Take Profit", "value": f"`${tp:,.2f}` (+{target_pct:.2f}%)", "inline": True})
            fields.append({"name": "🛡️ Veto Rationale & Safety Filter", "value": f"{reason}", "inline": False})
        else:
            fields.append({"name": "💵 Entry Reference", "value": f"`${price:,.2f}`", "inline": True})
            fields.append({"name": "🛑 Protective Stop Loss", "value": f"`${sl:,.2f}` (-{risk_pct:.2f}%)", "inline": True})
            fields.append({"name": "🎯 Target Take Profit", "value": f"`${tp:,.2f}` (+{target_pct:.2f}%)", "inline": True})
            fields.append({"name": "⚖️ Risk / Reward", "value": f"`1:{rr:.1f} R:R`", "inline": True})
            fields.append({"name": "🧠 Primary Rationale", "value": f"{reason}", "inline": False})

        if layer_summaries:
            layer_text = "\n".join([f"• {s}" for s in layer_summaries[:5]])
            fields.append({"name": "🔬 6-Layer Confluence Breakdown", "value": layer_text, "inline": False})

        payload = {
            "username": "Trade2Options Institutional Bot",
            "avatar_url": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
            "embeds": [
                {
                    "title": title,
                    "description": description,
                    "color": color,
                    "fields": fields,
                    "footer": {
                        "text": f"Trade2Options Autonomous Scanner • Magic: 261016 • {now.strftime('%H:%M:%S UTC')}"
                    },
                    "timestamp": now_iso
                }
            ]
        }

        success = self.dispatch_payload(payload)
        if success:
            self.last_dispatched_action = clean_action
            self.last_dispatched_time = now
        return success


if __name__ == "__main__":
    import sys
    service = DiscordAlertService()
    if "--demo" in sys.argv:
        print("Dispatching sample high-conviction BUY signal card...")
        ok = service.dispatch_signal_card(
            symbol="BTC/USDT",
            action="BUY",
            confidence_pct=86.4,
            price=82050.00,
            sl=81420.00,
            tp=83310.00,
            rr=2.0,
            regime="BULL_TREND (Confirmed)",
            reason="Primary EMA 20/50/200 Stacked Bullish + ADX 27.8 Surge + CVD Accumulation (+382 BTC).",
            layer_summaries=[
                "Layer 1: EMA 20 ($82,010) > EMA 50 ($81,740) > EMA 200 ($80,950)",
                "Layer 2: Fast EMA 9/21 pullback retest confirmed",
                "Layer 3: ADX 27.8 with Choppiness Index 41.2 (< 60 trending)",
                "Layer 4: L2 Depth Book 1.95x Bid-Side Imbalance and Positive CVD"
            ],
            force=True
        )
        print("Demo Dispatch Result:", "SUCCESS" if ok else "FAILED")
    else:
        print("Sending test connection verification to Discord...")
        ok = service.send_connection_confirmation()
        print("Result:", "SUCCESS" if ok else "FAILED")

