const db = require('./db');

/**
 * Compares current scraped listings with database history to generate
 * daily change logs and a comprehensive Daily Summary Digest.
 */
function processDailyListingsAndSummarize(profileId, freshListings) {
  const existingListings = db.getListings(profileId);
  const existingMap = new Map(existingListings.map(l => [l.mlsId, l]));

  const todayStr = new Date().toISOString().split('T')[0];

  const newlyAdded = [];
  const newlyClosed = [];
  const priceDrops = [];
  const updatedAllListings = [];

  freshListings.forEach(item => {
    const existing = existingMap.get(item.mlsId);

    if (!existing) {
      // Brand new listing detected
      if (item.status === 'SOLD') {
        newlyClosed.push(item);
        db.addHistoryLog({
          profileId,
          mlsId: item.mlsId,
          eventType: 'CLOSED_SALE',
          address: item.address,
          price: item.soldPrice || item.price
        });
      } else {
        newlyAdded.push({ ...item, isNewListing: true });
        db.addHistoryLog({
          profileId,
          mlsId: item.mlsId,
          eventType: 'NEW_LISTING',
          address: item.address,
          price: item.price
        });
      }
      updatedAllListings.push({ ...item, firstSeenAt: todayStr, lastSeenAt: todayStr });
    } else {
      // Check status transition to SOLD
      if (existing.status !== 'SOLD' && item.status === 'SOLD') {
        newlyClosed.push(item);
        db.addHistoryLog({
          profileId,
          mlsId: item.mlsId,
          eventType: 'CLOSED_SALE',
          address: item.address,
          price: item.soldPrice || item.price,
          listPrice: existing.price
        });
      } else if (item.isNewListing || item.listDate === todayStr) {
        newlyAdded.push(item);
      }

      // Check price drop
      if (item.price < existing.price) {
        const dropAmount = existing.price - item.price;
        priceDrops.push({ ...item, oldPrice: existing.price, dropAmount });
        db.addHistoryLog({
          profileId,
          mlsId: item.mlsId,
          eventType: 'PRICE_CHANGE',
          address: item.address,
          oldPrice: existing.price,
          newPrice: item.price,
          dropAmount
        });
      }

      updatedAllListings.push({
        ...existing,
        ...item,
        lastSeenAt: todayStr
      });
    }
  });

  // Preserve existing listings not in this run
  existingListings.forEach(ex => {
    if (!freshListings.some(f => f.mlsId === ex.mlsId)) {
      updatedAllListings.push(ex);
    }
  });

  // Save updated listings DB
  db.saveListings(updatedAllListings);

  // Generate Digest Summary
  const profile = db.getProfileById(profileId);
  const summaryMarkdown = generateMarkdownDigest(todayStr, profile, newlyAdded, newlyClosed, priceDrops, updatedAllListings);

  const summaryData = {
    id: `summary-${profileId}-${todayStr}`,
    date: todayStr,
    profileId: profileId,
    profileName: profile.name,
    location: profile.location,
    newCount: newlyAdded.length,
    closedCount: newlyClosed.length,
    priceDropCount: priceDrops.length,
    totalActiveCount: updatedAllListings.filter(l => l.status === 'ACTIVE').length,
    metrics: calculateMetrics(newlyAdded, newlyClosed, updatedAllListings),
    newlyAddedHomes: newlyAdded,
    newlyClosedHomes: newlyClosed,
    priceDropHomes: priceDrops,
    summaryMarkdown: summaryMarkdown,
    updatedAt: new Date().toISOString()
  };

  db.saveDailySummary(summaryData);
  return summaryData;
}

function calculateMetrics(newlyAdded, newlyClosed, allListings) {
  const activeHomes = allListings.filter(l => l.status === 'ACTIVE');
  
  const avgPriceSqft = activeHomes.length > 0 
    ? Math.round(activeHomes.reduce((acc, h) => acc + (h.pricePerSqft || 0), 0) / activeHomes.length)
    : 0;

  const medianActivePrice = activeHomes.length > 0
    ? activeHomes.map(h => h.price).sort((a, b) => a - b)[Math.floor(activeHomes.length / 2)]
    : 0;

  // Closed sale premium/discount vs list price
  let avgSaleToListRatio = 0;
  if (newlyClosed.length > 0) {
    const ratios = newlyClosed.map(c => {
      const sale = c.soldPrice || c.price;
      const list = c.originalPrice || c.price;
      return list > 0 ? (sale / list) : 1;
    });
    avgSaleToListRatio = Number((ratios.reduce((a, b) => a + b, 0) / ratios.length * 100).toFixed(1));
  }

  return {
    avgPriceSqft,
    medianActivePrice,
    avgSaleToListRatio,
    activeCount: activeHomes.length
  };
}

