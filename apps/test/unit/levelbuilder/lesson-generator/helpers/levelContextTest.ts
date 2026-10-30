import {levelContextFor} from '@cdo/apps/levelbuilder/lesson-generator/helpers/levelContext';
import {LevelSpec} from '@cdo/apps/levelbuilder/lesson-generator/types';

describe('levelContextFor', () => {
  const base = {lessonName: 'Lesson', authoringRules: 'No CSS.'};
  const spec = (over: Partial<LevelSpec>): LevelSpec => ({
    key: 'k',
    id: 'x',
    labType: 'pythonlab',
    description: '  Do the thing.  ',
    generate: true,
    ...over,
  });

  it('carries the base context and the trimmed description', () => {
    const ctx = levelContextFor(spec({}), 'u-x', base);
    expect(ctx.lessonName).toBe('Lesson');
    expect(ctx.authoringRules).toBe('No CSS.');
    expect(ctx.levelName).toBe('u-x');
    expect(ctx.levelDescription).toBe('Do the thing.');
  });

  it('passes supplied code only for codebridge labs', () => {
    expect(
      levelContextFor(spec({suppliedCode: ' print(1) '}), 'n', base)
        .suppliedCode
    ).toBe('print(1)');
    expect(
      levelContextFor(spec({labType: 'panels', suppliedCode: 'x'}), 'n', base)
        .suppliedCode
    ).toBeUndefined();
    expect(
      levelContextFor(spec({suppliedCode: '  '}), 'n', base).suppliedCode
    ).toBeUndefined();
  });
});
