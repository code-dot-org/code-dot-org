// What breaking a rule into surfaces would buy, measured in a real browser.
//
// specs/NEXT.md §8 rests on an inference: the editor's cost is per-block
// construction with its SVG machinery (collapsing 80% of `solid` moved the tab
// switch 342ms → 341ms, so hiding a block does not help), therefore building
// 28 blocks instead of 473 should be roughly seventeen times cheaper. That is
// reasoning from a measurement, not a measurement.
//
// jsdom cannot settle it: it creates SVG nodes but runs no layout, which is
// exactly the cost in question. So this drives the lab's own dev server with
// Playwright and injects real workspaces into a real page, loading each rule
// twice — whole, then interface-only — and timing `Blockly.serialization`'s
// load, which is what a tab switch pays.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/measure.mjs
//
// Findings go in FINDINGS.md beside this file.

import {chromium} from 'playwright';

const LAB = process.env.WORLD_LAB_URL ?? 'http://localhost:5139/';
/** Every stock rule, or the ones named on the command line. */
const RULES = process.argv.slice(2);
/** Loads per variant. The first is discarded: it pays for Blockly's warm-up. */
const RUNS = 6;

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', error => console.error('page error:', error.message));

await page.goto(LAB, {waitUntil: 'domcontentloaded'});
// The lab's own module graph, through Vite: the same palette and the same
// stock rules the editor uses, so this measures the editor's workspace rather
// than a fixture that resembles one.
const results = await page.evaluate(
  async ({rules, runs}) => {
    const {
      Blockly,
      STOCK_RULES,
      buildDomainPalette,
      countBlocks,
      interfaceOnly,
      parseRuleMeta,
    } = await import('/spikes/rule-surfaces/harness.ts');

    const metas = STOCK_RULES.map(rule =>
      parseRuleMeta(`rules/${rule.id}`, rule.contents),
    ).filter(Boolean);
    const {blocks} = buildDomainPalette(metas, {allRuleModules: true});
    // The design system's `Registry` is what normally turns a definition's
    // extension OBJECTS into registered names, and it is not exported. A
    // no-op under each name is enough here: an extension adds behaviour to a
    // block, and what is being timed is building one. Both variants are
    // treated identically, so the comparison stands; the absolute numbers are
    // a floor, since a real editor also runs the extensions.
    const named = extension =>
      typeof extension === 'string' ? extension : extension?.name;
    for (const definition of blocks) {
      const extensions = [
        ...(definition.extensions ?? []),
        ...(definition.mixins ?? []),
      ]
        .map(named)
        .filter(Boolean);
      for (const name of extensions) {
        if (!Blockly.Extensions.isRegistered(name)) {
          Blockly.Extensions.register(name, function () {});
        }
      }
      const plain = {...definition, extensions, mixins: undefined};
      delete plain.mutator;
      Blockly.Blocks[definition.type] = {
        init() {
          this.jsonInit(plain);
        },
      };
    }

    const host = document.createElement('div');
    host.style.cssText = 'width:1200px;height:800px;position:absolute;top:0';
    document.body.appendChild(host);
    const workspace = Blockly.inject(host, {});

    const time = doc => {
      workspace.clear();
      const start = performance.now();
      Blockly.serialization.workspaces.load(doc, workspace);
      return performance.now() - start;
    };
    const median = xs =>
      [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

    const out = [];
    const chosen = rules.length > 0 ? rules : STOCK_RULES.map(rule => rule.id);
    for (const id of chosen) {
      const whole = JSON.parse(
        STOCK_RULES.find(rule => rule.id === id).contents,
      );
      const shape = interfaceOnly(whole);
      const run = doc => {
        const samples = [];
        for (let i = 0; i < runs; i++) {
          samples.push(time(doc));
        }
        return median(samples.slice(1));
      };
      out.push({
        id,
        wholeBlocks: countBlocks(whole),
        shapeBlocks: countBlocks(shape),
        wholeMs: run(whole),
        shapeMs: run(shape),
      });
    }
    workspace.dispose();
    host.remove();
    return out;
  },
  {rules: RULES, runs: RUNS},
);

const pad = (text, width) => String(text).padStart(width);
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
console.log(
  'rule            blocks  →  shape     whole ms  →  shape ms  saved',
);
for (const row of [...results].sort((a, b) => b.wholeMs - a.wholeMs)) {
  console.log(
    `${row.id.padEnd(15)}${pad(row.wholeBlocks, 6)}  →${pad(row.shapeBlocks, 6)}` +
      `${pad(row.wholeMs.toFixed(1), 13)}  →${pad(row.shapeMs.toFixed(1), 10)}` +
      `${pad(`${(row.wholeMs / row.shapeMs).toFixed(1)}×`, 7)}`,
  );
}
console.log(
  `\n${results.length} rules: ${sum(results, 'wholeBlocks')} blocks in ` +
    `${sum(results, 'wholeMs').toFixed(0)}ms → ${sum(results, 'shapeBlocks')} in ` +
    `${sum(results, 'shapeMs').toFixed(0)}ms ` +
    `(${(sum(results, 'wholeMs') / sum(results, 'shapeMs')).toFixed(1)}× overall)`,
);

await browser.close();
