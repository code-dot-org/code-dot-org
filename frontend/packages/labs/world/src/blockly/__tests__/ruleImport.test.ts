// The `(import…)` row on a `use rule` dropdown, and the seam behind it.
//
// The row is a sentinel, not a value, and the point of the machinery is that it
// never survives as one: a block left holding `__import_rule__` would generate
// `world.useRules([__import_rule__])` and fail at run time.

import {afterEach, describe, expect, it, vi} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {
  IMPORT_RULE_VALUE,
  requestRuleImport,
  setRuleImportHandler,
} from '../ruleImport';

afterEach(() => setRuleImportHandler(null));

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

describe('requestRuleImport', () => {
  it('resolves undefined when nothing is listening', async () => {
    // The headless code generator and the unit tests have no dialog; asking
    // there must be harmless rather than a crash or a hang.
    await expect(requestRuleImport()).resolves.toBeUndefined();
  });

  it('hands the request to a registered handler', async () => {
    setRuleImportHandler(() => Promise.resolve('rules/gravity'));

    await expect(requestRuleImport()).resolves.toBe('rules/gravity');
  });

  it('stops asking once the handler is cleared', async () => {
    // Unmounting the editor clears it, so a field on a disposed workspace
    // cannot open a dialog nobody owns.
    const handler = vi.fn(() => Promise.resolve('rules/gravity'));
    setRuleImportHandler(handler);
    setRuleImportHandler(null);

    await expect(requestRuleImport()).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });
});
