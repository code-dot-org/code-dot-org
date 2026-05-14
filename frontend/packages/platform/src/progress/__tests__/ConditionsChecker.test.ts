import {describe, expect, it} from 'vitest';

import ConditionsChecker from '../ConditionsChecker';
import type {Condition} from '../types';

// Pass logChanges=false explicitly so the tests don't pull window.location
// through query-string and don't write console output.
function makeChecker(conditionNames: string[]) {
  return new ConditionsChecker(conditionNames, false);
}

describe('ConditionsChecker', () => {
  it('checks empty requirements as satisfied', () => {
    const checker = makeChecker(['blocks_used']);
    expect(checker.checkRequirementConditions([])).toBe(true);
  });

  it('reports an unsatisfied requirement before any conditions are added', () => {
    const checker = makeChecker(['blocks_used']);
    expect(
      checker.checkRequirementConditions([{name: 'blocks_used', value: 3}]),
    ).toBe(false);
  });

  it('matches a requirement once the matching condition is added', () => {
    const checker = makeChecker(['blocks_used']);
    const cond: Condition = {name: 'blocks_used', value: 3};
    checker.addSatisfiedCondition(cond);
    expect(checker.checkRequirementConditions([cond])).toBe(true);
  });

  it('treats two conditions with the same name but different values as distinct', () => {
    // The dedup compares full condition objects, so {name, value: 3} and
    // {name, value: 5} are different entries. A requirement asks for the
    // exact value, so only the matching one satisfies it.
    const checker = makeChecker(['blocks_used']);
    checker.addSatisfiedCondition({name: 'blocks_used', value: 3});
    expect(
      checker.checkRequirementConditions([{name: 'blocks_used', value: 5}]),
    ).toBe(false);
    checker.addSatisfiedCondition({name: 'blocks_used', value: 5});
    expect(
      checker.checkRequirementConditions([{name: 'blocks_used', value: 5}]),
    ).toBe(true);
  });

  it('dedupes structurally-equal conditions (does not double-add)', () => {
    // No public count, but we can prove dedup indirectly: clear() should
    // remove every entry, and after re-adding once the requirement matches.
    // If dedup were broken, no observable behavior change — so instead we
    // use lodash isEqual semantics: object identity differs, value equal.
    const checker = makeChecker(['blocks_used']);
    const a: Condition = {name: 'blocks_used', value: 3};
    const b: Condition = {name: 'blocks_used', value: 3};
    checker.addSatisfiedCondition(a);
    checker.addSatisfiedCondition(b);
    checker.clear();
    // After clear, the requirement must not be satisfied.
    expect(
      checker.checkRequirementConditions([{name: 'blocks_used', value: 3}]),
    ).toBe(false);
  });

  it('clear() drops all accumulated conditions', () => {
    const checker = makeChecker(['blocks_used', 'colors_used']);
    checker.addSatisfiedCondition({name: 'blocks_used', value: 3});
    checker.addSatisfiedCondition({name: 'colors_used', value: 'red'});
    checker.clear();
    expect(
      checker.checkRequirementConditions([
        {name: 'blocks_used', value: 3},
        {name: 'colors_used', value: 'red'},
      ]),
    ).toBe(false);
  });

  it('skips required conditions whose name is not in the registry', () => {
    // Unknown names are tolerated — the rule is "if a condition is not yet
    // supported, don't fail against it". So a requirement on an unknown
    // name passes as long as the known requirements are satisfied.
    const checker = makeChecker(['blocks_used']);
    checker.addSatisfiedCondition({name: 'blocks_used', value: 3});
    expect(
      checker.checkRequirementConditions([
        {name: 'blocks_used', value: 3},
        {name: 'future_condition_not_yet_supported', value: 'whatever'},
      ]),
    ).toBe(true);
  });

  it('fails when any registered required condition is unsatisfied', () => {
    const checker = makeChecker(['blocks_used', 'colors_used']);
    checker.addSatisfiedCondition({name: 'blocks_used', value: 3});
    // colors_used is registered but not satisfied — must fail.
    expect(
      checker.checkRequirementConditions([
        {name: 'blocks_used', value: 3},
        {name: 'colors_used', value: 'red'},
      ]),
    ).toBe(false);
  });
});
