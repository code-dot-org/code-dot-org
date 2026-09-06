// Is the toolbox still drawn like the rest of the lab?
//
// `src/blockly/toolboxStyle.ts` is a stylesheet aimed at Blockly's own class
// names — `.blocklyToolbox`, `.blocklyToolboxCategory`,
// `.blocklyToolboxSelected`, `.blocklyToolboxCategoryLabel` — which is the
// whole contract and none of it is ours. A Blockly upgrade that renames one
// does not fail: the rule stops matching, the toolbox quietly goes back to a
// grey strip in the browser's default font, and nothing says so.
//
// THREE OF THE RULES FIGHT AN INLINE STYLE and are the ones most worth
// watching, because they are the ones that break if Blockly stops writing the
// attribute, starts writing another, or changes what it writes: the strip's
// background, the selected row's background, and the empty icon's `display`.
//
// Checked in BOTH themes, because the point of the change was to use tokens
// rather than the two hardcoded hexes the shared Blockly themes carry
// (`#dddddd` and `#394450`) — and a token that resolves in light and not in
// dark looks correct exactly half the time.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-toolbox-style.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const read = () =>
  p.evaluate(() => {
    const toolbox = document.querySelector('.blocklyToolbox');
    if (!toolbox) {
      return {missing: 'no .blocklyToolbox'};
    }
    const row = toolbox.querySelector('.blocklyToolboxCategory');
    const selected = toolbox.querySelector('.blocklyToolboxSelected');
    const label = toolbox.querySelector('.blocklyToolboxCategoryLabel');
    const icon = toolbox.querySelector('.blocklyToolboxCategoryIcon');
    const style = el => (el ? getComputedStyle(el) : null);
    const rowStyle = style(row);
    const labelStyle = style(label);
    return {
      // The three that beat an inline style.
      strip: style(toolbox).backgroundColor,
      selected: selected ? style(selected).backgroundColor : null,
      icon: icon ? style(icon).display : null,
      // …and the ordinary ones, which only need the class names to hold.
      radius: rowStyle.borderRadius,
      rowHeight: Math.round(row.getBoundingClientRect().height),
      font:
        labelStyle.fontSize +
        ' ' +
        labelStyle.fontFamily.split(',')[0].replace(/["']/g, ''),
      selectedLabel: selected
        ? getComputedStyle(
            selected.querySelector('.blocklyToolboxCategoryLabel'),
          ).color
        : null,
    };
  });

const out = {};
await p.locator('.blocklyToolboxCategory').first().click();
await p.waitForTimeout(700);
out.light = await read();

// Through the Settings dropdown, which is how a learner does it.
await p
  .getByRole('button', {name: /settings/i})
  .first()
  .click();
await p.waitForTimeout(1000);
await p
  .getByRole('combobox')
  .filter({hasText: /Light|Dark/})
  .first()
  .selectOption('Dark')
  .catch(async () => {
    await p.getByText('Dark', {exact: true}).first().click();
  });
await p.waitForTimeout(1800);
await p.keyboard.press('Escape');
await p.waitForTimeout(1200);
await p.locator('.blocklyToolboxCategory').first().click();
await p.waitForTimeout(700);
out.dark = await read();
out.errors = errors.slice(0, 3);

// Expected, and the numbers are the point:
//   light  strip rgb(240,242,245)   dark  strip rgb(66,77,89)
//   both   selected rgb(0,129,143), its label white, icon `none`,
//          radius 4px, rows 24px, 14px Geist.
// A strip of rgb(221,221,221) or rgb(57,68,80) means the stylesheet stopped
// matching and Blockly's own theme is showing through.
console.log(JSON.stringify(out, null, 1));
await b.close();