function generateMarkdownDigest(dateStr, profile, newlyAdded, newlyClosed, priceDrops, allListings) {
  const formatPrice = (val) => val ? `$${val.toLocaleString()}` : 'N/A';

  let md = `# 🏠 Daily Redfin House Digest - ${dateStr}\n\n`;
  md += `**Search Profile:** ${profile.name} (${profile.location})\n`;
  md += `**Target Criteria:** Price: ${formatPrice(profile.minPrice)} - ${formatPrice(profile.maxPrice)} | Beds: ${profile.minBeds}+ | Baths: ${profile.minBaths}+\n\n`;

  md += `### 📊 Market Snapshot\n`;
  md += `- **🆕 Newly Added Active Homes:** ${newlyAdded.length}\n`;
  md += `- **🤝 Newly Closed / Sold Homes:** ${newlyClosed.length}\n`;
  md += `- **📉 Price Reductions:** ${priceDrops.length}\n`;
  md += `- **🏡 Total Active Matching Homes:** ${allListings.filter(l => l.status === 'ACTIVE').length}\n\n`;

  md += `---\n\n`;

  // Section 1: Newly Added Houses
  md += `## 🆕 Newly Added Houses (${newlyAdded.length})\n\n`;
  if (newlyAdded.length === 0) {
    md += `*No new homes added today matching your search filters.*\n\n`;
  } else {
    newlyAdded.forEach(h => {
      md += `#### 📍 [${h.address}](${h.redfinUrl})\n`;
      md += `- **Price:** ${formatPrice(h.price)} ($${h.pricePerSqft}/sqft)\n`;
      md += `- **Specs:** ${h.beds} beds, ${h.baths} baths, ${h.sqft ? h.sqft.toLocaleString() : 'N/A'} sqft\n`;
      md += `- **Type:** ${h.propertyType}\n`;
      md += `- **Listed:** ${h.listDate || dateStr}\n\n`;
    });
  }

  md += `---\n\n`;

  // Section 2: Newly Closed / Sold Houses
  md += `## 🤝 Newly Closed / Sold Houses (${newlyClosed.length})\n\n`;
  if (newlyClosed.length === 0) {
    md += `*No newly closed transactions reported today in this area.*\n\n`;
  } else {
    newlyClosed.forEach(h => {
      const soldP = h.soldPrice || h.price;
      const listP = h.originalPrice || h.price;
      const diff = soldP - listP;
      const pct = listP > 0 ? ((diff / listP) * 100).toFixed(1) : 0;
      const diffLabel = diff > 0 ? `+${pct}% Over List (+${formatPrice(diff)})` : (diff < 0 ? `${pct}% Under List (${formatPrice(diff)})` : `At List Price`);

      md += `#### 🏁 [${h.address}](${h.redfinUrl})\n`;
      md += `- **Sold Price:** ${formatPrice(soldP)} (${diffLabel})\n`;
      md += `- **Original List Price:** ${formatPrice(listP)}\n`;
      md += `- **Specs:** ${h.beds} beds, ${h.baths} baths, ${h.sqft ? h.sqft.toLocaleString() : 'N/A'} sqft\n`;
      md += `- **Closed Date:** ${h.soldDate || dateStr}\n\n`;
    });
  }

  md += `---\n\n`;

  // Section 3: Price Reductions
  if (priceDrops.length > 0) {
    md += `## 📉 Price Reductions (${priceDrops.length})\n\n`;
    priceDrops.forEach(h => {
      md += `- **[${h.address}](${h.redfinUrl})**: Reduced by **${formatPrice(h.dropAmount)}** from ${formatPrice(h.oldPrice)} ➔ **${formatPrice(h.price)}** ($${h.pricePerSqft}/sqft)\n`;
    });
    md += `\n`;
  }

  return md;
}

module.exports = {
  processDailyListingsAndSummarize,
  generateMarkdownDigest
};
