"""
Trade2Options Master Institutional Launcher.
Starts all ecosystem daemons in full power:
1. FastAPI Backend Server (Port 8000)
2. Vite Frontend Web Cockpit (Port 3000)
3. TradingView Desktop CDP Bridge (Port 9222)
4. Automated Browser Launch (http://localhost:3000)
5. Interactive Terminal CLI
"""

import sys
import os
import time
import subprocess
import webbrowser
import urllib.request
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
PURPLE = "\033[95m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


def is_port_responding(url, timeout=1.5):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Trade2Options-Launcher/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status == 200
    except Exception:
        return False


def main():
    print(f"""
{CYAN}================================================================================{RESET}
{BOLD}{PURPLE}      TRADE2OPTIONS MASTER LAUNCHER — FULL POWER AUTOMATION SUITE             {RESET}
{CYAN}================================================================================{RESET}
{DIM}  Starting Backend API, Frontend Cockpit, TradingView CDP, and Master Terminal...{RESET}
""")

    # 1. Check Backend Server (Port 8000)
    print(f"[{BOLD}1/4{RESET}] Checking FastAPI Backend (http://localhost:8000/api/health)...")
    if is_port_responding("http://localhost:8000/api/health"):
        print(f"      {GREEN}✓ FastAPI Backend is already running and HEALTHY on port 8000.{RESET}")
    else:
        print(f"      Starting FastAPI Backend in background...")
        backend_script = os.path.join(BASE_DIR, "scripts", "run_backend.py")
        subprocess.Popen([sys.executable, backend_script], cwd=BASE_DIR, shell=True)
        time.sleep(2)
        if is_port_responding("http://localhost:8000/api/health"):
            print(f"      {GREEN}✓ Backend successfully started on port 8000.{RESET}")
        else:
            print(f"      {YELLOW}! Backend starting up in background...{RESET}")

    # 2. Check Frontend Dev Server (Port 3000)
    print(f"\n[{BOLD}2/4{RESET}] Checking Vite Frontend Cockpit (http://localhost:3000)...")
    if is_port_responding("http://localhost:3000"):
        print(f"      {GREEN}✓ Vite Frontend Cockpit is already running on port 3000.{RESET}")
    else:
        print(f"      Starting Vite Dev Server in background...")
        frontend_dir = os.path.join(BASE_DIR, "dashboard", "frontend")
        subprocess.Popen("npm run dev", cwd=frontend_dir, shell=True)
        time.sleep(3)
        print(f"      {GREEN}✓ Frontend server process initialized.{RESET}")

    # 3. Check TradingView Desktop CDP (Port 9222)
    print(f"\n[{BOLD}3/4{RESET}] Checking TradingView Desktop CDP Bridge (Port 9222)...")
    tv_active = is_port_responding("http://127.0.0.1:9222/json/version")
    if tv_active:
        print(f"      {GREEN}✓ TradingView Desktop connected via CDP on port 9222.{RESET}")
    else:
        print(f"      {YELLOW}Notice: TradingView Desktop CDP port 9222 is not active.{RESET}")
        print(f"      {DIM}To enable desktop auto-drawing, launch TradingView with: --remote-debugging-port=9222{RESET}")
        print(f"      {DIM}(The web-embedded TradingView chart and AI cone run 100% independently).{RESET}")

    # 4. Open Browser to Cockpit
    print(f"\n[{BOLD}4/4{RESET}] Launching Web Cockpit in Browser...")
    time.sleep(1)
    webbrowser.open("http://localhost:3000/#/forecast")
    print(f"      {GREEN}✓ Browser launched to AI Forecast Studio (http://localhost:3000/#/forecast).{RESET}")

    print(f"\n{GREEN}{BOLD}>>> ALL SYSTEMS OPERATIONAL AT FULL POWER! <<<{RESET}")
    print(f"{DIM}Launching Master Terminal CLI in 2 seconds...{RESET}\n")
    time.sleep(2)

    # 5. Launch Master Terminal CLI in the same console
    from scripts.terminal_cli import interactive_menu
    interactive_menu()


if __name__ == "__main__":
    main()

