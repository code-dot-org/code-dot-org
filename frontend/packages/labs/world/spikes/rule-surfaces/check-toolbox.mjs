// One toolbox per surface, in a real editor.
//
// Two things jsdom cannot answer. Whether the flyout actually offers what the
// filter says it does — the toolbox is rebuilt by Blockly from the prop, and a
// filtered prop that never reaches it looks identical in a unit test. And
// whether swapping the toolbox while a body is open leaves the body alone:
// the prop changes when `editing` changes, and a re-injection there would
// throw away the surface the learner is standing on.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-toolbox.mjs
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

/** What the named drawer offers, by opening it and reading the flyout. */
const drawer = async name => {
  // Selected through Blockly rather than clicked: the category's label span
  // is covered by its own container, so a DOM click never lands.
  const opened = await p.evaluate(async wanted => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const toolbox = Blockly.getMainWorkspace().getToolbox();
    const item = toolbox
      .getToolboxItems()
      .find(i => (i.getName ? i.getName() : i.name_) === wanted);
    if (!item) {
      return false;
    }
    toolbox.setSelectedItem(item);
    return true;
  }, name);
  if (!opened) {
    return null;
  }
  await p.waitForTimeout(1200);
  return ws(B => {
    const flyout = B.getMainWorkspace().getToolbox()?.getFlyout();
    return (flyout?.getWorkspace()?.getTopBlocks(false) ?? []).map(x => x.type);
  });
};

const count = () => ws(B => B.getMainWorkspace().getAllBlocks(false).length);

await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(4500);

const out = {};
const onInterface = await drawer('Rule');
out.interfaceRule = onInterface;

await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const w = Blockly.getMainWorkspace();
  const blk = w.getAllBlocks(false).find(x => x.getField('OPEN_BODY'));
  blk.getField('OPEN_BODY').onClick();
});
await p.waitForTimeout(3000);
out.bodyBlocks = await count();
out.bodyRule = await drawer('Rule');
// …and the body is still there after the toolbox was swapped under it.
out.bodyBlocksAfterDrawer = await count();
out.errors = errors.slice(0, 4);

// Expected: interfaceRule holds the declarations and neither `world_return`
// nor `world_step_delta`; bodyRule holds exactly those two and no
// declaration; bodyBlocks is 36 and unchanged by opening a drawer.
console.log(JSON.stringify(out, null, 1));
await b.close();
