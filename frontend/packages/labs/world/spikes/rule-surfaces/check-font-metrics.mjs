// Blocks a few pixels out, in the first workspace of a page load only.
//
// A renderer measures the font ONCE, when the workspace is injected, and keeps
// the answer in its constants (`FIELD_TEXT_HEIGHT`, `FIELD_TEXT_BASELINE`).
// Injected before the web font arrives, those are measured in whatever face
// stood in — and every row is wrong by the difference for the life of that
// workspace. Which way it is wrong depends on the fallback: measured here it
// was 17 against 20, so blocks came up SHORTER; with a taller fallback they
// come up taller.
//
// What this reports is the same file measured twice: as the workspace the page
// loaded with, and after a switch away and back. The two must agree.
//
// A CAVEAT WORTH READING. The fault is a race — the font against the
// injection — and it stops reproducing as soon as the font is served from
// cache, which it is on any second run against a warm dev server. A run
// showing them equal is therefore not proof of the fix; it is only proof of no
// harm. What IS proof is the pair of measurements underneath: the constants
// differing between the two loads, and a reload being the only thing that
// applies new ones (`refreshTheme` recomputes them, and re-rendering a block
// keeps the layout it was built with — `queueRender` with the queue flushed
// changes nothing).
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-font-metrics.mjs
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:5139/', {waitUntil: 'domcontentloaded'});
await p.waitForTimeout(11000);

const shape = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const constants = Blockly.getMainWorkspace().getRenderer().getConstants();
    const rows = [
      ...document.querySelectorAll('.blocklyDraggable > .blocklyPath'),
    ]
      .map(x => {
        try {
          return Math.round(x.getBBox().height);
        } catch {
          return 0;
        }
      })
      .filter(h => h > 0)
      .sort((a, c) => c - a)
      .slice(0, 4);
    return {
      rows,
      textHeight: constants.FIELD_TEXT_HEIGHT,
      baseline: constants.FIELD_TEXT_BASELINE,
    };
  });

const out = {};
out.asPageLoaded = await shape();

// Away…
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Gravity/})
  .first()
  .click();
await p.waitForTimeout(4000);
// …and back to the file the page came up with.
await p.getByText('Platform World', {exact: false}).first().click();
await p.waitForTimeout(4500);
out.afterSwitchingBack = await shape();

out.agree =
  JSON.stringify(out.asPageLoaded.rows) ===
  JSON.stringify(out.afterSwitchingBack.rows);

console.log(JSON.stringify(out, null, 1));
await b.close();
