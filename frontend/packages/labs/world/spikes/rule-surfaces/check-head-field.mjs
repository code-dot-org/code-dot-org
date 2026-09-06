// `RETURNS` lives on the body surface now. Does picking one there stick?
//
// The field is drawn on the head of a member's own surface and nowhere else,
// so nothing in the lab can see it go wrong: the block still renders and the
// rule still compiles, it just quietly says "does something" again. The check
// that matters is the whole loop — pick a value on the head, leave the
// surface, and ask the interface what the file says.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-head-field.mjs
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 110)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const ws = async fn =>
  p.evaluate(async body => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    // eslint-disable-next-line no-new-func
    return new Function('Blockly', `return (${body})(Blockly)`)(Blockly);
  }, fn.toString());

await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(4500);

const out = {};

// The interface keeps the field — it is what the file is written from — but
// does not draw it.
out.onInterface = await ws(B => {
  const blk = B.getMainWorkspace()
    .getAllBlocks(false)
    .find(x => x.type === 'world_rule_block');
  const f = blk.getField('RETURNS');
  return {
    id: blk.id,
    present: Boolean(f),
    drawn: f.isVisible(),
    was: f.getValue(),
  };
});

await p.evaluate(async id => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const w = Blockly.getMainWorkspace();
  w.getBlockById(id).getField('OPEN_BODY').onClick();
}, out.onInterface.id);
await p.waitForTimeout(3000);

out.onHead = await ws(B => {
  const head = B.getMainWorkspace().getBlockById('body-owner');
  const f = head.getField('RETURNS');
  return {
    drawn: f.isVisible(),
    editable: head.isEditable(),
    // The signature's gear: this surface cannot carry a rename yet.
    gear: Boolean(head.getIcon && head.getIcon('mutator')),
    options: f.getOptions ? f.getOptions().length : null,
  };
});

// Pick a different one, the way the dropdown does.
out.picked = await ws(B => {
  const f = B.getMainWorkspace().getBlockById('body-owner').getField('RETURNS');
  const next = f
    .getOptions()
    .map(o => o[1])
    .find(v => v !== f.getValue());
  f.setValue(next);
  return next;
});
await p.waitForTimeout(3000);

await p.getByText('← Back').first().click();
await p.waitForTimeout(3000);

// The interface is rebuilt from the file on the way back, so this is the file
// answering, not the snapshot the editor was holding.
out.backOnInterface = await ws(B => {
  const blk = B.getMainWorkspace()
    .getAllBlocks(false)
    .find(x => x.type === 'world_rule_block');
  return {now: blk.getField('RETURNS').getValue(), id: blk.id};
});
out.errors = errors.slice(0, 4);

// Expected: onInterface present but not drawn; onHead drawn, editable, no
// gear; backOnInterface.now equals `picked`.
console.log(JSON.stringify(out, null, 1));
await b.close();
