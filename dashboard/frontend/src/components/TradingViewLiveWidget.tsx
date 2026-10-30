import React, { useState, useEffect, useMemo, memo } from 'react';

interface TradingViewLiveWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number | string;
  interval?: string;
  autosize?: boolean;
}

export const TradingViewLiveWidget: React.FC<TradingViewLiveWidgetProps> = memo(({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  height = 540,
  interval = '15',
  autosize = true
}) => {
  const [embedMode, setEmbedMode] = useState<'advanced' | 'classic'>('advanced');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // Reset loading whenever symbol, interval, embedMode or reloadKey changes
  useEffect(() => {
    setLoading(true);
    setLoadTimedOut(false);

    const timer = setTimeout(() => {
      setLoadTimedOut(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [symbol, interval, embedMode, reloadKey]);

  // Build the advanced widget URL
  const advancedUrl = useMemo(() => {
    const config = {
      autosize: autosize,
      symbol: symbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      withdateranges: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#060B0E',
      gridColor: 'rgba(172, 88, 233, 0.08)',
      studies: ['STD;EMA']
    };
    const hash = encodeURIComponent(JSON.stringify(config));
    return `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en#${hash}`;
  }, [autosize, symbol, interval, theme]);

  // Build the classic embed URL (highest compatibility, bypasses aggressive blockers)
  const classicUrl = useMemo(() => {
    const params = new URLSearchParams({
      symbol: symbol,
      interval: interval,
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1',
      timezone: 'Etc/UTC',
      locale: 'en',
      hide_side_toolbar: '0',
      allow_symbol_change: '1',
      saveimage: '0',
      toolbarbg: '060B0E'
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [symbol, interval, theme]);

  const activeSrc = embedMode === 'advanced' ? advancedUrl : classicUrl;

  const handleReload = () => {
    setReloadKey(k => k + 1);
  };

  const openPopout = () => {
    const tvSymbol = symbol.replace(':', '%3A');
    window.open(`https://www.tradingview.com/chart/?symbol=${tvSymbol}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="tradingview-live-widget-wrapper"
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: '#060B0E',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Top Embedded Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          background: 'rgba(10, 15, 24, 0.95)',
          borderBottom: '1px solid rgba(172, 88, 233, 0.15)',
          fontSize: 11,
          fontWeight: 700,
          zIndex: 5
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="pulse-dot dot-green" style={{ width: 8, height: 8 }} />
          <span style={{ color: '#E0F2F1', letterSpacing: 0.5 }}>{symbol}</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(38, 166, 154, 0.2)',
              color: '#26A69A',
              fontSize: 10
            }}
          >
            {interval}m Live Ticks
          </span>
          <span
            style={{
              color: 'var(--text-dim)',
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>Mode:</span>
            <span style={{ color: '#B388FF' }}>{embedMode === 'advanced' ? 'Advanced Pro' : 'Classic Bridge'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Switch Mode Button */}
          <button
            type="button"
            onClick={() => setEmbedMode(m => m === 'advanced' ? 'classic' : 'advanced')}
            title="Switch between Advanced and Classic TradingView embed engines"
            style={{
              background: 'rgba(124, 77, 255, 0.12)',
              border: '1px solid rgba(124, 77, 255, 0.3)',
              color: '#D1C4E9',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {embedMode === 'advanced' ? '⇄ Try Classic Engine' : '⇄ Use Pro Engine'}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleReload}
            title="Reload live chart stream"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            ↻ Reload
          </button>

          {/* External Popout */}
          <button
            type="button"
            onClick={openPopout}
            title="Open in TradingView Chart Web"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: 6,
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            ↗ Popout
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
        {/* Loading Spinner / Skeleton */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#060B0E',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              zIndex: 3
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '3px solid rgba(172, 88, 233, 0.2)',
                borderTopColor: '#AC58E9',
                animation: 'spin 0.9s linear infinite'
              }}
            />
            <div style={{ color: '#E0F2F1', fontSize: 13, fontWeight: 700 }}>
              Connecting to TradingView WebSocket & Binance Real-Time Spot Stream...
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>
              Streaming {symbol} • Interval {interval} • Sub-second tick pipeline
            </div>
          </div>
        )}

        {/* Browser Shield / AdBlock Warning Banner if loading takes over 5s */}
        {loadTimedOut && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 20,
              right: 20,
              background: 'rgba(26, 17, 43, 0.95)',
              border: '1px solid rgba(255, 171, 0, 0.5)',
              borderRadius: 8,
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 12,
              color: '#FFE082',
              zIndex: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⚠️</span>
              <span>
                Chart taking longer to display? In <strong>Brave browser</strong> or ad-blockers, allow TradingView scripts or click:
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmbedMode('classic');
                setLoadTimedOut(false);
              }}
              style={{
                background: '#FFB300',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: 11
              }}
            >
              Switch to Classic Engine
            </button>
          </div>
        )}

        {/* TradingView Direct Iframe */}
        <iframe
          key={`${embedMode}-${symbol}-${interval}-${reloadKey}`}
          title="TradingView Real-Time Chart"
          src={activeSrc}
          onLoad={() => setLoading(false)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            background: '#060B0E',
            position: 'relative',
            zIndex: 2
          }}
          allow="transparency; clipboard-write; encrypted-media; picture-in-picture"
        />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});
