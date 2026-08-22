// The shelf's `subject` against what the rule actually declares.
//
// A camera rule's traits go on a CAMERA, and nothing about the trait NAMES says
// so — "Follows", "Eases", "Aimed" all read like an actor's. The shelf says it
// instead, for the import dialog and for the AI tutor, both of which otherwise
// tell a reader the trait names and let them assume.
//
// Written by hand, because deriving it would mean parsing twenty-nine rules on
// every turn that shows the shelf, and the biggest is 390,000 characters. So it
// is checked here instead: once, against the generated workspace, which is the
// same bargain `stockRuleSources` makes for the workspaces themselves.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../stock';

/** What each rule's traits are really about, read out of its workspace. */
const declared = (contents: string, id: string): Set<string> => {
  const meta = parseRuleMeta(`rules/${id}`, contents);
  return new Set((meta?.traits ?? []).map(trait => trait.subject ?? 'actor'));
};

describe('every stock rule', () => {
  it('says whose traits it offers, or offers an actor’s', () => {
    for (const rule of STOCK_RULES) {
      const subjects = declared(rule.contents, rule.id);
      // A rule with no traits at all claims nothing, and neither should the
      // shelf entry.
      if (!subjects.size) {
        expect(rule.subject).toBeUndefined();
        continue;
      }
      expect({id: rule.id, subject: rule.subject}).toEqual({
        id: rule.id,
        subject: subjects.has('camera') ? 'camera' : undefined,
      });
    }
  });

  it('does not mix an actor’s traits with a camera’s', () => {
    // The shelf carries one subject per rule, which is only honest while no
    // rule offers both. `specs/VIEWPORT.md` defers the `both` subject, so this
    // is the assumption written down rather than assumed.
    for (const rule of STOCK_RULES) {
      expect({
        id: rule.id,
        subjects: [...declared(rule.contents, rule.id)].sort(),
      }).toEqual({
        id: rule.id,
        subjects: expect.arrayContaining([]),
      });
      expect(declared(rule.contents, rule.id).size).toBeLessThanOrEqual(1);
    }
  });
});
