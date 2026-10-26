import {afterEach, describe, expect, it, vi} from 'vitest';

import ConditionsChecker from '../ConditionsChecker';

afterEach(() => {
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

describe('ConditionsChecker', () => {
  it('meets requirements it has seen, and skips conditions it does not know', () => {
    const checker = new ConditionsChecker(['played_sound', 'played_two']);
    checker.addSatisfiedCondition({name: 'played_sound', value: 'kick'});
    expect(
      checker.checkRequirementConditions([
        {name: 'played_sound', value: 'kick'},
        {name: 'not_supported_yet'},
      ]),
    ).toBe(true);
    expect(checker.checkRequirementConditions([{name: 'played_two'}])).toBe(
      false,
    );
  });

  it('forgets satisfied conditions when cleared', () => {
    const checker = new ConditionsChecker(['played_sound']);
    checker.addSatisfiedCondition({name: 'played_sound'});
    checker.clear();
    expect(checker.checkRequirementConditions([{name: 'played_sound'}])).toBe(
      false,
    );
  });

  it('logs changes when the URL asks, as apps did', () => {
    window.history.replaceState(
      {},
      '',
      '/?log-validator-condition-changes=true',
    );
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    new ConditionsChecker(['played_sound']).addSatisfiedCondition({
      name: 'played_sound',
    });
    expect(log).toHaveBeenCalledWith(
      'ConditionsChecker condition added:',
      'played_sound',
      undefined,
    );
  });

  it('stays quiet by default, and when told to', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    new ConditionsChecker(['a']).addSatisfiedCondition({name: 'a'});
    window.history.replaceState(
      {},
      '',
      '/?log-validator-condition-changes=true',
    );
    new ConditionsChecker(['a'], false).addSatisfiedCondition({name: 'a'});
    expect(log).not.toHaveBeenCalled();
  });
});
