// A rule nobody has edited: what it looks like, and what it costs.
//
// specs/NEXT.md §2. An unedited rule is stored as a reference to the library's
// — `{"stock":"solid","version":"386de00d"}` — and resolved wherever the lab
// reads a project. The unit suite covers the resolution; what it cannot cover
// is every place that reads a file's contents WITHOUT going through
// `projectFiles`, and there were four. All four passed 4293 unit tests:
//
//   • the editor opened every unedited rule as an EMPTY workspace;
//   • the Rules menu read `Jump`, `Solid`, `Arrows` — file stems — where the
//     rest of the lab reads `Jumping`, `Solid Bodies`, `Arrow Keys`;
//   • the file tab did the same;
//   • the tutor lost the project's whole rule vocabulary.
//
// So this is the check that a reference is invisible from the front.
//
// AND THAT IT STAYS ONE. Copy-on-edit is only a saving if opening a rule is
// not an edit: the editor saves a workspace whole, so anything that fired a
// change on load would materialize half a megabyte for a learner who only
// looked. The project is read back out of sessionStorage to see.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-reference.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

const out = {};
/**
 * What the LATEST saved version of the project weighs, and how many of its
 * rules are still references.
 *
 * Per version, not per store: the mock keeps every version it is handed, so
 * the total triples the moment anything saves and says nothing about what a
 * project holds. The first draft of this measured the total and read three
 * snapshots of an unchanged project as growth.
 */
const saved = () =>
  p.evaluate(() => {
    const raw = sessionStorage.getItem('cdo-mock:world:simple:versionSources');
    if (!raw) {
      return {versions: 0};
    }
    const all = JSON.parse(raw);
    const ids = Object.keys(all);
    const latest = JSON.stringify(all[ids[ids.length - 1]]);
    const rules = Object.values(all[ids[ids.length - 1]].source.files).filter(
      file => (file.name ?? '').endsWith('.rule'),
    );
    return {
      versions: ids.length,
      bytes: latest.length,
      rules: rules.length,
      references: rules.filter(file => file.contents.startsWith('{"stock":'))
        .length,
    };
  });

await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
// The names the lab says, not the stems the files have.
out.menu = await p.getByRole('menuitem').allInnerTexts();
out.stemsInMenu = out.menu.filter(name =>
  ['Jump', 'Solid', 'Arrows', 'Motion', 'Collect', 'Score'].includes(name),
);

out.savedBefore = await saved();

await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(5000);

// The workspace the learner is looking at. A reference parsed as a workspace
// is an empty one, and an empty rule looks exactly like a rule that was lost.
out.blocks = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const all = Blockly.getMainWorkspace().getAllBlocks(false);
  return {count: all.length, root: all[0]?.type ?? null};
});
out.tab = await p
  .locator('[role="tab"], [class*="tab"]')
  .filter({hasText: /Solid/})
  .first()
  .innerText()
  .catch(() => null);

// Looked at, not edited. Nothing should have moved.
await p.waitForTimeout(2500);
out.savedAfterLooking = await saved();
out.errors = errors.slice(0, 4);

// Expected: `stemsInMenu` empty; `blocks` a `world_rule` root with the
// interface's dozen-odd blocks on it (the bodies are behind their pencils,
// §8); `tab` saying "Solid Bodies"; and `savedAfterLooking` the same size as
// `savedBefore` with all twelve of its rules still references — opening a
// rule is not editing it, and a learner who only looks pays nothing.
console.log(JSON.stringify(out, null, 1));
await b.close();
