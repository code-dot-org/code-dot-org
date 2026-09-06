// Renaming a `define block` by retyping its wording, and its callers.
//
// A designed member's NAME is its signature — `designedName(parts)` — so
// retyping a word in the `arguments` row renames the member, and every call to
// it has to follow. `reconcileMembers` does that rewriting, and this is the
// check that it is reached.
//
// IT LOOKS FINE WHEN IT IS BROKEN, which is why this exists. Left unreconciled
// the calls keep the old block type, `standInBlocks` mints a definition for the
// dangling type so nothing throws and nothing is drawn in red, and the rule
// quietly stops working. The tell is in the types inside a body: after the
// rename they must all name the NEW member.
//
// TYPED, NOT SET. The first draft of this drove `setFieldValue`, which is one
// committed change and passed while the editor was unusable: a person types,
// and Blockly writes the field on every keystroke as an intermediate change.
// Persisted, each of those was a rename — of the project, with a workspace
// reload — landing between two keypresses, and the block whose field was open
// went with it. So the probe holds down the keys.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-rename.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 140)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(5000);

const back = async () => {
  const b2 = p.getByText('← Back');
  if (await b2.count()) {
    await b2.first().click();
    await p.waitForTimeout(1600);
  }
};
const minted = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    return Object.keys(Blockly.Blocks)
      .filter(t => /SolidBodies_.*Query/.test(t))
      .sort();
  });
// Open the nth pencil on the interface and report what is inside.
const peek = async n => {
  await p.evaluate(async i => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const w = Blockly.getMainWorkspace();
    const pencils = w
      .getAllBlocks(false)
      .filter(x => x.getField?.('OPEN_BODY'));
    pencils[i]?.getField('OPEN_BODY').onClick();
  }, n);
  await p.waitForTimeout(1800);
  const seen = await p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const all = Blockly.getMainWorkspace().getAllBlocks(false);
    return {
      calls: all.map(x => x.type).filter(t => /SolidBodies_.*Query/.test(t)),
      unregistered: all.map(x => x.type).filter(t => !Blockly.Blocks[t]),
    };
  });
  await back();
  return seen;
};

const out = {};
out.mintedBefore = await minted();
out.body2Before = await peek(2);

// Rename the query by TYPING over the wording in its arguments stack.
await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const w = Blockly.getMainWorkspace();
  const blk = w
    .getAllBlocks(false)
    .find(
      x =>
        x.type === 'world_rule_block' && x.getFieldValue('RETURNS') !== 'none',
    );
  blk.getField('OPEN_BODY').onClick();
});
await p.waitForTimeout(2500);
out.was = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  let item = head.getInput('ARGUMENTS').connection.targetBlock();
  while (item && item.type !== 'world_signature_text')
    item = item.getNextBlock();
  window.__item = item.id;
  item.getField('TEXT').showEditor_();
  return item.getFieldValue('TEXT');
});
await p.waitForTimeout(600);
await p.keyboard.press('Control+a');
await p.keyboard.type('clamped between 0 and 1', {delay: 90});
// MID-TYPING, and this is the assertion the setFieldValue draft could not
// make: the block being typed into is still there, and the field editor with
// it. A keystroke that reached the project took both away.
out.midTyping = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const item = Blockly.getMainWorkspace().getBlockById(window.__item);
  return {
    alive: !!item,
    editing: !!document.querySelector('.blocklyHtmlInput'),
  };
});
await p.keyboard.press('Enter');
await p.waitForTimeout(4000);

// What the surface says once the commit has been through the project. The
// reload that a rename causes rebuilds this body from the held interface, so a
// stale one shows the wording that was typed over.
out.signature = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  let item = head?.getInput('ARGUMENTS').connection.targetBlock();
  const parts = [];
  while (item) {
    parts.push(item.getFieldValue('TEXT'));
    item = item.getNextBlock();
  }
  return parts;
});
await back();

out.mintedAfter = await minted();
out.body2After = await peek(2);
out.errors = errors.slice(0, 4);

// Expected: `midTyping` alive and still editing; `signature` ends in the new
// wording; `body2Before` calls `KeptBetween0And1Query` nine times;
// `body2After` calls `ClampedBetween0And1Query` nine times and the old name not
// at all. `mintedAfter` may still carry the old type — a definition registered
// earlier in the session outlives the member — but nothing in the file points
// at it, which is the thing that matters.
console.log(JSON.stringify(out, null, 1));
await b.close();
