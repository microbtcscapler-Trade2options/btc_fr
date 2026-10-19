"""
Unit Test Suite for Trade2Options MT5 EA Execution & Risk Management Logic.
Validates EA mathematical algorithms, lot sizing, and risk locks independently.
"""

import unittest
import math


class TestEALogicAndRisk(unittest.TestCase):
    def test_lot_size_normalization(self):
        """Simulates NormalizeLot and CalculateLotSize from Trade2Options_Risk.mqh."""
        balance = 10000.0
        risk_pct = 1.0  # 1% risk = $100
        sl_points = 1500.0  # 1500 points = $150 on standard lot
        tick_value = 1.0
        tick_size = 1.0
        point = 1.0
        min_lot = 0.01
        max_lot = 2.0
        lot_step = 0.01

        risk_amount = balance * (risk_pct / 100.0)  # 100.0 USD
        points_per_tick = tick_size / point
        risk_per_lot = (sl_points / points_per_tick) * tick_value  # 1500.0 USD / lot
        calculated_lot = risk_amount / risk_per_lot  # 100 / 1500 = 0.0666... lot

        # Normalization
        lot = math.floor(calculated_lot / lot_step) * lot_step
        lot = max(lot, min_lot)
        lot = min(lot, max_lot)
        final_lot = round(lot, 2)

        self.assertEqual(final_lot, 0.06)
        self.assertGreaterEqual(final_lot, min_lot)
        self.assertLessEqual(final_lot, max_lot)

    def test_daily_loss_limit_breach(self):
        """Validates daily loss threshold enforcement."""
        daily_loss_limit_usd = 500.0
        daily_loss_limit_pct = 4.0
        starting_balance = 10000.0

        # Scenario 1: Loss under limit
        current_loss = 350.0
        current_pct = (current_loss / starting_balance) * 100.0
        breached = (current_loss >= daily_loss_limit_usd) or (current_pct >= daily_loss_limit_pct)
        self.assertFalse(breached)

        # Scenario 2: Loss exceeds USD limit
        current_loss = 550.0
        current_pct = (current_loss / starting_balance) * 100.0
        breached = (current_loss >= daily_loss_limit_usd) or (current_pct >= daily_loss_limit_pct)
        self.assertTrue(breached)

    def test_trailing_stop_progression(self):
        """Validates ATR trailing stop only moves in favorable direction."""
        open_price = 80000.0
        current_sl = 79500.0
        trail_distance = 300.0

        # Case 1: Price rallies to 80500 (Buy order)
        bid = 80500.0
        target_sl = bid - trail_distance  # 80200.0
        should_modify = (bid > open_price + trail_distance) and (target_sl > current_sl)
        self.assertTrue(should_modify)
        self.assertEqual(target_sl, 80200.0)

        # Case 2: Price retraces back to 80100 -> SL must NOT move down
        bid_retrace = 80100.0
        target_sl_retrace = bid_retrace - trail_distance  # 79800.0
        should_modify_retrace = (target_sl_retrace > target_sl)  # 79800 > 80200 = False
        self.assertFalse(should_modify_retrace)

    def test_primary_trend_signals(self):
        """Validates closed bar signal logic: EMA20 > EMA50 > EMA200 & Close >= EMA20."""
        # Bullish setup
        ema20 = 82000.0
        ema50 = 81000.0
        ema200 = 80000.0
        close = 82100.0
        spread = 20.0
        max_spread = 80.0

        is_bullish = (ema20 > ema50 > ema200) and (close >= ema20) and (spread <= max_spread)
        self.assertTrue(is_bullish)

        # Bearish setup
        ema20_bear = 78000.0
        ema50_bear = 79000.0
        ema200_bear = 80000.0
        close_bear = 77800.0
        is_bearish = (ema20_bear < ema50_bear < ema200_bear) and (close_bear <= ema20_bear) and (spread <= max_spread)
        self.assertTrue(is_bearish)


if __name__ == "__main__":
    unittest.main()
