// A `define block`'s signature is edited as blocks, on its own surface.
//
// The mutator is gone: the `arguments` row on the head holds `argument` and
// `text` blocks, and the stack IS the signature. What that has to survive is a
// round trip through two representations — blocks on the surface,
// `extraState.parts` in the file — and a rename that reaches the variable the
// implementation already reads.
//
// jsdom cannot answer any of it: none of these blocks exist without a
// workspace, and the failure mode is a parameter quietly rebinding to a new
// variable, which renders fine and compiles fine.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-arguments.mjs
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 130)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const drawers = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    return Blockly.getMainWorkspace()
      .getToolbox()
      .getToolboxItems()
      .map(i => (i.getName ? i.getName() : i.name_))
      .filter(Boolean);
  });

/** A block's rows, and the signature it currently stands for. */
const shapeOf = id =>
  p.evaluate(async blockId => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const w = Blockly.getMainWorkspace();
    const blk = blockId
      ? w.getBlockById(blockId)
      : w.getAllBlocks(false).find(x => x.type === 'world_rule_block');
    if (!blk) {
      return null;
    }
    return {
      id: blk.id,
      // No gear anywhere: the signature is not behind a bubble any more.
      icons: blk.getIcons ? blk.getIcons().length : null,
      rows: blk.inputList.map(i => `${i.name || '(unnamed)'}:${i.isVisible()}`),
      parts: (blk.parts_ ?? []).map(x =>
        x.kind === 'label' ? x.text : `${x.type}:${x.name}`,
      ),
    };
  }, id);

await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(5000);

const out = {};
out.interface = await shapeOf(null);
out.interfaceDrawers = (await drawers()).includes('Block');

await p.evaluate(async id => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  Blockly.getMainWorkspace().getBlockById(id).getField('OPEN_BODY').onClick();
}, out.interface.id);
await p.waitForTimeout(3000);

out.head = await shapeOf('body-owner');
out.bodyDrawers = (await drawers()).includes('Block');

// Rename an argument, which is a rename of the variable the body reads.
out.renamed = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  let item = head.getInput('ARGUMENTS').connection.targetBlock();
  while (item && item.type !== 'world_signature_argument') {
    item = item.getNextBlock();
  }
  const before = item.getFieldValue('TEXT');
  item.setFieldValue('amount', 'TEXT');
  return {before, after: item.getFieldValue('TEXT')};
});
await p.waitForTimeout(3500);
out.headParts = (await shapeOf('body-owner')).parts;

// A default is offered only where one means something, and follows the type.
out.defaultByType = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const head = Blockly.getMainWorkspace().getBlockById('body-owner');
  let item = head.getInput('ARGUMENTS').connection.targetBlock();
  while (item && item.type !== 'world_signature_argument') {
    item = item.getNextBlock();
  }
  const seen = {};
  for (const t of ['number', 'string', 'boolean', 'actor', 'vector', 'kind']) {
    item.setFieldValue(t, 'TYPE');
    await new Promise(done => setTimeout(done, 250));
    seen[t] = Boolean(item.getField('DEFAULT'));
  }
  // …and back, with a value, which is what the call site should end up with.
  item.setFieldValue('number', 'TYPE');
  await new Promise(done => setTimeout(done, 250));
  item.setFieldValue(5, 'DEFAULT');
  return seen;
});
await p.waitForTimeout(3500);

await p.getByText('← Back').first().click();
await p.waitForTimeout(4000);
out.interfaceParts = (await shapeOf(null)).parts;

// THE POINT OF A DEFAULT: the shadow block the call site comes up holding.
// Read off the toolbox, which is where a learner meets the block.
out.callSiteShadow = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const toolbox = Blockly.getMainWorkspace().getToolbox();
  const drawer = toolbox
    .getToolboxItems()
    .find(i => (i.getName ? i.getName() : i.name_) === 'Solid Bodies');
  toolbox.setSelectedItem(drawer);
  await new Promise(done => setTimeout(done, 1500));
  return toolbox
    .getFlyout()
    .getWorkspace()
    .getTopBlocks(false)
    .filter(x => x.type.includes('KeptBetween'))
    .flatMap(x =>
      x.inputList.flatMap(i => {
        const t = i.connection?.targetBlock();
        return t?.isShadow() ? [`${i.name}=${t.getFieldValue('NUM')}`] : [];
      }),
    );
});
out.errors = errors.slice(0, 4);

// Expected: no icons on either; RETURNS_ROW and ARGUMENTS hidden on the
// interface and visible on the head; the Block drawer only inside a body; the
// rename landing as `number:amount` on BOTH — exactly, with no `amount2`,
// which is what a parameter rebound to a second variable looks like; a default
// field for number/string/boolean and none for actor/vector/kind; and
// callSiteShadow `["N=5"]`, which is the whole reason a default exists.
console.log(JSON.stringify(out, null, 1));
await b.close();
