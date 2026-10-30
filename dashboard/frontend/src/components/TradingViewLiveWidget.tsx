import React, { useState, useEffect, useMemo, memo } from 'react';
import { ContinuousForecastTimeline } from '../types';

interface TradingViewLiveWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number | string;
  interval?: string;
  autosize?: boolean;
  timeline?: ContinuousForecastTimeline | null;
  onProjectToTradingView?: () => void;
  isProjectingToTv?: boolean;
}

export const TradingViewLiveWidget: React.FC<TradingViewLiveWidgetProps> = memo(({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
  height = 540,
  interval = '15',
  autosize = true,
  timeline = null,
  onProjectToTradingView,
  isProjectingToTv = false
}) => {
  const [embedMode, setEmbedMode] = useState<'advanced' | 'classic'>('advanced');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Reset loading whenever symbol, interval, embedMode or reloadKey changes
  useEffect(() => {
    setLoading(true);
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

  // Build the classic embed URL
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

  // Forecast points summary
  const forecastPoints = timeline?.forecast_points?.filter(p => p.is_projection) || [];
  const finalPoint = forecastPoints.length > 0 ? forecastPoints[forecastPoints.length - 1] : null;
  const currentSpot = timeline?.current_price || (forecastPoints.length > 0 ? forecastPoints[0].predicted_price : 77500);
  const driftPct = finalPoint
    ? (((finalPoint.predicted_price - currentSpot) / currentSpot) * 100).toFixed(2)
    : '+0.00';

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
          zIndex: 5,
          flexWrap: 'wrap',
          gap: 8
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
            {interval}m Real-Time Ticks
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
            <span>Engine:</span>
            <span style={{ color: '#B388FF' }}>{embedMode === 'advanced' ? 'Advanced Pro' : 'Classic Bridge'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Project to Desktop MCP Button */}
          {onProjectToTradingView && (
            <button
              type="button"
              onClick={onProjectToTradingView}
              disabled={isProjectingToTv}
              title="Project forecast trendlines directly to TradingView Desktop via MCP"
              style={{
                background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.25), rgba(124, 77, 255, 0.25))',
                border: '1px solid rgba(38, 166, 154, 0.5)',
                color: '#80CBC4',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: isProjectingToTv ? 'wait' : 'pointer'
              }}
            >
              {isProjectingToTv ? '⏳ Projecting...' : '⚡ Project to TV Desktop'}
            </button>
          )}

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
              cursor: 'pointer'
            }}
          >
            {embedMode === 'advanced' ? '⇄ Classic Engine' : '⇄ Pro Engine'}
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

      {/* Kronos AI Forecast Overlay HUD Strip */}
      {finalPoint && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            background: 'rgba(17, 10, 30, 0.95)',
            borderBottom: '1px solid rgba(172, 88, 233, 0.3)',
            fontSize: 11,
            color: '#E0F2F1',
            zIndex: 4,
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: '#E0B0FF', fontWeight: 800 }}>⚡ KRONOS AI HORIZON:</span>
            <span>
              Spot: <strong style={{ color: '#00F5FF' }}>${currentSpot.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
            </span>
            <span>➔</span>
            <span>
              Target 90m: <strong style={{ color: Number(driftPct) >= 0 ? '#00E676' : '#FF5252' }}>
                ${finalPoint.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ({Number(driftPct) >= 0 ? `+${driftPct}` : driftPct}%)
              </strong>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span style={{ color: '#D1C4E9' }}>
              90% Volatility Cone: [${finalPoint.lower_bound_90.toFixed(0)} — ${finalPoint.upper_bound_90.toFixed(0)}]
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-dim)' }}>
            {forecastPoints.slice(0, 4).map((pt, i) => (
              <span key={i} style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(124, 77, 255, 0.15)', color: '#B388FF' }}>
                +{((i + 1) * 15)}m: ${pt.predicted_price.toFixed(0)}
              </span>
            ))}
          </div>
        </div>
      )}

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
