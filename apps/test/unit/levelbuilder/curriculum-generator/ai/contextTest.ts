import {
  authoringRulesLines,
  draftingRulesLines,
} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';

describe('authoringRulesLines', () => {
  it('returns no lines when rules are absent or blank', () => {
    expect(authoringRulesLines({})).toEqual([]);
    expect(authoringRulesLines({authoringRules: '   '})).toEqual([]);
  });

  it('frames the rules with a blank separator and precedence framing', () => {
    const lines = authoringRulesLines({authoringRules: ' No console.log. '});
    expect(lines[0]).toBe('');
    expect(lines[lines.length - 1]).toBe('No console.log.');
    expect(lines.join(' ')).toContain('these rules win');
  });
});

describe('draftingRulesLines', () => {
  it('returns no lines when rules are absent or blank', () => {
    expect(draftingRulesLines({})).toEqual([]);
    expect(draftingRulesLines({draftingRules: ' '})).toEqual([]);
  });

  it('frames the rules the same way authoring rules are framed', () => {
    const lines = draftingRulesLines({
      draftingRules: 'Pair vocab with a check.',
    });
    expect(lines[0]).toBe('');
    expect(lines[lines.length - 1]).toBe('Pair vocab with a check.');
    expect(lines.join(' ')).toContain('these rules win');
  });
});
