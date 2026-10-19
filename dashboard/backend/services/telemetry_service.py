"""
Trade2Options EA Telemetry Bridge Service.
Reads, validates, and parses MT5 telemetry files from MT5 Common Files directory
or local project directory. Detects stale telemetry and provides live heartbeat monitoring.
"""

from __future__ import annotations
import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from contracts.schemas import EAStatus, EAHeartbeat, RiskStatus, PositionSnapshot, ExecutionEvent

logger = logging.getLogger("Trade2Options.TelemetryService")


class TelemetryService:
    def __init__(self, custom_path: Optional[str] = None):
        self.custom_path = custom_path
        self._cached_status: Optional[EAStatus] = None

    def get_candidate_paths(self) -> list[str]:
        """Returns standard locations where MT5 writes common files."""
        paths = []
        if self.custom_path:
            paths.append(self.custom_path)

        # 1. MT5 Terminal Common Files directory
        appdata = os.environ.get("APPDATA", "")
        if appdata:
            common_files = os.path.join(appdata, "MetaQuotes", "Terminal", "Common", "Files", "trade2options_telemetry.json")
            paths.append(common_files)

        # 2. Project root directory
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        paths.append(os.path.join(base_dir, "trade2options_telemetry.json"))

        # 3. Parent scratch directory
        paths.append(os.path.join(os.path.dirname(base_dir), "trade2options_telemetry.json"))
        
        return paths

    def read_telemetry(self) -> Dict[str, Any]:
        """
        Reads telemetry JSON, validates freshness.
        Returns a dictionary with is_active, is_stale, and payload or error state.
        """
        found_file = None
        for p in self.get_candidate_paths():
            if os.path.exists(p):
                found_file = p
                break

        if not found_file:
            return {
                "is_connected": False,
                "is_stale": True,
                "message": "No active MT5 telemetry file found. Ensure EA is running with InpEnableTelemetry=true.",
                "status": None
            }

        try:
            mtime = os.path.getmtime(found_file)
            age_seconds = datetime.now().timestamp() - mtime

            with open(found_file, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)

            is_stale = (age_seconds > 30.0)

            return {
                "is_connected": not is_stale,
                "is_stale": is_stale,
                "file_age_seconds": round(age_seconds, 1),
                "file_path": found_file,
                "message": "Telemetry streaming active" if not is_stale else f"Telemetry stale ({age_seconds:.0f}s old)",
                "status": data
            }
        except Exception as e:
            logger.error(f"Error parsing telemetry from {found_file}: {e}")
            return {
                "is_connected": False,
                "is_stale": True,
                "message": f"Error parsing telemetry: {e}",
                "status": None
            }
