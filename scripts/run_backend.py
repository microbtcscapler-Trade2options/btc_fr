"""
Launcher script for Trade2Options Intelligence Dashboard Backend API.
Serves on http://localhost:8000 (with mounted React frontend).
"""

import sys
import os
import uvicorn

# Inject project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if __name__ == "__main__":
    print("==================================================================")
    print("  STARTING TRADE2OPTIONS INTELLIGENCE DASHBOARD SERVER            ")
    print("  URL: http://localhost:8000                                      ")
    print("  API Docs: http://localhost:8000/docs                            ")
    print("==================================================================")
    uvicorn.run("dashboard.backend.main:app", host="127.0.0.1", port=8000, reload=False)
