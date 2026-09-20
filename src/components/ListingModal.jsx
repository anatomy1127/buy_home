import React, { useState } from 'react';
import { X, ExternalLink, Home, DollarSign, Calculator, MapPin, Tag, Calendar } from 'lucide-react';

export default function ListingModal({ property, onClose }) {
  if (!property) return null;

  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(6.8);

  const priceVal = property.status === 'SOLD' ? (property.soldPrice || property.price) : property.price;
  const downPayment = (priceVal * downPaymentPct) / 100;
  const loanAmount = priceVal - downPayment;
  
  // 30-year monthly mortgage calculation
  const monthlyRate = interestRatePct / 100 / 12;
  const numPayments = 360;
  const monthlyPrincipalAndInterest = monthlyRate > 0
    ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  const propertyTaxEst = (priceVal * 0.012) / 12; // ~1.2% tax
  const homeInsuranceEst = 120;
  const totalMonthlyEst = Math.round(monthlyPrincipalAndInterest + propertyTaxEst + homeInsuranceEst);

  const formatPrice = (val) => val ? `$${Math.round(val).toLocaleString()}` : 'N/A';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }} onClick={onClose}>
      
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.65)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Hero Image */}
        <div style={{ position: 'relative', width: '100%', height: '320px', background: '#000' }}>
          <img 
            src={property.photoUrl} 
            alt={property.address} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
            {property.status === 'SOLD' ? (
              <span className="badge badge-closed" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>🤝 SOLD HOUSE</span>
            ) : property.isNewListing ? (
              <span className="badge badge-new" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>🆕 NEW ACTIVE HOUSE</span>
            ) : (
              <span className="badge badge-new" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>ACTIVE HOUSE</span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>{property.address}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={16} /> {property.city}, {property.state} {property.zip}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: property.status === 'SOLD' ? '#c084fc' : 'var(--text-primary)' }}>
                {formatPrice(priceVal)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ${property.pricePerSqft}/sqft
              </div>
            </div>
          </div>

          {/* Key Specs Bar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1rem', 
            background: 'var(--bg-secondary)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Bedrooms</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{property.beds}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Bathrooms</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{property.baths}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Square Feet</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{property.sqft ? property.sqft.toLocaleString() : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Type</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '0.25rem' }}>{property.propertyType}</div>
            </div>
          </div>

          {/* Mortgage Payment Calculator */}
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.75rem' }}>
              <Calculator size={18} /> Monthly Payment Estimator
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Down Payment %</label>
                <input 
                  type="number" 
                  value={downPaymentPct} 
                  onChange={(e) => setDownPaymentPct(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.4rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Interest Rate %</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={interestRatePct} 
                  onChange={(e) => setInterestRatePct(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.4rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Monthly</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                  ${totalMonthlyEst.toLocaleString()} <span style={{ fontSize: '0.8rem', fontStyle: 'normal', color: 'var(--text-muted)' }}>/ mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <a 
              href={property.redfinUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.8rem' }}
            >
              <ExternalLink size={18} /> View Full Listing on Redfin.com
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
