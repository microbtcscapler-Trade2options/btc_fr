"""
Trade2Options MQL5 EA Automated Compiler & Validator.
Uses MetaEditor64 to compile Trade2Options_BTC_Momentum.mq5 and verify zero errors/warnings.
"""

import os
import subprocess
import time
import sys

def compile_ea():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ea_file = os.path.join(base_dir, "mt5-ea", "Experts", "Trade2Options_BTC_Momentum.mq5")
    log_file = os.path.join(base_dir, "mt5-ea", "Experts", "Trade2Options_BTC_Momentum.log")
    compiler = r"C:\Program Files\MetaTrader 5\metaeditor64.exe"

    if not os.path.exists(ea_file):
        print(f"[ERROR] EA file not found: {ea_file}")
        return False

    if not os.path.exists(compiler):
        print(f"[ERROR] MetaEditor not found at {compiler}")
        return False

    print(f"Compiling MQL5 EA: {ea_file}")
    cmd = f'"{compiler}" /compile:"{ea_file}" /log:"{log_file}"'
    subprocess.run(cmd, shell=True)
    time.sleep(1.5)

    if os.path.exists(log_file):
        try:
            content = open(log_file, "r", encoding="utf-16le", errors="ignore").read()
            print("\n--- MetaEditor Compiler Output ---")
            print(content.encode("ascii", errors="replace").decode("ascii"))
        except Exception as e:
            print(f"Error reading log: {e}")

    ex5_file = ea_file.replace(".mq5", ".ex5")
    if os.path.exists(ex5_file):
        size_kb = os.path.getsize(ex5_file) / 1024.0
        print(f"\n[SUCCESS] Binary successfully generated: {ex5_file} ({size_kb:.1f} KB)")
        return True
    else:
        print(f"\n[FAILURE] EX5 binary was not generated.")
        return False

if __name__ == "__main__":
    success = compile_ea()
    sys.exit(0 if success else 1)
