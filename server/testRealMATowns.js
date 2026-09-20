const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const targetTowns = [
    { name: 'Lexington, MA', url: 'https://www.redfin.com/city/36128/MA/Lexington' },
    { name: 'Newton, MA', url: 'https://www.redfin.com/city/11619/MA/Newton' },
    { name: 'Belmont, MA', url: 'https://www.redfin.com/city/27530/MA/Belmont' },
    { name: 'Concord, MA', url: 'https://www.redfin.com/city/28066/MA/Concord' }
  ];

  const allRealHomes = [];

  for (const t of targetTowns) {
    console.log(`\nFetching real live homes from Redfin for: ${t.name}...`);
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(e => console.warn(e.message));
    await page.waitForTimeout(3000);

    const homes = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div[data-rf-test-name="basicNode-homeCard"], .bp-Homecard'));
      return cards.map(c => {
        const text = c.innerText || '';
        const title = c.getAttribute('title') || c.getAttribute('aria-label') || '';
        const link = c.querySelector('a[href*="/home/"]');
        const href = link ? link.getAttribute('href') : '';
        const img = c.querySelector('img');
        const src = img ? img.getAttribute('src') : '';
        return { text, title, href, src };
      });
    });

    homes.forEach(h => {
      const priceMatch = h.text.match(/\$([0-9,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
      
      const bedsMatch = h.text.match(/(\d+)\s*bed/i);
      const bathsMatch = h.text.match(/([\d.]+)\s*bath/i);
      const sqftMatch = h.text.match(/([\d,]+)\s*sq\s*ft/i);

      const beds = bedsMatch ? parseInt(bedsMatch[1], 10) : 0;
      const baths = bathsMatch ? parseFloat(bathsMatch[1]) : 0;
      const sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, ''), 10) : 0;

      const isMA = h.title.includes('MA') || h.href.includes('/MA/');
      const notAd = !h.title.includes('Advertisement') && h.title !== 'Loading...';

      if (h.title && isMA && notAd && price > 0 && h.href) {
        allRealHomes.push({
          address: h.title,
          city: t.name.split(',')[0],
          state: 'MA',
          price: price,
          beds: beds,
          baths: baths,
          sqft: sqft,
          redfinUrl: `https://www.redfin.com${h.href}`,
          photoUrl: h.src
        });
      }
    });
  }

  console.log(`\n🎉 TOTAL REAL MA HOMES EXTRACTED: ${allRealHomes.length}`);
  allRealHomes.slice(0, 10).forEach((h, i) => {
    console.log(`\n[Real Home #${i+1}] ${h.address}`);
    console.log(`   Price: $${h.price.toLocaleString()} | ${h.beds} beds | ${h.baths} baths | ${h.sqft} sqft`);
    console.log(`   Redfin URL: ${h.redfinUrl}`);
  });

  await browser.close();
})();
