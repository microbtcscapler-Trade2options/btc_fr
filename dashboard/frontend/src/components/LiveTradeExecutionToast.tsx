import React, { useState, useEffect } from 'react';

interface TradeToast {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL' | 'COLLAR_PUT';
  size: string;
  price: string;
  latency: string;
  route: string;
}

const SAMPLE_TRADES: Omit<TradeToast, 'id'>[] = [
  { asset: 'BTCUSDT', type: 'BUY', size: '0.45 BTC', price: '$84,920.00', latency: '3.4ms', route: 'MT5_DIRECT_IPC' },
  { asset: 'BTC-28MAR-C92K', type: 'COLLAR_PUT', size: '1.20 BTC', price: '$81,500.00', latency: '4.1ms', route: 'DERIBIT_SOCKET' },
  { asset: 'BTCUSDT', type: 'BUY', size: '0.30 BTC', price: '$84,885.50', latency: '2.9ms', route: 'BINANCE_LINEAR' },
  { asset: 'BTC-28MAR-P80K', type: 'BUY', size: '0.75 BTC', price: '$80,000.00', latency: '3.8ms', route: 'DERIBIT_SOCKET' }
];

export const LiveTradeExecutionToast: React.FC = () => {
  const [currentTrade, setCurrentTrade] = useState<TradeToast | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let index = 0;

    const showNext = () => {
      const sample = SAMPLE_TRADES[index % SAMPLE_TRADES.length];
      index++;

      setCurrentTrade({
        ...sample,
        id: `T2O-${Math.floor(Math.random() * 8999 + 1000)}`
      });
      setIsVisible(true);

      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4200);
    };

    // First appearance after 2.5s
    const initialTimeout = setTimeout(showNext, 2500);
    const interval = setInterval(showNext, 8500);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!currentTrade) return null;

  return (
    <div className={`live-trade-toast ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-glow-border" />
      <div className="toast-inner">
        <div className="toast-left">
          <div className="toast-beacon">
            <span className="beacon-dot" />
          </div>
          <div>
            <div className="toast-header-row">
              <span className="toast-route">{currentTrade.route}</span>
              <span className="toast-time">JUST NOW</span>
            </div>
            <div className="toast-body-row">
              <span className={`toast-badge ${currentTrade.type === 'BUY' ? 'badge-buy' : 'badge-hedge'}`}>
                {currentTrade.type}
              </span>
              <span className="toast-desc">
                {currentTrade.size} @ <strong>{currentTrade.price}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="toast-right">
          <span className="toast-latency-val">{currentTrade.latency}</span>
          <span className="toast-latency-lbl">IPC LATENCY</span>
        </div>
      </div>
    </div>
  );
};
