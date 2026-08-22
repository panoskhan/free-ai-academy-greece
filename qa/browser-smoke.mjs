import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173';

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(file));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(file);
  }
  return out;
}

function routeFor(file) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
  return rel === 'index.html' ? '/' : `/${rel}`;
}

const files = (await walk(ROOT)).sort();
const failures = [];
let pageCount = 0;
let buttonCount = 0;
let linkCount = 0;

const browser = await chromium.launch({ headless: true });

async function freshPage() {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', request => {
    if (request.url().startsWith(BASE)) {
      errors.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText || 'unknown'}`);
    }
  });
  return { context, page, errors };
}

for (const file of files) {
  const route = routeFor(file);
  pageCount += 1;
  console.log(`\n=== PAGE ${pageCount}/${files.length}: ${route} ===`);
  const base = await freshPage();
  try {
    const response = await base.page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response?.status() ?? 'NO_RESPONSE'}`);
    await base.page.waitForTimeout(250);
    if (!(await base.page.title())) failures.push(`${route}: missing title at runtime`);
    if (!(await base.page.locator('h1').count())) failures.push(`${route}: missing h1 at runtime`);
    if (base.errors.length) failures.push(`${route}: ${base.errors.join(' | ')}`);

    const buttons = await base.page.locator('button').evaluateAll(elements => elements.map((button, index) => ({
      index,
      text: (button.innerText || button.getAttribute('aria-label') || `button-${index}`).trim().slice(0, 100),
      disabled: button.disabled
    })));
    buttonCount += buttons.length;
    console.log(`Buttons discovered: ${buttons.length}`);

    for (const button of buttons) {
      if (button.disabled) continue;
      const test = await freshPage();
      try {
        const response2 = await test.page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (!response2?.ok()) throw new Error(`HTTP ${response2?.status() ?? 'NO_RESPONSE'}`);
        await test.page.waitForTimeout(150);
        const target = test.page.locator('button').nth(button.index);
        if (!(await target.count())) throw new Error('button disappeared before click');
        await target.scrollIntoViewIfNeeded();
        console.log(`  click button #${button.index}: ${button.text}`);
        await target.click({ timeout: 5000 });
        await test.page.waitForTimeout(200);
        if (test.errors.length) throw new Error(test.errors.join(' | '));
      } catch (error) {
        failures.push(`${route} :: button #${button.index} [${button.text}]: ${error.message}`);
      } finally {
        await test.context.close();
      }
    }

    const links = await base.page.locator('a[href]').evaluateAll(elements => elements.map((anchor, index) => ({
      index,
      href: anchor.href,
      text: (anchor.innerText || anchor.getAttribute('aria-label') || `link-${index}`).trim().slice(0, 100),
      download: anchor.hasAttribute('download'),
      target: anchor.getAttribute('target') || ''
    })).filter(link => link.href.startsWith(BASE)));
    linkCount += links.length;
    console.log(`Internal links discovered: ${links.length}`);

    for (const link of links) {
      const test = await freshPage();
      try {
        const response2 = await test.page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (!response2?.ok()) throw new Error(`HTTP ${response2?.status() ?? 'NO_RESPONSE'}`);
        await test.page.waitForTimeout(100);
        const target = test.page.locator('a[href]').nth(link.index);
        if (!(await target.count())) throw new Error('link disappeared before click');
        console.log(`  click link #${link.index}: ${link.text}`);

        if (link.download) {
          const downloadPromise = test.page.waitForEvent('download', { timeout: 5000 });
          await target.click({ timeout: 5000 });
          await downloadPromise;
        } else if (link.target === '_blank') {
          const popupPromise = test.page.waitForEvent('popup', { timeout: 5000 });
          await target.click({ timeout: 5000 });
          const popup = await popupPromise;
          await popup.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
          if (!popup.url().startsWith(BASE)) throw new Error(`popup navigated outside site: ${popup.url()}`);
          if (!(await popup.title())) throw new Error('popup destination has no title');
          await popup.close();
        } else {
          await target.click({ timeout: 5000 });
          await test.page.waitForTimeout(100);
          const current = test.page.url();
          if (!current.startsWith(BASE)) throw new Error(`navigated outside site: ${current}`);
          if (!(await test.page.title())) throw new Error('destination has no title');
        }
        if (test.errors.length) throw new Error(test.errors.join(' | '));
      } catch (error) {
        failures.push(`${route} :: link #${link.index} [${link.text}] -> ${link.href}: ${error.message}`);
      } finally {
        await test.context.close();
      }
    }
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  } finally {
    await base.context.close();
  }
}

await browser.close();
console.log(`\nPages tested: ${pageCount}`);
console.log(`Buttons clicked: ${buttonCount}`);
console.log(`Internal links clicked: ${linkCount}`);

if (failures.length) {
  console.error(`FAILURES: ${failures.length}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Browser A-to-Z smoke test passed.');
