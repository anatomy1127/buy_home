const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  console.log('Navigating to Redfin search page...');
  await page.goto('https://www.redfin.com/city/9312/CA/Irvine', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Locate card items
  const cards = await page.locator('div[data-rf-test-name="basicNode-homeCard"], .bp-Homecard').all();
  console.log(`Found ${cards.length} home cards on page!`);

  for (let i = 0; i < Math.min(5, cards.length); i++) {
    const card = cards[i];
    const text = await card.innerText();
    const title = await card.getAttribute('title').catch(() => '');
    const aria = await card.getAttribute('aria-label').catch(() => '');
    const href = await card.locator('a[href*="/home/"]').first().getAttribute('href').catch(() => '');
    const imgSrc = await card.locator('img').first().getAttribute('src').catch(() => '');

    console.log(`\n=== Home Listing #${i + 1} ===`);
    console.log('Title/Address:', title || aria);
    console.log('Text snippet:', text.replace(/\n+/g, ' | ').slice(0, 200));
    console.log('Link:', href ? `https://www.redfin.com${href}` : 'N/A');
    console.log('Image:', imgSrc);
  }

  await browser.close();
})();
