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

  const towns = [
    { name: 'Lexington, MA', url: 'https://www.redfin.com/city/11266/MA/Lexington' },
    { name: 'Newton, MA', url: 'https://www.redfin.com/city/13274/MA/Newton' },
    { name: 'Belmont, MA', url: 'https://www.redfin.com/city/1471/MA/Belmont' },
    { name: 'Concord, MA', url: 'https://www.redfin.com/city/4156/MA/Concord' }
  ];

  for (const t of towns) {
    console.log(`\n==============================================`);
    console.log(`Fetching LIVE listings for: ${t.name}`);
    console.log(`==============================================`);
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.warn(e.message));
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

    console.log(`Found ${homes.length} total card nodes on Redfin page.`);

    let count = 0;
    homes.forEach(h => {
      const priceMatch = h.text.match(/\$([0-9,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ''), 10) : 0;
      
      const bedsMatch = h.text.match(/(\d+)\s*bed/i);
      const bathsMatch = h.text.match(/([\d.]+)\s*bath/i);
      const sqftMatch = h.text.match(/([\d,]+)\s*sq\s*ft/i);

      const beds = bedsMatch ? parseInt(bedsMatch[1], 10) : 0;
      const baths = bathsMatch ? parseFloat(bathsMatch[1]) : 0;
      const sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, ''), 10) : 0;

      if (h.title && h.title !== 'Loading...' && !h.title.includes('Advertisement') && price > 0 && h.href) {
        count++;
        if (count <= 3) {
          console.log(`\n📍 [REAL HOME #${count}] ${h.title}`);
          console.log(`   Price: $${price.toLocaleString()} | ${beds} beds | ${baths} baths | ${sqft} sqft`);
          console.log(`   Redfin URL: https://www.redfin.com${h.href}`);
        }
      }
    });
    console.log(`Extracted ${count} real listings for ${t.name}.`);
  }

  await browser.close();
})();
