// `define event` is edited the same way `define block` is, on a surface of its
// own — but it has no body, and that is the whole interest of it.
//
// An event is a DECLARATION: it makes a hat, and the blocks that run for it
// live under that hat in whatever file cares. So there is nothing to split out
// of it, and `hasBody` must stay false — its `next` is the member chain, and
// reading that as a body would move the rest of the rule inside the event.
// What it has is a signature, so it earns a pencil and a surface holding the
// head and nothing else.
//
// Its arguments are CHOICES, not the typed `argument`: an event's parameter is
// a filter, and a filter over "any number" is a comparison rather than a hat.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-event.mjs
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 130)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
// `Input` declares the key events.
await p
  .getByRole('menuitem')
  .filter({hasText: /^Input/})
  .first()
  .click();
await p.waitForTimeout(5000);

const eventBlock = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const blk = Blockly.getMainWorkspace()
      .getAllBlocks(false)
      .find(x => x.type === 'world_rule_event');
    return {
      id: blk.id,
      // No gear: the bubble is gone from both designers.
      icons: blk.getIcons ? blk.getIcons().length : null,
      pencil: Boolean(blk.getField('OPEN_BODY')),
      rows: blk.inputList.map(i => `${i.name || '(unnamed)'}:${i.isVisible()}`),
      parts: (blk.parts_ ?? []).map(x =>
        x.kind === 'label' ? x.text : `${x.type}:${x.name}`,
      ),
    };
  });

const out = {};
out.onInterface = await eventBlock();

await p.evaluate(async id => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  Blockly.getMainWorkspace().getBlockById(id).getField('OPEN_BODY').onClick();
}, out.onInterface.id);
await p.waitForTimeout(3000);

out.onSurface = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  const items = [];
  let item = head.getInput('ARGUMENTS')?.connection?.targetBlock();
  while (item) {
    items.push(item.type.replace('world_signature_', ''));
    item = item.getNextBlock();
  }
  return {
    type: head.type,
    movable: head.isMovable(),
    items,
    rows: head.inputList.map(i => `${i.name || '(unnamed)'}:${i.isVisible()}`),
  };
});
out.drawers = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  return Blockly.getMainWorkspace()
    .getToolbox()
    .getToolboxItems()
    .map(i => (i.getName ? i.getName() : i.name_))
    .filter(Boolean);
});

// An edit here has to reach the file, the same way a `define block`'s does.
await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  let item = head.getInput('ARGUMENTS').connection.targetBlock();
  while (item && item.type !== 'world_signature_text') {
    item = item.getNextBlock();
  }
  item.setFieldValue('goes down', 'TEXT');
});
await p.waitForTimeout(3500);
await p.getByText('← Back').first().click();
await p.waitForTimeout(3500);
out.afterEdit = (await eventBlock()).parts;
out.errors = errors.slice(0, 4);

// Expected: a pencil and no icons on the interface, with ARGUMENTS hidden
// there and drawn on the surface; the head unmovable, holding `choice` and
// `text`; ONE drawer, because there is nowhere on this surface to put a
// statement; and the edit landing in the parts — `is pressed` becoming
// `goes down`.
console.log(JSON.stringify(out, null, 1));
await b.close();
