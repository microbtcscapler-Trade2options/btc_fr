"""
Comprehensive Test Suite for Trade2Options Dashboard Backend API.
Tests data contracts, market data endpoints, regime calculations,
research adapters, and EA telemetry bridge.
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

# Inject project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from dashboard.backend.main import app


class TestTrade2OptionsBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "HEALTHY")
        self.assertEqual(data["version"], "1.0.0")

    def test_02_market_candles(self):
        resp = self.client.get("/api/market/candles?symbol=BTCUSDT&timeframe=15m&limit=100")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["is_data_available"])
        self.assertGreaterEqual(data["candles_count"], 50)
        self.assertIsNotNone(data["latest_candle"])
        self.assertEqual(data["symbol"], "BTCUSDT")

    def test_03_indicators_two_layers(self):
        resp = self.client.get("/api/market/indicators?symbol=BTCUSDT&timeframe=15m")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Verify Layer A (Primary Trend)
        pt = data["primary_trend"]
        self.assertIn("ema20", pt)
        self.assertIn("ema50", pt)
        self.assertIn("ema200", pt)
        self.assertIn("ema20_slope_deg", pt)
        self.assertIn("trend_description", pt)

        # Verify Layer B (Advisory Entry Timing)
        et = data["entry_timing"]
        self.assertIn("ema9", et)
        self.assertIn("ema21", et)
        self.assertIn("score", et)
        self.assertIn("rating", et)
        self.assertIn("is_advisory_notice", et)
        self.assertIn("factor_breakdown", et)

        # Verify Momentum Features
        mom = data["momentum"]
        self.assertIn("rsi_14", mom)
        self.assertIn("adx_14", mom)
        self.assertIn("atr_14", mom)
        self.assertIn("choppiness_index", mom)
        self.assertIn("directional_efficiency", mom)

    def test_04_market_regime_engine(self):
        resp = self.client.get("/api/market/regime?symbol=BTCUSDT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("regime", data)
        self.assertIn("confidence_pct", data)
        self.assertIn("rationale", data)
        self.assertIn("supporting_indicators", data)
        self.assertIn("higher_timeframe_agreement", data)

    def test_05_research_integrations(self):
        resp = self.client.get("/api/research/integrations")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        names = [item["name"] for item in data]
        self.assertIn("Kronos_Forecasting", names)
        self.assertIn("Vibe_Trading", names)
        self.assertIn("TradingView_MCP", names)
        self.assertIn("TORIC_Taurus_Research", names)

        # Verify all research adapters report CONNECTED
        for item in data:
            self.assertEqual(item["state"], "CONNECTED")

    def test_06_kronos_forecast_benchmark(self):
        resp = self.client.get("/api/research/kronos-forecast?symbol=BTCUSDT&timeframe=15m")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["model_name"], "Kronos-Foundation-RevIN")
        self.assertIn("forecast_horizons", data)
        self.assertIn("mae_vs_persistence", data)
        self.assertIn("directional_accuracy_pct", data)
        self.assertFalse(data["is_trading_signal"])

    def test_07_ea_telemetry(self):
        # 1. Trigger simulated heartbeat for testing bridge
        sim_resp = self.client.post("/api/ea/simulate-heartbeat")
        self.assertEqual(sim_resp.status_code, 200)

        # 2. Read EA status
        resp = self.client.get("/api/ea/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["is_connected"])
        self.assertFalse(data["is_stale"])
        self.assertIsNotNone(data["status"])
        self.assertEqual(data["status"]["heartbeat"]["ea_name"], "Trade2Options_BTC_Momentum")

    def test_08_audit_logs(self):
        resp = self.client.get("/api/audit/logs")
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertGreaterEqual(len(logs), 1)

    def test_09_deribit_options_chain_and_greeks(self):
        resp = self.client.get("/api/options/chain?symbol=BTCUSDT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["underlying_symbol"], "BTC")
        self.assertGreaterEqual(data["contracts_count"], 10)
        first_c = data["contracts"][0]
        self.assertIn("greeks", first_c)
        self.assertIn("delta", first_c["greeks"])
        self.assertIn("gamma", first_c["greeks"])

    def test_10_protective_collar_and_covered_call(self):
        resp_col = self.client.get("/api/options/collar-plan?symbol=BTCUSDT&volume=0.10")
        self.assertEqual(resp_col.status_code, 200)
        col_data = resp_col.json()
        self.assertIn("status", col_data)
        self.assertIn("recommended_put_contract", col_data)

        resp_cc = self.client.get("/api/options/yield-plan?symbol=BTCUSDT&volume=0.10")
        self.assertEqual(resp_cc.status_code, 200)
        cc_data = resp_cc.json()
        self.assertIn("status", cc_data)
        self.assertIn("annualized_yield_pct", cc_data)

    def test_11_orderbook_l2_and_order_flow_cvd(self):
        resp_ob = self.client.get("/api/market/orderbook-l2?symbol=BTCUSDT")
        self.assertEqual(resp_ob.status_code, 200)
        ob_data = resp_ob.json()
        self.assertEqual(len(ob_data["bids"]), 20)
        self.assertEqual(len(ob_data["asks"]), 20)
        self.assertGreater(ob_data["spread_usd"], 0)

        resp_of = self.client.get("/api/market/order-flow?symbol=BTCUSDT")
        self.assertEqual(resp_of.status_code, 200)
        of_data = resp_of.json()
        self.assertIn("cumulative_volume_delta", of_data)
        self.assertIn("delta_divergence", of_data)

    def test_12_sor_and_prop_firm_compliance(self):
        resp_sor = self.client.get("/api/execution/sor-plan?symbol=BTCUSD&volume=0.50&side=BUY&is_prop_firm=true")
        self.assertEqual(resp_sor.status_code, 200)
        sor_data = resp_sor.json()
        self.assertGreaterEqual(len(sor_data["venues"]), 2)
        self.assertIn("MT5_EXNESS_BROKER", sor_data["primary_venue"])

        resp_prop = self.client.get("/api/execution/prop-compliance")
        self.assertEqual(resp_prop.status_code, 200)
        prop_data = resp_prop.json()
        self.assertGreaterEqual(len(prop_data), 3)

    def test_13_meta_labeling_and_kelly_sizing(self):
        resp_ml = self.client.get("/api/ml/meta-label-assessment?symbol=BTCUSDT&direction=BUY")
        self.assertEqual(resp_ml.status_code, 200)
        ml_data = resp_ml.json()
        self.assertIn("win_probability_pct", ml_data)
        self.assertIn("constrained_lot_multiplier", ml_data)
        self.assertIn("barrier_take_profit", ml_data)
        self.assertIn("barrier_stop_loss", ml_data)

    def test_14_vibe_council_decision(self):
        resp = self.client.get("/api/vibe/council-decision?symbol=BTCUSDT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("consensus_verdict", data)
        self.assertIn("composite_conviction_pct", data)
        self.assertEqual(len(data["agents"]), 3)
        self.assertIn("executive_rationale", data)

    def test_15_toric_on_chain(self):
        resp = self.client.get("/api/toric/on-chain?symbol=BTCUSDT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("whale_net_flow_btc_24h", data)
        self.assertIn("mvrv_z_score", data)
        self.assertIn("funding_rate_annualized_pct", data)
        self.assertIn("on_chain_sentiment", data)

    def test_16_forecast_timeline(self):
        resp = self.client.get("/api/research/forecast-timeline?symbol=BTCUSDT&timeframe=15m")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["model_name"], "Kronos-RevIN-MultiHorizon")
        self.assertGreaterEqual(len(data["forecast_points"]), 5)
        self.assertIn("expected_direction", data)

    def test_17_agent_network_topology(self):
        resp = self.client.get("/api/agent-network/topology")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["nodes"]), 9)
        self.assertEqual(len(data["edges"]), 12)
        self.assertEqual(data["active_agent_count"], 9)
        self.assertEqual(data["system_status"], "OPTIMAL_COUPLED")

    def test_18_live_master_signal(self):
        resp = self.client.get("/api/signals/live-master-signal?symbol=BTCUSDT&timeframe=15m")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("action", data)
        self.assertIn("composite_confidence_pct", data)
        self.assertEqual(len(data["layers"]), 6)
        self.assertIn("mt5_status", data)
        self.assertEqual(data["mt5_magic_number"], 261016)

    def test_19_simulate_signal_trigger(self):
        resp = self.client.post("/api/signals/simulate-trigger?symbol=BTCUSDT")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "DISPATCHED")
        self.assertIn("action", data)
        self.assertIn("entry_price", data)
        self.assertEqual(data["mt5_magic_number"], 261016)


if __name__ == "__main__":
    unittest.main()



