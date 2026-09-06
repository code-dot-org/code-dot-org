// A member renamed in one rule, and the other rules that import it.
//
// `check-rename.mjs` watches one file follow a rename. This watches the
// PROJECT follow one, which is a different mechanism and fails differently:
// `renameMemberInSource` rewrites the other files, `carry` writes them, and
// the ordinary per-file save must then be skipped — `saveFile` closes over the
// sources of the render that made it, so saving after `carry` puts every other
// file back exactly as it was.
//
// WHAT THAT LOOKS LIKE, and it is the one failure here that is not silent:
//
//   No matching export in "world-project:rules/collisions.rule"
//     for import "CollisionSizeOfQuery" (world-project:rules/gravity.rule:3:8)
//
// The rule that was renamed no longer offers the old name; the four rules that
// call it were reverted to asking for it. `collision size of` is the member to
// drive because `climb`, `gravity`, `solid` and `teleport` all import it.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-rename-across-files.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 200)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const back = async () => {
  const b2 = p.getByText('← Back');
  if (await b2.count()) {
    await b2.first().click();
    await p.waitForTimeout(1500);
  }
};
const openRule = async name => {
  await back();
  await p.getByRole('button', {name: 'Rules'}).first().click();
  await p.waitForTimeout(1000);
  await p
    .getByRole('menuitem')
    .filter({hasText: new RegExp('^' + name)})
    .first()
    .click();
  await p.waitForTimeout(4500);
};
// Every Collisions_ block in every body of the rule now open. The calls live
// inside bodies, so each pencil has to be opened to see them.
const callsIn = async () => {
  const n = await p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    return Blockly.getMainWorkspace()
      .getAllBlocks(false)
      .filter(x => x.getField?.('OPEN_BODY')).length;
  });
  const found = [];
  for (let i = 0; i < n; i++) {
    await p.evaluate(async j => {
      const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
      const w = Blockly.getMainWorkspace();
      w.getAllBlocks(false)
        .filter(x => x.getField?.('OPEN_BODY'))
        [j]?.getField('OPEN_BODY')
        .onClick();
    }, i);
    await p.waitForTimeout(1400);
    found.push(
      ...(await p.evaluate(async () => {
        const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
        return Blockly.getMainWorkspace()
          .getAllBlocks(false)
          .map(x => x.type)
          .filter(t => /_Collisions_/.test(t));
      })),
    );
    await back();
  }
  return [...new Set(found)].sort();
};

const out = {};
await openRule('Gravity');
out.gravityBefore = await callsIn();

// Rename `collision size of` by typing over it, on its own body surface.
await openRule('Collisions');
out.typed = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const w = Blockly.getMainWorkspace();
  for (const blk of w.getAllBlocks(false)) {
    if (blk.type !== 'world_rule_block') continue;
    blk.getField('OPEN_BODY').onClick();
    await new Promise(r => setTimeout(r, 900));
    let item = w
      .getBlockById('body-owner')
      ?.getInput('ARGUMENTS')
      .connection.targetBlock();
    while (item) {
      if (
        item.type === 'world_signature_text' &&
        /collision size of/.test(item.getFieldValue('TEXT') ?? '')
      ) {
        item.getField('TEXT').showEditor_();
        return item.getFieldValue('TEXT');
      }
      item = item.getNextBlock();
    }
    return null;
  }
  return null;
});
await p.waitForTimeout(600);
await p.keyboard.press('Control+a');
await p.keyboard.type('hit size of', {delay: 80});
await p.keyboard.press('Enter');
await p.waitForTimeout(4500);

await openRule('Gravity');
out.gravityAfter = await callsIn();
out.errors = errors.slice(0, 4);

// Expected: `gravityBefore` holds `CollisionSizeOfQuery`, `gravityAfter` holds
// `HitSizeOfQuery` and not the old one, and `errors` is empty. A revert shows
// up as the old name still in `gravityAfter` and a bundler error saying
// collisions.rule does not export it.
console.log(JSON.stringify(out, null, 1));
await b.close();
