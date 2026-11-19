// Usage: node run.js   (needs playwright resolvable, e.g. NODE_PATH=$(npm root -g))
const {chromium} = require('playwright');
const S = __dirname;
require('fs').mkdirSync(S + '/screenshots', {recursive: true});
const keysmash = 'sdfghjkyhtgriuey76gfthjwqi87gfrtyuiop0987654edfghjkiuytrewsdfghjkloiuytrdcvbnmkiuytgfdsxcvbhjuytgfvbnmkjhgfdsdfghjkyhtgriuey76gfthjwqi87gfrtyuiop0987654edfghjkiuytrewsdfghjkloiuytrdcvbnmkiuytgfdsxcvbhjuytgfvbnmkjhgfdsxcvb';
const inputs = [keysmash, '(', '[', '*', '\\', '+', '?', 'a(b', '[a-', '\\', '(((', '**', 'a\\', '))', '{1', '(?<'];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1200, height: 800}});
  const log = {pageerrors: [], consoleErrors: [], consoleOther: [], regexpThrows: []};
  page.on('pageerror', e => log.pageerrors.push(e.message + ' | ' + (e.stack || '').split('\n').slice(0, 4).join(' <- ')));
  page.on('console', m => { (m.type() === 'error' ? log.consoleErrors : log.consoleOther).push(m.text().slice(0, 200)); });
  await page.addInitScript(() => {
    window.__re = [];
    const Orig = RegExp;
    window.RegExp = new Proxy(Orig, {
      construct(t, args, nt) {
        try { return Reflect.construct(t, args, nt); }
        catch (e) { window.__re.push({msg: e.message, stack: (e.stack || '').split('\n').slice(1, 5).join(' <- ')}); throw e; }
      },
    });
  });
  await page.goto('file://' + S + '/text-compression.html');
  await page.waitForSelector('.cm-content');
  console.log('loaded; compress output:', (await page.locator('#data').innerText()).split('\n')[0]);
  await page.screenshot({path: S + '/screenshots/textcompression-initial.png'});

  // Phase 1: dictionary editor
  const content = page.locator('.cm-content');
  for (const t of inputs) {
    await content.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type(t, {delay: 0});
    await page.waitForTimeout(50);
  }
  // multi-line dictionary with all hostile lines
  await content.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  for (const t of inputs) { await page.keyboard.type(t); await page.keyboard.press('Enter'); }
  await page.waitForTimeout(200);
  await page.screenshot({path: S + '/screenshots/textcompression-special-chars.png'});
  console.log('dictionary phase compress status:', (await page.locator('#data').innerText()).split('\n').pop() || '', '|', (await page.locator('#data').innerText()).replace(/\n/g, ' / ').slice(-90));
  console.log('after dictionary phase: pageerrors', log.pageerrors.length, 'regexpThrows', await page.evaluate(() => window.__re.length));

  // Phase 2: CM search panel, regexp on/off
  await content.click();
  await page.keyboard.press('Control+F');
  await page.waitForSelector('.cm-search input[name=search]');
  const search = page.locator('.cm-search input[name=search]');
  const re = page.locator('.cm-search input[name=re]');
  for (const on of [false, true]) {
    if ((await re.isChecked()) !== on) await re.check({force: true}).catch(async () => { await page.evaluate(() => document.querySelector('.cm-search input[name=re]').click()); });
    for (const t of inputs) {
      await search.fill('');
      await search.fill(t);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(30);
    }
    await page.screenshot({path: S + `/screenshots/textcompression-cmsearch-re-${on ? 'on' : 'off'}.png`});
  }
  // Replace field too
  await page.locator('.cm-search input[name=replace]').fill('(').catch(() => {});

  // Phase 3: Write your own dialog -> custom text
  await page.keyboard.press('Escape');
  await page.click('#writeYourOwn');
  for (const t of [keysmash, '(', '[a-', '\\']) {
    await page.fill('#selfEnteredPoem', t);
    await page.click('#continue-button');
    await page.click('#writeYourOwn');
  }
  await page.locator('#again-button').click().catch(() => {});
  // Phase 4: after custom poems, retype hostile dictionary
  for (const t of inputs) {
    await content.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete'); await page.keyboard.type(t);
  }
  await page.waitForTimeout(200);
  await page.screenshot({path: S + '/screenshots/textcompression-final.png'});

  const re_ = await page.evaluate(() => window.__re);
  console.log(JSON.stringify({pageerrors: log.pageerrors, consoleErrors: log.consoleErrors, regexpThrowsTotal: re_.length, regexpThrowsByCaller: re_.reduce((m, r) => { const k = (r.stack.match(/at (\w+) \(file/g) || []).slice(0,1).join(); m[k] = (m[k]||0)+1; return m; }, {}), regexpThrowMessages: [...new Set(re_.map(r => r.msg))]}, null, 1));
  await browser.close();
})();
