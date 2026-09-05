// Does the split editor work? Open a heavy rule, count the interface, click a
// pencil, count the body, come back. jsdom renders no Blockly, so this is the
// only place the answer lives.
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 120)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const blocks = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    return Blockly.getMainWorkspace()?.getAllBlocks(false).length ?? 0;
  });

/** Where the first `OPEN_BODY` button is on screen. */
const pencilAt = () =>
  p.evaluate(async () => {
    const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
    const ws = Blockly.getMainWorkspace();
    for (const block of ws?.getAllBlocks(false) ?? []) {
      const field = block.getField('OPEN_BODY');
      const root = field?.getSvgRoot?.();
      if (root) {
        // Bring it into view first: a block below the fold still reports a
        // rectangle, and a click at those coordinates lands somewhere else.
        ws.centerOnBlock(block.id);
        await new Promise(done => setTimeout(done, 400));
        const r = root.getBoundingClientRect();
        return {
          x: r.x + r.width / 2,
          y: r.y + r.height / 2,
          on: block.type,
          r: {w: r.width, h: r.height},
        };
      }
    }
    return null;
  });

const out = {};
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(4500);

out.onInterface = await blocks();
const pencil = await pencilAt();
out.pencil = pencil;

if (pencil) {
  await p.mouse.click(pencil.x, pencil.y);
  await p.waitForTimeout(2500);
}
out.inBody = await blocks();
out.header = await p.getByText('← Back').count();

if (out.header) {
  await p.getByText('← Back').first().click();
  await p.waitForTimeout(2500);
}
out.backOnInterface = await blocks();
out.errors = errors.slice(0, 3);
console.log(JSON.stringify(out, null, 1));
await b.close();
