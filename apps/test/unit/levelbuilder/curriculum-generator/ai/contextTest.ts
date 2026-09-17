import {
  authoringRulesLines,
  draftingRulesLines,
  LESSON_CONTEXT_FOR_LEVEL,
  lessonContextLines,
  precedingLevelsLines,
  sectionLines,
  targetProjectLines,
  unitContextLines,
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

describe('sectionLines', () => {
  it('frames a body with a blank line and the intro, and is empty without one', () => {
    expect(sectionLines(['Intro:'], 'BODY')).toEqual(['', 'Intro:', 'BODY']);
    expect(sectionLines(['Intro:'], undefined)).toEqual([]);
    expect(sectionLines(['Intro:'], '')).toEqual([]);
  });
});

describe('unitContextLines', () => {
  const ctx = {unitName: 'Unit U', unitOutline: 'UNIT OUTLINE'};

  it('finishes the heading with the first clause and puts the rest on their own lines', () => {
    expect(unitContextLines(ctx)).toEqual([
      '',
      'Unit context — this level sits inside the unit "Unit U". Use it for broad continuity (audience/grade, recurring themes, tone, arc)',
      'but build only the specific level described below:',
      'UNIT OUTLINE',
    ]);
  });

  it('takes a subject and clause of its own', () => {
    expect(
      unitContextLines(ctx, {subject: 'this lesson', use: ['Keep it brief:']})
    ).toEqual([
      '',
      'Unit context — this lesson sits inside the unit "Unit U". Keep it brief:',
      'UNIT OUTLINE',
    ]);
  });

  it('is empty without a unit outline and tolerates a missing unit name', () => {
    expect(unitContextLines({})).toEqual([]);
    expect(unitContextLines({unitOutline: 'X'})[1]).toContain('the unit "".');
  });
});

describe('the field-bound sections', () => {
  const ctx = {
    lessonName: 'L',
    lessonOutline: 'LESSON OUTLINE',
    targetProject: 'TARGET',
    precedingLevels: 'PRECEDING',
  };

  it('each reads its own field', () => {
    expect(lessonContextLines(ctx, LESSON_CONTEXT_FOR_LEVEL).at(-1)).toBe(
      'LESSON OUTLINE'
    );
    expect(targetProjectLines(ctx, ['Target:']).at(-1)).toBe('TARGET');
    expect(precedingLevelsLines(ctx, ['Preceding:']).at(-1)).toBe('PRECEDING');
    expect(precedingLevelsLines({}, ['Preceding:'])).toEqual([]);
  });
});
