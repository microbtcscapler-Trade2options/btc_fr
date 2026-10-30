import React, { useEffect, useRef, memo } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous contents
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = typeof height === 'number' ? `${height}px` : height;
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
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
      backgroundColor: theme === 'dark' ? 'rgba(6, 11, 14, 1)' : 'rgba(255, 255, 255, 1)',
      gridColor: theme === 'dark' ? 'rgba(172, 88, 233, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      studies: [
        'STD;EMA'
      ]
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, theme, height, interval, autosize]);

  return (
    <div
      className="tradingview-live-widget-wrapper"
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)'
      }}
    >
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

