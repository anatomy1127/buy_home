const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { initScheduler, runSyncForProfile, scheduleProfileJob } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend in production if built
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes

// 1. Get all search profiles
app.get('/api/profiles', (req, res) => {
  try {
    const profiles = db.getProfiles();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Save/Update search profile
app.post('/api/profiles', (req, res) => {
  try {
    const profile = req.body;
    if (!profile.name || !profile.location) {
      return res.status(400).json({ error: 'Profile name and location are required' });
    }
    const saved = db.saveProfile(profile);
    scheduleProfileJob(saved);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete profile
app.delete('/api/profiles/:id', (req, res) => {
  try {
    db.deleteProfile(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Trigger manual search sync & summary generation
app.post('/api/sync/run', async (req, res) => {
  try {
    const { profileId } = req.body;
    const targetProfileId = profileId || db.getProfiles()[0]?.id;
    if (!targetProfileId) {
      return res.status(400).json({ error: 'No active profile available for sync' });
    }
    console.log(`[API] Manual sync triggered for profile ID: ${targetProfileId}`);
    const summary = await runSyncForProfile(targetProfileId);
    res.json(summary);
  } catch (err) {
    console.error('[API] Error running manual sync:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get daily summary digests
app.get('/api/summaries', (req, res) => {
  try {
    const summaries = db.getDailySummaries(30);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get latest daily summary for a profile
app.get('/api/summaries/latest', (req, res) => {
  try {
    const profileId = req.query.profileId;
    const summaries = db.getDailySummaries(30);
    const filtered = profileId ? summaries.filter(s => s.profileId === profileId) : summaries;
    
    if (filtered.length === 0) {
      return res.json(null);
    }
    res.json(filtered[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get listings with filtering and sorting
app.get('/api/listings', (req, res) => {
  try {
    const { profileId, status, isNew, isPriceDrop, sort } = req.query;
    let listings = db.getListings(profileId);

    if (status) {
      listings = listings.filter(l => l.status === status.toUpperCase());
    }
    if (isNew === 'true') {
      listings = listings.filter(l => l.isNewListing);
    }
    if (isPriceDrop === 'true') {
      listings = listings.filter(l => l.isPriceDrop);
    }

    if (sort === 'price-asc') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      listings.sort((a, b) => b.price - a.price);
    } else if (sort === 'sqft-desc') {
      listings.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
    } else if (sort === 'ppsqft-asc') {
      listings.sort((a, b) => (a.pricePerSqft || 0) - (b.pricePerSqft || 0));
    }

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get history change logs
app.get('/api/logs', (req, res) => {
  try {
    const logs = db.getHistoryLogs(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to React app index.html for SPA routing
app.use((req, res) => {
  const distIndex = path.join(__dirname, '../dist/index.html');
  if (require('fs').existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.send('API Backend Server is Running. Frontend SPA will be served once built.');
  }
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 Redfin House Digest Server running at http://localhost:${PORT}`);
  console.log(`====================================================`);
  initScheduler();

  // Perform initial auto-sync if DB has no listings yet
  const listings = db.getListings();
  if (listings.length === 0) {
    const profiles = db.getProfiles();
    if (profiles.length > 0) {
      console.log('[Init] No existing listings found in database. Performing initial sync...');
      runSyncForProfile(profiles[0].id).catch(err => console.warn('[Init] Auto sync notice:', err.message));
    }
  }
});
