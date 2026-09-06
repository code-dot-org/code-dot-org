// What is drawn in the reader's language, and what is still drawn in English.
//
// The unit tests make the claim about `localizeBlocks` and `localizeToolbox`;
// only a browser shows that the translated definitions reach Blockly, that the
// `notranslate` container does not swallow them, and — the part no test can
// answer — what is left over. Under `?pseudo=1` every translated string comes
// back «áççéñtéd», so anything still plain ASCII did not go through the seam.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-locale.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/?pseudo=1', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(5000);

// A field, not a label: Blockly splits `define rule %1 which adds ability %2`
// into several fields around its inputs, so a translated label arrives here in
// pieces and only the first piece carries the opening bracket. Any marker at
// all is the test — the pseudo-locale accents every letter it touches.
const marked = t => /[«»áéíóúñçšýÁÉÍÓÚÑÇŠÝ]/.test(t);
const out = {};

// The drawers, and the words on the blocks in one of them.
out.drawers = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const toolbox = Blockly.getMainWorkspace().getToolbox();
  return toolbox
    .getToolboxItems()
    .map(item => item.getName?.() ?? null)
    .filter(Boolean);
});
out.drawersEnglish = out.drawers.filter(name => !marked(name));

// Every label Blockly actually drew, from the blocks on screen.
out.labels = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  return Blockly.getMainWorkspace()
    .getAllBlocks(false)
    .flatMap(block =>
      block.inputList.flatMap(input =>
        input.fieldRow
          .map(field => (field.getText?.() ?? '').trim())
          .filter(text => text.length > 1),
      ),
    );
});
out.labelsMarked = out.labels.filter(marked).length;
out.labelsEnglish = [...new Set(out.labels.filter(t => !marked(t)))].slice(
  0,
  25,
);
out.errors = errors.slice(0, 4);

// Expected: `drawersEnglish` empty, and `labelsEnglish` holding only NAMES —
// a rule's, an ability's, a property's — plus the descriptions a `.rule` file
// carries. Those are stored strings, and a stored string is never translated
// in place (specs/LOCALIZATION.md). Anything else appearing in that list is a
// label this seam does not reach, which is the thing to go and fix.
console.log(JSON.stringify(out, null, 1));
await b.close();
