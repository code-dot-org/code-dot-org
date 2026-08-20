// The `(import…)` row on a `use rule` dropdown, and the seam behind it.
//
// The row is a sentinel, not a value, and the point of the machinery is that it
// never survives as one: a block left holding `__import_rule__` would generate
// `world.useRules([__import_rule__])` and fail at run time.

import {afterEach, describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {setProjectRuleModules} from '../moduleOptions';
import {IMPORT_RULE_VALUE, setRuleImportHandler} from '../ruleImport';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {setProjectRuleMeta} from '../traitOptions';

afterEach(() => {
  setRuleImportHandler(null);
  setProjectRuleModules([]);
  setProjectRuleMeta([]);
});

/** A project `.rule` at `rules/<file>` declaring `name`, as the project holds it. */
const holds = (file: string, name: string, ability: string): void => {
  const meta = parseRuleMeta(
    `rules/${file}`,
    JSON.stringify({
      blocks: {
        blocks: [{type: 'world_rule', fields: {NAME: name, ABILITY: ability}}],
      },
    }),
  )!;
  setProjectRuleModules([[file, `rules/${file}`]]);
  setProjectRuleMeta([meta]);
  registerProjectRules([meta]);
};

describe('the use-rule dropdown', () => {
  // The definition hands Blockly the GENERATOR, not a snapshot of it — a
  // dropdown over a project's rules has to be asked afresh each time the menu
  // opens, and a static array would also have Blockly factor out whatever word
  // every label happens to share and stamp it beside the field.
  const options = () =>
    (
      DOMAIN_BLOCKS.find(b => b.type === 'world_use_rule')?.args0?.[0] as {
        options?: () => Array<[string, string]>;
      }
    ).options!();

  it('offers import last, after the rules already available', () => {
    const rows = options();
    expect(rows.at(-1)?.[1]).toBe(IMPORT_RULE_VALUE);
    expect(rows.length).toBeGreaterThan(1);
  });

  it('does not offer the rules every world already has', () => {
    // Space and Appearance are seeded into every world (WorldBuilder.rulesInPlay
    // and blockly/foundation), so offering them asks a learner to affirm a
    // tautology — and one of the two was the row a `use rule` block defaulted
    // to, which is how an unfinished block used to read "use rule Has Space".
    const labels = options().map(([label]) => label);
    expect(labels).not.toContain('Has Space');
    expect(labels).not.toContain('Has Appearance');
  });

  it('offers every rule the project holds, as one may require any of them', () => {
    // This used to leave out the rules a project ran by merely holding, since
    // a `use rule` naming one said nothing. Every rule is like that now, so
    // the block's only remaining meaning is a RULE's dependency — and "Drives
    // with Arrow Keys requires Responds to Input" is a true and useful thing
    // to be able to say.
    holds('input', 'Input', 'Responds to Input');
    expect(options().map(([label]) => label)).toContain('Responds to Input');
  });

  it('offers a project rule that shadows one of the engine’s', () => {
    // The engine's two are left out for the reason above; a project rule
    // DECLARING one is not, and the eject case is why. Naming it is what makes
    // `rulesInPlay` prefer the learner's version over the built-in it shadows,
    // so taking the row away would leave the shadow unable to come into play.
    holds('look', 'Appearance', 'Has Appearance');
    expect(options().map(([label]) => label)).toContain('Has Appearance');
  });

  it('never offers import as the only row', () => {
    // With no rules registered — a project holding none, which is now possible
    // for the whole list — a fresh block takes the first option as its value,
    // and a block whose value is the import sentinel generates an import of
    // `__import_rule__`.
    const rows = options();
    expect(rows[0]).toEqual(['(none)', '']);
  });

  it('is how gravity reaches a project at all', () => {
    // Gravity is no longer a built-in, so the list must not claim it — the only
    // route is the import row.
    expect(options().map(([label]) => label)).not.toContain('Has Gravity');
  });
});

// The seam itself — asking with nobody listening, registering, unregistering —
// is `libraryImport.test`. It is one mechanism now, and this file used to hold
// a copy of those three tests.
