const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial default state
const initialData = {
  profiles: [
    {
      id: 'default-profile',
      name: 'Greater Boston Luxury Homes',
      location: 'Lexington, Newton, Belmont, Concord, MA',
      minPrice: 2000000,
      maxPrice: 3000000,
      minBeds: 3,
      maxBeds: 6,
      minBaths: 2,
      maxBaths: 6,
      minSqft: 2500,
      maxSqft: 6500,
      minGarage: 2,
      minYearBuilt: 1995,
      maxHoa: 0,
      propertyTypes: ['Single Family'],
      redfinUrl: 'https://www.redfin.com/city/11266/MA/Lexington',
      cronSchedule: '0 8 * * *',
      active: true,
      created: new Date().toISOString()
    }
  ],
  listings: [],
  historyLogs: [],
  dailySummaries: []
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDB() {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    saveDB(initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file, reinitializing:', err);
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Database helper operations
const db = {
  getProfiles: () => {
    const data = loadDB();
    return data.profiles || [];
  },

  getProfileById: (id) => {
    const profiles = db.getProfiles();
    return profiles.find(p => p.id === id) || profiles[0];
  },

  saveProfile: (profile) => {
    const data = loadDB();
    const index = data.profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      data.profiles[index] = { ...data.profiles[index], ...profile, updated: new Date().toISOString() };
    } else {
      data.profiles.push({ ...profile, id: profile.id || `profile-${Date.now()}`, created: new Date().toISOString() });
    }
    saveDB(data);
    return profile;
  },

  deleteProfile: (id) => {
    const data = loadDB();
    data.profiles = data.profiles.filter(p => p.id !== id);
    saveDB(data);
  },

  getListings: (profileId = null) => {
    const data = loadDB();
    let listings = data.listings || [];
    if (profileId) {
      listings = listings.filter(l => l.profileId === profileId);
    }
    return listings;
  },

  saveListings: (newListings) => {
    const data = loadDB();
    data.listings = newListings;
    saveDB(data);
  },

  getHistoryLogs: (limit = 50) => {
    const data = loadDB();
    const logs = data.historyLogs || [];
    return logs.slice(-limit).reverse();
  },

  addHistoryLog: (log) => {
    const data = loadDB();
    data.historyLogs = data.historyLogs || [];
    data.historyLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...log
    });
    saveDB(data);
  },

  getDailySummaries: (limit = 30) => {
    const data = loadDB();
    const summaries = data.dailySummaries || [];
    return summaries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  },

  getDailySummaryByDate: (dateStr) => {
    const summaries = db.getDailySummaries(100);
    return summaries.find(s => s.date === dateStr);
  },

  saveDailySummary: (summary) => {
    const data = loadDB();
    data.dailySummaries = data.dailySummaries || [];
    const existingIdx = data.dailySummaries.findIndex(s => s.date === summary.date && s.profileId === summary.profileId);
    if (existingIdx >= 0) {
      data.dailySummaries[existingIdx] = summary;
    } else {
      data.dailySummaries.push(summary);
    }
    saveDB(data);
    return summary;
  }
};

module.exports = db;
