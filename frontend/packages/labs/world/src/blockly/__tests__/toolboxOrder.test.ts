// Where the rules sit in the toolbox, and what divides them from the rest.
//
// The strip is in two halves. Above the heading is what a learner has in EVERY
// project — the definition roots, the loop, the list, the arithmetic, and the
// engine's own `Space` and `Appearance` — which is the same list in the same
// order whatever has been imported. Below it is what THIS project imported,
// which is a different list per project and grows as one is built.
//
// They used to be interleaved, and the cost was paid by the half that never
// changes: `Math` moved down the strip every time a rule was imported, so it
// was somewhere different in each of two lessons and somewhere different again
// after a learner added a mechanic. A menu you have to re-find is a menu you
// stop reading.
//
// ORDER IS NOT SOMETHING A RENDER TEST CAN SEE CHEAPLY, and this file is why
// there is one at this level: the toolbox is an array long before it is DOM,
// and the array is where the decision is.

import {describe, expect, it} from 'vitest';

import {mouseRule} from '../../rules/stock';
import {buildDomainPalette, DOMAIN_TOOLBOX} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {TOOLBOX_HEADING} from '../toolboxStyle';

/** A row's name, with the heading marked so a reader can see the break. */
const shape = (toolbox: unknown): string[] =>
  (toolbox as Array<{name?: string; kind?: string}>).map(row =>
    row.kind === TOOLBOX_HEADING ? `— ${row.name} —` : (row.name ?? '?'),
  );

const headingAt = (toolbox: unknown): number =>
  (toolbox as Array<{kind?: string}>).findIndex(
    row => row.kind === TOOLBOX_HEADING,
  );

/**
 * The engine's own rules. Rule categories by construction, always-available
 * ones by nature — a position is not something a rule can invent
 * (`builtinMeta`), so they sit with `Math` and not with the imports.
 */
const BUILTIN_RULE_NAMES = ['Space', 'Appearance'];

describe('the toolbox', () => {
  it('has no heading when the project has no rules to put under one', () => {
    // A label for a list that is not there. `DOMAIN_TOOLBOX` is the constant
    // handed back when nothing has been imported, so this is the empty case.
    expect(headingAt(DOMAIN_TOOLBOX)).toBe(-1);
    expect(shape(DOMAIN_TOOLBOX)).toContain('Actor');
    expect(shape(DOMAIN_TOOLBOX)).toContain('Math');
    // …and the engine's rules are there, above where a heading would go.
    for (const name of BUILTIN_RULE_NAMES) {
      expect(shape(DOMAIN_TOOLBOX)).toContain(name);
    }
  });

  it('divides the always-there from this project’s, once there are some', () => {
    // The case that matters, because the second list is the one that grows. A
    // rule imported into a project must not push `Math` down the strip.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {fileKind: 'actor'});
    const rows = shape(toolbox);
    const at = headingAt(toolbox);
    const above = rows.slice(0, at);
    const below = rows.slice(at + 1);

    expect(
      (toolbox as Array<{kind?: string}>).filter(
        row => row.kind === TOOLBOX_HEADING,
      ),
    ).toHaveLength(1);
    // The two ends of the always-there half: what a learner opens to declare
    // something, and what they open to add up two numbers.
    expect(above).toContain('Actor');
    expect(above).toContain('Math');
    expect(above).toContain('Variables');
    // …the engine's rules with them, because they are always there too.
    for (const name of BUILTIN_RULE_NAMES) {
      expect(above).toContain(name);
      expect(below).not.toContain(name);
    }
    // …and this project's own on the other side.
    expect(below).toEqual([meta.name]);
  });

  it('keeps `Engine` with the language, not with the rules', () => {
    // It is offered only while writing a `.rule` and holds the primitives a
    // rule needs to do what the engine used to do for it — one of the
    // language's own categories, and it used to be appended after everything.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {
      fileKind: 'rule',
      ownRuleModule: 'rules/mouse',
    });
    const rows = shape(toolbox);
    const at = headingAt(toolbox);

    expect(rows).toContain('Engine');
    expect(rows.indexOf('Engine')).toBeLessThan(at);
  });

  it('says the heading is not a category, so nothing walks into it', () => {
    // Everything that filters the toolbox reads `.name` or `.blocks`, and a
    // row with neither is what broke three tests the moment this was added.
    // The `kind` is how each of them tells the difference — the toolbox filter,
    // the surface toolbox, and Blockly's own conversion all key off it.
    const meta = parseRuleMeta('rules/mouse', mouseRule)!;
    registerProjectRules([meta]);
    const {toolbox} = buildDomainPalette([meta], {fileKind: 'actor'});
    const heading = (toolbox as Array<{kind?: string; blocks?: unknown}>)[
      headingAt(toolbox)
    ];

    expect(heading.kind).toBe(TOOLBOX_HEADING);
    expect(heading.blocks).toBeUndefined();
  });
});
