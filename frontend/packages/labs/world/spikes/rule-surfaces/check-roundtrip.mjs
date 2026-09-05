// Does editing inside a body keep the file? Open one, edit it, leave, open a
// SECOND body, then come back to the first and look for the edit.
//
// The failure this is aimed at looked like success: the editor stored the
// edited body correctly and then wrote the file with the ORIGINAL one, so the
// surface showed the edit and the file did not. Losing the OTHER bodies is
// the same shape — a check that only looked at the edited one passed while
// four were being dropped.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-roundtrip.mjs
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

const count = () => ws(B => B.getMainWorkspace().getAllBlocks(false).length);
const pencils = () =>
  ws(B =>
    B.getMainWorkspace()
      .getAllBlocks(false)
      .filter(x => x.getField('OPEN_BODY'))
      .map(x => x.id),
  );

// The field's own handler, not a synthesized click at coordinates read
// earlier. Going Back re-renders the interface, and a rectangle captured
// before that points at empty canvas — which cost an afternoon reading it as
// a broken editor.
const clickPencil = async id => {
  await ws(
    new Function(
      'B',
      `const f = B.getMainWorkspace().getBlockById(${JSON.stringify(id)})
         .getField('OPEN_BODY');
       f.onClick();`,
    ),
  );
  await p.waitForTimeout(2500);
};

const back = async () => {
  const bar = p.getByText('← Back');
  if ((await bar.count()) === 0) {
    return false;
  }
  await bar.first().click();
  await p.waitForTimeout(2000);
  return true;
};

await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(4500);

const out = {};
out.members = (await pencils()).length;

await clickPencil((await pencils())[0]);
out.firstBody = await count();
// Delete one statement from the body's chain: a real edit, through Blockly.
await ws(B => {
  const w = B.getMainWorkspace();
  w.getTopBlocks(true)[0]?.getNextBlock()?.dispose(true);
});
await p.waitForTimeout(1500);
out.afterEdit = await count();

out.backWorked = await back();
out.backToInterface = await count();

// The other bodies must still be there…
await clickPencil((await pencils())[1]);
out.secondBody = await count();
await back();

// …and the edit must have stuck.
await clickPencil((await pencils())[0]);
out.firstBodyAgain = await count();
out.errors = errors.slice(0, 4);

// Expected: members 5, firstBody 35, afterEdit 34, backToInterface 14,
// secondBody a body rather than 14, firstBodyAgain 34.
console.log(JSON.stringify(out, null, 1));
await b.close();
