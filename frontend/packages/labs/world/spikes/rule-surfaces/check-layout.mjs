// Do any two top-level blocks in a stock rule land on top of each other?
//
// `layout` in scripts/rules/dsl.mjs places each root under the last, and it
// works out how tall a root is by COUNTING ROWS — a number it can only
// estimate, because it runs in node with no browser to ask. Every estimate
// that is too small is an overlap: the next root is drawn over the bottom of
// the one before it, and a learner opening the rule sees a `define trait`
// sitting across a paragraph.
//
// That is what happened the moment rules grew prose. A `world_doc` counted as
// one row, 34 pixels, and drew at 346 — so Patrol's first trait was placed ten
// rows too high and covered the purpose it was meant to sit under.
//
// So this measures the real thing: every rule on the shelf, laid out by
// Blockly, in a workspace of its own.
//
// A RULE HAS TO BE OPEN FIRST, and that is the whole trick. The `DO` input on
// `world_rule_step_in` is put there by an extension that runs only when the
// palette was built for a rule FILE — so a stock rule loaded while the editor
// is showing a world fails with "missing a(n) DO connection", which is what
// the first attempt did. Open any rule and the definitions are right; then a
// throwaway workspace can take all forty-seven — of the INTERFACE of each,
// which is what the editor draws and what the y positions have to fit.
//
// Going through the Rules menu instead was the second attempt and measured
// twelve, because twelve is what the demo project holds — and the rules with
// the most prose, and so the most to get wrong, are the thirty-five it does
// not.
//
//   yarn dev:isolated
//   node spikes/rule-surfaces/check-layout.mjs

import {chromium} from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);

// Any rule will do; what matters is that the palette is a rule file's.
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Gravity/})
  .first()
  .click();
await p.waitForTimeout(5000);

const out = JSON.parse(
  await p.evaluate(async () => {
    const {Blockly, STOCK_RULES, split} = await import(
      '/spikes/rule-surfaces/harness.ts'
    );
    const host = document.createElement('div');
    host.style.cssText =
      'position:absolute;left:-9999px;top:0;width:1400px;height:1000px';
    document.body.appendChild(host);
    const workspace = Blockly.inject(host, {readOnly: false});

    const clashes = [];
    const measured = [];
    let threw = null;
    try {
      for (const rule of STOCK_RULES) {
        let roots;
        try {
          Blockly.Events.disable();
          // THE INTERFACE, not the file — through the lab's own `split`,
          // which is what the editor uses. Every body comes out and goes
          // behind a pencil (specs/NEXT.md section 8), and the definitions
          // the editor registers have no `DO` input at all, so a raw stock
          // rule cannot be loaded into any workspace this page owns.
          // It is also the right thing to measure: the roots carry the y
          // positions `layout` computed, and what is drawn between them is
          // the interface.
          Blockly.serialization.workspaces.load(
            split(JSON.parse(rule.contents)).shown,
            workspace,
          );
          // A `world_doc` draws its markdown through React, and its height
          // is whatever that measured — which is not known on the frame the
          // block was created. Measured too soon, every page of prose is 34
          // pixels tall and no rule ever overlaps: this check passed with the
          // bug it was written for put back. Two frames is enough.
          await new Promise(settle =>
            requestAnimationFrame(() => requestAnimationFrame(settle)),
          );
          roots = workspace.getTopBlocks(false).map(block => {
            const at = block.getRelativeToSurfaceXY();
            return {
              type: block.type,
              top: at.y,
              bottom: at.y + block.getHeightWidth().height,
            };
          });
        } finally {
          Blockly.Events.enable();
        }
        roots.sort((one, two) => one.top - two.top);
        measured.push({rule: rule.id, roots: roots.length});
        for (let at = 1; at < roots.length; at++) {
          const over = roots[at - 1].bottom - roots[at].top;
          if (over > 0) {
            clashes.push({
              rule: rule.id,
              under: roots[at - 1].type,
              over: roots[at].type,
              by: Math.round(over),
            });
          }
        }
      }
    } catch (caught) {
      // Returned as TEXT: a Blockly error holds a reference to the workspace
      // that threw it, and Playwright answers "object reference chain is too
      // long" rather than saying what went wrong.
      threw = String(caught && caught.message).slice(0, 300);
    }
    workspace.dispose();
    host.remove();
    return JSON.stringify({
      shelf: STOCK_RULES.length,
      measured: measured.length,
      after: measured.length ? measured[measured.length - 1].rule : null,
      clashes,
      threw,
    });
  }),
);

// Expected: `measured` equal to `shelf`, and `clashes` empty. Anything in
// `clashes` names the rule and how many pixels one root reaches into the next
// — `rows()` in dsl.mjs is what to fix, and it should round UP, since a gap
// costs nothing and an overlap hides prose.
console.log(JSON.stringify({...out, errors: errors.slice(0, 3)}, null, 1));
await b.close();
