// Is a block in the toolbox the same size as the block you get from it?
//
// A FLYOUT IS ITS OWN WORKSPACE, with its own renderer and its own copy of the
// font metrics — `FIELD_TEXT_HEIGHT` and `FIELD_TEXT_BASELINE`, measured once
// when it is created. The main workspace already recovers from a font that
// arrives after injection (BlocklyFileEditor, "Re-measure when the web fonts
// land"); the flyout was left behind, so the two disagreed: 20/16 in the
// workspace against 17/14 in the flyout, measured. Every block in the toolbox
// was then drawn to a different height than the one you drag out of it.
//
// Which way it looks wrong depends on which face stood in while the real one
// loaded, so the same bug reads as "the toolbox blocks are too tall" on one
// machine and too short on another. Comparing the two workspaces says it
// without depending on that.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-flyout-metrics.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

// Open a category, which is both what fills the flyout and what the editor
// hangs the metric check on.
await p.locator('.blocklyToolboxCategory').first().click();
await p.waitForTimeout(1500);

const out = JSON.parse(
  await p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const main = Blockly.getMainWorkspace();
    const flyout = main.getFlyout().getWorkspace();
    const metric = one => {
      const c = one.getRenderer().getConstants();
      return [c.FIELD_TEXT_HEIGHT, c.FIELD_TEXT_BASELINE];
    };

    // The same block, built in both places. Built rather than dragged: a drag
    // is a gesture and this is a question about arithmetic.
    const compared = [];
    Blockly.Events.disable();
    try {
      for (const block of flyout.getTopBlocks(false).slice(0, 6)) {
        const mine = main.newBlock(block.type);
        mine.initSvg();
        mine.render();
        compared.push({
          type: block.type,
          inFlyout: Math.round(block.getHeightWidth().height),
          inWorkspace: Math.round(mine.getHeightWidth().height),
        });
        mine.dispose(false);
      }
    } finally {
      Blockly.Events.enable();
    }
    return JSON.stringify({
      metrics: {workspace: metric(main), flyout: metric(flyout)},
      compared,
      differing: compared.filter(one => one.inFlyout !== one.inWorkspace),
    });
  }),
);
out.errors = errors.slice(0, 3);

// Expected: the two metric pairs equal, and `differing` empty. A non-empty
// `differing` names the block types and both heights; the fix is
// `syncFlyoutMetrics` in BlocklyFileEditor, which asks the flyout to agree
// with the workspace when a category is opened.
console.log(JSON.stringify(out, null, 1));
await b.close();
