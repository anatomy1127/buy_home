import React, { useState, useEffect } from 'react';
import { Sliders, Save, Plus, Trash2, Check, Clock, Link as LinkIcon, MapPin, DollarSign, Home } from 'lucide-react';

export default function FilterManager({ profiles, activeProfile, onSaveProfile, onDeleteProfile, onSelectProfile }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    minPrice: 500000,
    maxPrice: 2000000,
    minBeds: 3,
    maxBeds: 5,
    minBaths: 2,
    maxBaths: 4,
    minSqft: 2500,
    minGarage: 2,
    minYearBuilt: 1995,
    maxHoa: 500,
    propertyTypes: ['Single Family'],
    redfinUrl: '',
    cronSchedule: '0 8 * * *'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activeProfile) {
      setFormData({
        id: activeProfile.id || '',
        name: activeProfile.name || '',
        location: activeProfile.location || '',
        minPrice: activeProfile.minPrice || 2000000,
        maxPrice: activeProfile.maxPrice || 3000000,
        minBeds: activeProfile.minBeds || 3,
        maxBeds: activeProfile.maxBeds || 6,
        minBaths: activeProfile.minBaths || 2,
        maxBaths: activeProfile.maxBaths || 6,
        minSqft: activeProfile.minSqft || 2500,
        minGarage: activeProfile.minGarage || 2,
        minYearBuilt: activeProfile.minYearBuilt || 1995,
        maxHoa: activeProfile.maxHoa || 0,
        propertyTypes: activeProfile.propertyTypes || ['Single Family'],
        redfinUrl: activeProfile.redfinUrl || '',
        cronSchedule: activeProfile.cronSchedule || '0 8 * * *'
      });
    }
  }, [activeProfile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      let updatedTypes = [...formData.propertyTypes];
      if (checked) {
        updatedTypes.push(value);
      } else {
        updatedTypes = updatedTypes.filter(t => t !== value);
      }
      setFormData(prev => ({ ...prev, propertyTypes: updatedTypes }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateNew = () => {
    const newP = {
      id: `profile-${Date.now()}`,
      name: 'New Search Area',
      location: 'Austin, TX',
      minPrice: 400000,
      maxPrice: 1200000,
      minBeds: 3,
      maxBeds: 5,
      minBaths: 2,
      maxBaths: 4,
      minSqft: 1500,
      maxHoa: 300,
      propertyTypes: ['Single Family'],
      redfinUrl: '',
      cronSchedule: '0 8 * * *'
    };
    onSaveProfile(newP);
    onSelectProfile(newP.id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
      
      {/* Main Form */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={22} color="var(--accent-primary)" />
            Customize Search Filters
          </h2>
          {savedSuccess && (
            <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={18} /> Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Profile Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="e.g. Irvine SFH Under $2M" 
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Target Location (City / Zip Code)
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
                  placeholder="e.g. Irvine, CA or 92618" 
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem 0.65rem 2.2rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
                <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* Redfin Custom URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Redfin Saved Search URL (Optional Direct Override)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="url" 
                name="redfinUrl" 
                value={formData.redfinUrl} 
                onChange={handleChange}
                placeholder="https://www.redfin.com/city/9312/CA/Irvine/..." 
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem 0.65rem 2.2rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <LinkIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              You can paste a full Redfin search URL directly from your browser to preserve precise map boundaries or saved search parameters.
            </p>
          </div>

          {/* Price Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Minimum Price ($)
              </label>
              <input 
                type="number" 
                name="minPrice" 
                value={formData.minPrice} 
                onChange={handleChange}
                step="50000"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Maximum Price ($)
              </label>
              <input 
                type="number" 
                name="maxPrice" 
                value={formData.maxPrice} 
                onChange={handleChange}
                step="50000"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Beds, Baths, Sqft, Garage, Year Built */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Min Beds
              </label>
              <select name="minBeds" value={formData.minBeds} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+ Beds</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Min Baths
              </label>
              <select name="minBaths" value={formData.minBaths} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                {[1, 1.5, 2, 2.5, 3, 4, 5].map(n => <option key={n} value={n}>{n}+ Baths</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Min Sqft
              </label>
              <input type="number" name="minSqft" value={formData.minSqft} onChange={handleChange} step="100" style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Min Garage
              </label>
              <select name="minGarage" value={formData.minGarage} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+ Spots</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Min Year Built
              </label>
              <input type="number" name="minYearBuilt" value={formData.minYearBuilt} onChange={handleChange} step="1" style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Property Types
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {['Single Family', 'Townhouse', 'Condo', 'Multi-Family'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    value={type} 
                    checked={formData.propertyTypes.includes(type)}
                    onChange={handleChange}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Daily Schedule */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Automated Daily Search Schedule
            </label>
            <div style={{ position: 'relative' }}>
              <select 
                name="cronSchedule" 
                value={formData.cronSchedule} 
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.9rem 0.65rem 2.2rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              >
                <option value="0 8 * * *">Every Morning at 8:00 AM</option>
                <option value="0 18 * * *">Every Evening at 6:00 PM</option>
                <option value="0 8,18 * * *">Twice Daily (8:00 AM & 6:00 PM)</option>
                <option value="0 * * * *">Hourly Sync (Frequent Update)</option>
              </select>
              <Clock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Save & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Search Profile
            </button>
            
            {profiles.length > 1 && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onDeleteProfile(formData.id)}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                <Trash2 size={16} /> Delete Profile
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Profile Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Home size={18} color="var(--accent-primary)" />
              Saved Profiles
            </h3>
            <button className="btn btn-secondary" onClick={handleCreateNew} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
              <Plus size={14} /> New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {profiles.map(p => {
              const isSelected = p.id === formData.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  style={{
                    padding: '0.9rem',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {p.location} • ${p.minPrice ? (p.minPrice/1000) + 'k' : '0'} - ${p.maxPrice ? (p.maxPrice/1000) + 'k' : 'Max'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
