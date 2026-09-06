// Does every block on a body surface know how big it is?
//
// A LOAD DOES NOT ALWAYS LAY OUT WHAT IT BUILT. Opening a heavy body left some
// of its blocks reporting a height and width of zero while claiming to be
// rendered and holding an SVG root — seventeen of the eighty-eight in
// Teleport's `use the pad`, every one of them a value nested inside another
// value. A block with no size draws as nothing, and a dropdown on one draws as
// an arrow with no block around it, which is how it was reported: "the block
// off the first `if` is blank, I only see the arrow floating there".
//
// `finishQueuedRenders` alone does not fix it, which is the tell: nothing had
// been queued. `layOut` in BlocklyFileEditor queues them by name after a load
// and flushes.
//
// Measured on `solid.rule`, which the starter project holds, rather than on
// the rule where it was noticed — the point is that no body has an unlaid
// block, not that one particular rule does not.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-body-layout.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
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

const unlaid = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const all = Blockly.getMainWorkspace().getAllBlocks(false);
    const zero = all.filter(block => {
      const size = block.getHeightWidth();
      return !size.width && !size.height;
    });
    return JSON.stringify({
      total: all.length,
      unlaid: zero.length,
      types: [...new Set(zero.map(block => block.type))].slice(0, 6),
    });
  });

const out = {interface: JSON.parse(await unlaid()), bodies: []};

// Every pencil on the rule, one at a time: the bodies differ in shape and the
// blocks that get missed are the deeply nested ones.
const pencils = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  return Blockly.getMainWorkspace()
    .getAllBlocks(false)
    .filter(block => block.getField?.('OPEN_BODY')).length;
});
for (let at = 0; at < Math.min(pencils, 5); at++) {
  await p.evaluate(async index => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const w = Blockly.getMainWorkspace();
    w.getAllBlocks(false)
      .filter(block => block.getField?.('OPEN_BODY'))
      [index]?.getField('OPEN_BODY')
      .onClick();
  }, at);
  await p.waitForTimeout(2200);
  out.bodies.push(JSON.parse(await unlaid()));
  const back = p.getByRole('button').filter({hasText: /^Back$/});
  if (await back.count()) {
    await back.first().click();
    await p.waitForTimeout(1600);
  }
}
out.errors = errors.slice(0, 3);

// Expected: `unlaid` is 0 everywhere. Anything else names the block types that
// were built and never measured; `layOut` in BlocklyFileEditor is what queues
// them, and it runs after every load that puts a document on screen.
console.log(JSON.stringify(out, null, 1));
await b.close();
