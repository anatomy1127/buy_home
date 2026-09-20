import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, ExternalLink, Tag } from 'lucide-react';

export default function ListingsExplorer({ listings, onSelectProperty }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const filteredListings = listings.filter(l => {
    // Search query
    if (searchTerm && !l.address.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter === 'ACTIVE' && l.status !== 'ACTIVE') return false;
    if (statusFilter === 'SOLD' && l.status !== 'SOLD') return false;
    if (statusFilter === 'NEW' && !l.isNewListing) return false;
    if (statusFilter === 'DROP' && !l.isPriceDrop) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'sqft-desc') return (b.sqft || 0) - (a.sqft || 0);
    if (sortBy === 'ppsqft-asc') return (a.pricePerSqft || 0) - (b.pricePerSqft || 0);
    return 0;
  });

  const formatPrice = (val) => val ? `$${val.toLocaleString()}` : 'N/A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Search & Sorting Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search address or neighborhood..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.9rem 0.55rem 2.2rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem'
            }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Homes (${listings.length})` },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'SOLD', label: 'Sold Only' },
            { id: 'NEW', label: '🆕 New Today' },
            { id: 'DROP', label: '📉 Price Drops' }
          ].map(f => (
            <button
              key={f.id}
              className={`btn ${statusFilter === f.id ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(f.id)}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} color="var(--text-muted)" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <option value="newest">Sort: Default / Listed Date</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="sqft-desc">Sqft: Largest First</option>
            <option value="ppsqft-asc">$/Sqft: Best Value</option>
          </select>
        </div>

      </div>

      {/* Grid of Listings */}
      {filteredListings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No matching homes found for the selected status and search term.
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map(h => {
            const isSold = h.status === 'SOLD';
            const priceVal = isSold ? (h.soldPrice || h.price) : h.price;

            return (
              <div key={h.mlsId} className="glass-panel property-card" onClick={() => onSelectProperty(h)} style={{ cursor: 'pointer' }}>
                <div className="property-image-wrapper">
                  <img src={h.photoUrl} alt={h.address} className="property-image" />
                  <div className="property-overlay-badge">
                    {isSold ? (
                      <span className="badge badge-closed">🤝 SOLD</span>
                    ) : h.isNewListing ? (
                      <span className="badge badge-new">🆕 NEW ACTIVE</span>
                    ) : h.isPriceDrop ? (
                      <span className="badge badge-drop">📉 PRICE DROP</span>
                    ) : (
                      <span className="badge badge-new" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>ACTIVE</span>
                    )}
                  </div>
                  <a 
                    href={h.redfinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="property-redfin-link" 
                    title="Open on Redfin"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                
                <div className="property-body">
                  <div className="property-price-row">
                    <div className="property-price" style={{ color: isSold ? '#c084fc' : 'var(--text-primary)' }}>
                      {formatPrice(priceVal)}
                    </div>
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
            );
          })}
        </div>
      )}

    </div>
  );
}
