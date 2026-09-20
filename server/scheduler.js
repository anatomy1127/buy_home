const cron = require('node-cron');
const db = require('./db');
const { scrapeRedfinListings } = require('./redfinScraper');
const { processDailyListingsAndSummarize } = require('./summaryEngine');

const activeJobs = new Map();

/**
 * Initializes cron jobs for all active search profiles
 */
function initScheduler() {
  console.log('[Scheduler] Initializing automated daily house search scheduler...');
  const profiles = db.getProfiles();

  profiles.forEach(profile => {
    if (profile.active) {
      scheduleProfileJob(profile);
    }
  });
}

function scheduleProfileJob(profile) {
  if (activeJobs.has(profile.id)) {
    activeJobs.get(profile.id).stop();
    activeJobs.delete(profile.id);
  }

  const cronSchedule = profile.cronSchedule || '0 8 * * *'; // Default 8:00 AM daily
  console.log(`[Scheduler] Scheduling profile "${profile.name}" with cron pattern: "${cronSchedule}"`);

  if (cron.validate(cronSchedule)) {
    const job = cron.schedule(cronSchedule, async () => {
      console.log(`[Scheduler] Executing scheduled daily run for profile: "${profile.name}"`);
      await runSyncForProfile(profile.id);
    });
    activeJobs.set(profile.id, job);
  } else {
    console.warn(`[Scheduler] Invalid cron schedule for profile ${profile.id}: ${cronSchedule}`);
  }
}

async function runSyncForProfile(profileId) {
  const profile = db.getProfileById(profileId);
  if (!profile) {
    throw new Error(`Profile not found: ${profileId}`);
  }

  console.log(`[Scheduler] Running sync for "${profile.name}"...`);
  const freshListings = await scrapeRedfinListings(profile);
  const summary = processDailyListingsAndSummarize(profileId, freshListings);
  console.log(`[Scheduler] Sync completed for "${profile.name}". Added: ${summary.newCount}, Closed: ${summary.closedCount}, Price Drops: ${summary.priceDropCount}`);
  return summary;
}

module.exports = {
  initScheduler,
  scheduleProfileJob,
  runSyncForProfile
};
