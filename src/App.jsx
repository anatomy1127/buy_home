import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DailyDigest from './components/DailyDigest';
import ListingsExplorer from './components/ListingsExplorer';
import FilterManager from './components/FilterManager';
import HistoryLog from './components/HistoryLog';
import ListingModal from './components/ListingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [listings, setListings] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchProfiles();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeProfile?.id) {
      fetchSummary(activeProfile.id);
      fetchListings(activeProfile.id);
    }
  }, [activeProfile]);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data);
      if (data.length > 0 && !activeProfile) {
        setActiveProfile(data[0]);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  const fetchSummary = async (profileId) => {
    try {
      const res = await fetch(`/api/summaries/latest?profileId=${profileId}`);
      const data = await res.json();
      setDailySummary(data);
      if (data?.updatedAt) {
        setLastSyncTime(new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchListings = async (profileId) => {
    try {
      const res = await fetch(`/api/listings?profileId=${profileId}`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setHistoryLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleSelectProfile = (profileId) => {
    const found = profiles.find(p => p.id === profileId);
    if (found) {
      setActiveProfile(found);
    }
  };

  const handleRunSync = async () => {
    if (!activeProfile) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfile.id })
      });
      const summary = await res.json();
      setDailySummary(summary);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      await fetchListings(activeProfile.id);
      await fetchLogs();
    } catch (err) {
      console.error('Error triggering sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const saved = await res.json();
      await fetchProfiles();
      setActiveProfile(saved);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
      const updated = profiles.filter(p => p.id !== profileId);
      setProfiles(updated);
      if (updated.length > 0) {
        setActiveProfile(updated[0]);
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
    }
  };

  return (
    <div className="app-container">
      
      {/* Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profiles={profiles}
        activeProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
        onRunSync={handleRunSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'summary' && (
          <DailyDigest 
            summary={dailySummary} 
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        )}

        {activeTab === 'explorer' && (
          <ListingsExplorer 
            listings={listings} 
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        )}

        {activeTab === 'filters' && (
          <FilterManager 
            profiles={profiles}
            activeProfile={activeProfile}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {activeTab === 'history' && (
          <HistoryLog logs={historyLogs} />
        )}
      </main>

      {/* Property Detail Modal */}
      <ListingModal 
        property={selectedProperty} 
        onClose={() => setSelectedProperty(null)}
      />

    </div>
  );
}
