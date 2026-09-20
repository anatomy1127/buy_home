import React from 'react';
import { History, Sparkles, CheckCircle2, TrendingDown } from 'lucide-react';

export default function HistoryLog({ logs }) {
  const getIcon = (type) => {
    switch (type) {
      case 'NEW_LISTING':
        return <Sparkles size={16} color="#10b981" />;
      case 'CLOSED_SALE':
        return <CheckCircle2 size={16} color="#c084fc" />;
      case 'PRICE_CHANGE':
        return <TrendingDown size={16} color="#f59e0b" />;
      default:
        return <History size={16} color="var(--accent-primary)" />;
    }
  };

  const formatPrice = (val) => val ? `$${val.toLocaleString()}` : 'N/A';

  return (
    <div className="glass-panel" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="var(--accent-primary)" />
          Real Estate Market Change Log
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{logs.length} Recent Activity Events</span>
      </div>

      {logs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No activity logged yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {logs.map((log) => (
            <div 
              key={log.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(log.eventType)}
                </div>

                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{log.address}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.eventType === 'NEW_LISTING' && `Listed at ${formatPrice(log.price)}`}
                    {log.eventType === 'CLOSED_SALE' && `Sold at ${formatPrice(log.price)}`}
                    {log.eventType === 'PRICE_CHANGE' && `Price cut from ${formatPrice(log.oldPrice)} to ${formatPrice(log.newPrice)}`}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
