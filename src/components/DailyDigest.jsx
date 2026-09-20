import React, { useState } from 'react';
import { Home, Sparkles, CheckCircle2, TrendingDown, DollarSign, ExternalLink, Copy, Download, Calendar, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DailyDigest({ summary, onSelectProperty }) {
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  if (!summary) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Sparkles size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
        <h2>No Daily Digest Available Yet</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Click "Run Daily Sync" in the header to perform a daily Redfin search and generate today's digest.
        </p>
      </div>
    );
  }

  const { newCount, closedCount, priceDropCount, metrics, newlyAddedHomes = [], newlyClosedHomes = [], priceDropHomes = [], summaryMarkdown } = summary;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(summaryMarkdown || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([summaryMarkdown || ''], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `redfin-digest-${summary.date || 'today'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatPrice = (val) => val ? `$${val.toLocaleString()}` : 'N/A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KPI Top Cards */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Sparkles size={24} />
          </div>
          <div className="metric-info">
            <p>New Added Houses</p>
            <h3>{newCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'normal' }}>today</span></h3>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-info">
            <p>Newly Closed / Sold</p>
            <h3>{closedCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>deals</span></h3>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <TrendingDown size={24} />
          </div>
          <div className="metric-info">
            <p>Price Cuts</p>
            <h3>{priceDropCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>homes</span></h3>
          </div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <p>Avg Price / Sqft</p>
            <h3>${metrics?.avgPriceSqft || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ sqft</span></h3>
          </div>
        </div>
      </div>

      {/* Summary Header & Digest Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--accent-cyan)" />
              Daily Summary Digest — {summary.date}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Target Region: <strong style={{ color: 'var(--text-primary)' }}>{summary.profileName} ({summary.location})</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={handleCopyMarkdown}>
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy Summary Text'}
            </button>
            <button className="btn btn-outline" onClick={handleDownloadMarkdown}>
              <Download size={16} />
              Export .MD Report
            </button>
          </div>
        </div>

        {/* Filter Sub-Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className={`btn ${activeSubFilter === 'all' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveSubFilter('all')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            All Today's Updates ({newCount + closedCount + priceDropCount})
          </button>
          <button 
            className={`btn ${activeSubFilter === 'new' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveSubFilter('new')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            🆕 Newly Added ({newCount})
          </button>
          <button 
            className={`btn ${activeSubFilter === 'closed' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveSubFilter('closed')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            🤝 Newly Closed ({closedCount})
          </button>
          <button 
            className={`btn ${activeSubFilter === 'drops' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveSubFilter('drops')}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            📉 Price Drops ({priceDropCount})
          </button>
        </div>
      </div>

      {/* SECTION 1: NEWLY ADDED HOUSES */}
      {(activeSubFilter === 'all' || activeSubFilter === 'new') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-new">NEW</span>
              Newly Added Active Houses ({newlyAddedHomes.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Listings posted today matching your criteria</span>
          </div>

          {newlyAddedHomes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No new active homes added today in this search profile.
            </div>
          ) : (
            <div className="listings-grid">
              {newlyAddedHomes.map(h => (
                <div key={h.mlsId} className="glass-panel property-card" onClick={() => onSelectProperty(h)} style={{ cursor: 'pointer' }}>
                  <div className="property-image-wrapper">
                    <img src={h.photoUrl} alt={h.address} className="property-image" />
                    <div className="property-overlay-badge">
                      <span className="badge badge-new">🆕 NEW ACTIVE</span>
                    </div>
                    <a 
                      href={h.redfinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="property-redfin-link" 
                      title="View on Redfin"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  
                  <div className="property-body">
                    <div className="property-price-row">
                      <div className="property-price">{formatPrice(h.price)}</div>
                      <div className="property-ppsqft">${h.pricePerSqft}/sqft</div>
                    </div>

                    <div className="property-address" title={h.address}>
                      {h.address}
                    </div>

                    <div className="property-specs">
                      <div className="spec-item"><strong>{h.beds}</strong> beds</div>
                      <div>•</div>
                      <div className="spec-item"><strong>{h.baths}</strong> baths</div>
                      <div>•</div>
                      <div className="spec-item"><strong>{h.sqft ? h.sqft.toLocaleString() : 'N/A'}</strong> sqft</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: NEWLY CLOSED / SOLD HOUSES */}
      {(activeSubFilter === 'all' || activeSubFilter === 'closed') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-closed">CLOSED</span>
              Newly Closed / Sold Houses ({newlyClosedHomes.length})
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transactions recently recorded in this area</span>
          </div>

          {newlyClosedHomes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No closed/sold homes recorded today in this search profile.
            </div>
          ) : (
            <div className="listings-grid">
              {newlyClosedHomes.map(h => {
                const soldP = h.soldPrice || h.price;
                const listP = h.originalPrice || h.price;
                const diff = soldP - listP;
                const pct = listP > 0 ? ((diff / listP) * 100).toFixed(1) : 0;
                const isOverList = diff > 0;

                return (
                  <div key={h.mlsId} className="glass-panel property-card" onClick={() => onSelectProperty(h)} style={{ cursor: 'pointer' }}>
                    <div className="property-image-wrapper">
                      <img src={h.photoUrl} alt={h.address} className="property-image" style={{ filter: 'grayscale(0.3)' }} />
                      <div className="property-overlay-badge">
                        <span className="badge badge-closed">🤝 SOLD</span>
                      </div>
                      <a 
                        href={h.redfinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="property-redfin-link" 
                        title="View on Redfin"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                    
                    <div className="property-body">
                      <div className="property-price-row">
                        <div className="property-price" style={{ color: '#c084fc' }}>
                          {formatPrice(soldP)}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.2rem',
                          color: isOverList ? '#ef4444' : '#10b981'
                        }}>
                          {isOverList ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {isOverList ? `+${pct}% Over List` : `${pct}% Under List`}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Original List Price: {formatPrice(listP)}
                      </div>

                      <div className="property-address" title={h.address}>
                        {h.address}
                      </div>

                      <div className="property-specs">
                        <div className="spec-item"><strong>{h.beds}</strong> beds</div>
                        <div>•</div>
                        <div className="spec-item"><strong>{h.baths}</strong> baths</div>
                        <div>•</div>
                        <div className="spec-item"><strong>{h.sqft ? h.sqft.toLocaleString() : 'N/A'}</strong> sqft</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: PRICE REDUCTIONS */}
      {(activeSubFilter === 'all' || activeSubFilter === 'drops') && priceDropHomes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-drop">PRICE CUT</span>
            Price Cuts & Reductions ({priceDropHomes.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {priceDropHomes.map(h => (
              <div key={h.mlsId} className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={h.photoUrl} alt={h.address} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem' }}>{h.address}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {h.beds} beds • {h.baths} baths • {h.sqft ? h.sqft.toLocaleString() : 'N/A'} sqft • ${h.pricePerSqft}/sqft
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', textDecoration: 'line-through' }}>{formatPrice(h.oldPrice)}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--status-drop-text)' }}>{formatPrice(h.price)}</div>
                  </div>

                  <span className="badge badge-drop">
                    Drop -{formatPrice(h.dropAmount)}
                  </span>

                  <a href={h.redfinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    <ExternalLink size={14} /> Redfin
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
