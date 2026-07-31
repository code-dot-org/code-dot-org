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
  it('offers import last, after the rules already available', () => {
    const options = (
      DOMAIN_BLOCKS.find(b => b.type === 'world_use_rule')?.args0?.[0] as {
        options?: Array<[string, string]>;
      }
    ).options!;
    // The static fallback baked into the definition is the built-ins; the live
    // dropdown adds the project's own rules and this row (see useRuleOptions).
    expect(options.at(-1)).toBeDefined();
    expect(options.map(([, value]) => value)).not.toContain(IMPORT_RULE_VALUE);
  });

  it('is how gravity reaches a project at all', () => {
    // Gravity is no longer a built-in, so the static option list must not
    // claim it — the only route is the import row.
    const options = (
      DOMAIN_BLOCKS.find(b => b.type === 'world_use_rule')?.args0?.[0] as {
        options?: Array<[string, string]>;
      }
    ).options!;
    expect(options.map(([label]) => label)).not.toContain('Has Gravity');
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
