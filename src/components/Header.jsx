import React from 'react';
import { Home, RefreshCw, Sliders, LayoutDashboard, List, History, ExternalLink } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  profiles, 
  activeProfile, 
  onSelectProfile, 
  onRunSync, 
  isSyncing,
  lastSyncTime 
}) {
  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #e02b2b 0%, #991b1b 100%)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(224, 43, 43, 0.4)'
          }}>
            <Home size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', lineHeight: '1.2' }}>Redfin Daily Digest</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily House Matcher & Market Summary</p>
          </div>
        </div>

        {/* Profile Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Active Profile Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>PROFILE:</span>
            <select 
              value={activeProfile?.id || ''} 
              onChange={(e) => onSelectProfile(e.target.value)}
              style={{ 
                background: 'transparent', 
                color: 'var(--text-primary)', 
                border: 'none', 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#131926', color: '#fff' }}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Run Daily Sync Button */}
          <button 
            className="btn btn-primary" 
            onClick={onRunSync}
            disabled={isSyncing}
            style={{ minWidth: '160px' }}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing Redfin...' : 'Run Daily Sync'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginTop: '1.25rem', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'summary' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('summary')}
            style={{ 
              borderColor: activeTab === 'summary' ? 'var(--accent-primary)' : 'transparent',
              background: activeTab === 'summary' ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
            }}
          >
            <LayoutDashboard size={16} />
            Today's Summary
          </button>

          <button 
            className={`btn ${activeTab === 'explorer' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('explorer')}
            style={{ 
              borderColor: activeTab === 'explorer' ? 'var(--accent-primary)' : 'transparent',
              background: activeTab === 'explorer' ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
            }}
          >
            <List size={16} />
            Listings Explorer
          </button>

          <button 
            className={`btn ${activeTab === 'filters' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('filters')}
            style={{ 
              borderColor: activeTab === 'filters' ? 'var(--accent-primary)' : 'transparent',
              background: activeTab === 'filters' ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
            }}
          >
            <Sliders size={16} />
            Search & Filters
          </button>

          <button 
            className={`btn ${activeTab === 'history' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('history')}
            style={{ 
              borderColor: activeTab === 'history' ? 'var(--accent-primary)' : 'transparent',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
            }}
          >
            <History size={16} />
            Change History
          </button>
        </div>

        {/* Sync Status Badge */}
        {lastSyncTime && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Last Sync: <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{lastSyncTime}</span>
          </div>
        )}
      </div>
    </header>
  );
}
