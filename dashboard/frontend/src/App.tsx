import React, { useState, useEffect } from 'react';
import { MarketDataSnapshot, IndicatorSnapshot, MarketRegimeSnapshot, TimeFrame, MasterSignalSnapshot } from './types';
import { fetchMarketCandles, fetchMarketIndicators, fetchMarketRegime, fetchMasterSignal } from './api';

import { MarketTerminalPage } from './pages/MarketTerminalPage';
import { MomentumRegimePage } from './pages/MomentumRegimePage';
import { EntryTimingPage } from './pages/EntryTimingPage';
import { ResearchIntelligencePage } from './pages/ResearchIntelligencePage';
import { BacktestLabPage } from './pages/BacktestLabPage';
import { EAMonitorPage } from './pages/EAMonitorPage';
import { AuditIntegrationsPage } from './pages/AuditIntegrationsPage';
import { OptionsOverlayPage } from './pages/OptionsOverlayPage';
import { ForecastStudioPage } from './pages/ForecastStudioPage';
import { ObsidianAgentGraph } from './pages/ObsidianAgentGraph';
import { SignalLabModal } from './components/SignalLabModal';

type TabKey = 'terminal' | 'regime' | 'entry' | 'forecast' | 'topology' | 'research' | 'options' | 'backtest' | 'ea' | 'audit';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('terminal');
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  const [snapshot, setSnapshot] = useState<MarketDataSnapshot | null>(null);
  const [indicators, setIndicators] = useState<IndicatorSnapshot | null>(null);
  const [regime, setRegime] = useState<MarketRegimeSnapshot | null>(null);
  const [liveSignal, setLiveSignal] = useState<MasterSignalSnapshot | null>(null);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [snap, sig] = await Promise.all([
        fetchMarketCandles('BTCUSDT', timeframe, 150),
        fetchMasterSignal('BTCUSDT', timeframe).catch(() => null)
      ]);
      setSnapshot(snap);
      if (sig) setLiveSignal(sig);

      if (snap.is_data_available && snap.candles_count >= 50) {
        const [ind, reg] = await Promise.all([
          fetchMarketIndicators('BTCUSDT', timeframe),
          fetchMarketRegime('BTCUSDT')
        ]);
        setIndicators(ind);
        setRegime(reg);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [timeframe]);

  const navItems: { key: TabKey; label: string; tag?: string }[] = [
    { key: 'terminal', label: '1. BTC Terminal' },
    { key: 'regime', label: '2. Momentum & Regime Lab' },
    { key: 'entry', label: '3. Entry Timing', tag: 'ADVISORY' },
    { key: 'forecast', label: '4. AI Forecast Studio', tag: 'HORIZONS' },
    { key: 'topology', label: '5. Obsidian Agent Mesh', tag: 'LIVE GRAPH' },
    { key: 'research', label: '6. Research Intelligence' },
    { key: 'options', label: '7. Options & SOR Desk', tag: 'FULL POWER' },
    { key: 'backtest', label: '8. Backtest & Strategy Lab' },
    { key: 'ea', label: '9. EA Monitor' },
    { key: 'audit', label: '10. Integrations & Audit' },
  ];


  const curPrice = snapshot?.latest_candle?.close || 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo Mark */}
          <div style={{ width: 34, height: 34, borderRadius: 6, background: 'linear-gradient(135deg, #38BDF8, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#07090E', fontSize: 16 }}>
            T2O
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, color: '#F8FAFC' }}>
              TRADE2OPTIONS <span style={{ color: '#38BDF8', fontWeight: 600 }}>BITCOIN MOMENTUM</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
              Institutional Quant Research & Independent MT5 Execution Terminal
            </div>
          </div>
        </div>

        {/* Center Live Signal Lab Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setIsLabOpen(true)}
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              border: '1px solid #10B981',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(6, 78, 59, 0.35) 100%)',
              color: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot dot-green" />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.8, color: '#34D399' }}>
                ⚡ LAB
              </span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#F8FAFC' }}>
              {liveSignal ? `${liveSignal.action.replace(/_/g, ' ')} (${liveSignal.composite_confidence_pct}%)` : 'LIVE SIGNAL FLOW'}
            </span>
            <span style={{ fontSize: 9, background: '#064E3B', color: '#6EE7B7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
              MT5 FLOW
            </span>
          </button>
        </div>

        {/* Global Live Ticker & Regime Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#07090E', padding: '6px 14px', borderRadius: 6, border: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>BTC/USDT</span>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'JetBrains Mono', color: '#10B981' }}>
              ${curPrice ? curPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
            </span>
          </div>

          {regime && (
            <span className={`t2o-badge ${regime.regime.includes('BULLISH') ? 'badge-bullish' : regime.regime.includes('BEARISH') ? 'badge-bearish' : 'badge-warning'}`}>
              {regime.regime.replace(/_/g, ' ')}
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8' }}>
            <span className="pulse-dot dot-green" />
            <span>API Online</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav style={{ background: '#090D17', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                padding: '12px 14px',
                border: 'none',
                background: 'transparent',
                color: isActive ? '#38BDF8' : '#94A3B8',
                fontWeight: isActive ? 700 : 500,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{item.label}</span>
              {item.tag && (
                <span className="t2o-badge badge-warning" style={{ fontSize: 9, padding: '2px 5px' }}>
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Page Body */}
      <main style={{ flex: 1, padding: 20, maxWidth: 1600, width: '100%', margin: '0 auto' }}>
        {activeTab === 'terminal' && (
          <MarketTerminalPage
            snapshot={snapshot}
            indicators={indicators}
            regime={regime}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            onRefresh={() => loadData()}
            loading={loading}
          />
        )}
        {activeTab === 'regime' && (
          <MomentumRegimePage regime={regime} indicators={indicators} />
        )}
        {activeTab === 'entry' && (
          <EntryTimingPage indicators={indicators} />
        )}
        {activeTab === 'forecast' && (
          <ForecastStudioPage />
        )}
        {activeTab === 'topology' && (
          <ObsidianAgentGraph />
        )}
        {activeTab === 'research' && (
          <ResearchIntelligencePage />
        )}
        {activeTab === 'options' && (
          <OptionsOverlayPage />
        )}
        {activeTab === 'backtest' && (
          <BacktestLabPage />
        )}
        {activeTab === 'ea' && (
          <EAMonitorPage />
        )}
        {activeTab === 'audit' && (
          <AuditIntegrationsPage />
        )}
      </main>


      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748B' }}>
        <div>
          Trade2Options Systematic Microbot &copy; 2026 | Built for Institutional Quant Research & MT5 Independent Execution.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>Primary Trend: EMA 20/50/200</span>
          <span>Advisory Timing: EMA 9/21/200</span>
          <span>Execution: MT5 Standalone (Zero External Dependency)</span>
        </div>
      </footer>

      {/* Signal & Execution Lab Modal */}
      <SignalLabModal
        isOpen={isLabOpen}
        onClose={() => setIsLabOpen(false)}
        timeframe={timeframe}
      />
    </div>
  );
};
