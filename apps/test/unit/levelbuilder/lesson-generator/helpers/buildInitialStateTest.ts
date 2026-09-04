import {buildInitialState} from '@cdo/apps/levelbuilder/lesson-generator/helpers/buildInitialState';
import {
  ExistingLessonData,
  SerializedLevel,
} from '@cdo/apps/levelbuilder/lesson-generator/types';

function lessonWith(levels: SerializedLevel[]): ExistingLessonData {
  return {
    id: 1,
    name: 'Test Lesson',
    lessonPath: '/lessons/1',
    editLessonUrl: '/lessons/1/edit',
    activities: [
      {
        position: 1,
        activitySections: [
          {
            position: 1,
            scriptLevels: levels.map((level, i) => ({
              activitySectionPosition: i + 1,
              levels: [level],
            })),
          },
        ],
      },
    ],
  };
}

describe('buildInitialState', () => {
  it('returns one fresh spec for a lesson with no levels', () => {
    const {prefix, specs} = buildInitialState({
      id: 1,
      name: 'Empty',
      lessonPath: '/lessons/1',
      editLessonUrl: '/lessons/1/edit',
    });
    expect(prefix).toBe('');
    expect(specs).toHaveLength(1);
    expect(specs[0].generate).toBe(true);
    expect(specs[0].id).toBe('');
  });

  it('infers the shared prefix and strips it from ids', () => {
    const {prefix, specs} = buildInitialState(
      lessonWith([
        {id: '1', name: 'unit1-web-intro', type: 'Panels'},
        {id: '2', name: 'unit1-web-build', type: 'Weblab2'},
      ])
    );
    expect(prefix).toBe('unit1-web');
    expect(specs.map(s => s.id)).toEqual(['intro', 'build']);
    expect(specs.map(s => s.labType)).toEqual(['panels', 'weblab2']);
  });

  it('ignores unsupported-type names when inferring the prefix', () => {
    const {prefix, specs} = buildInitialState(
      lessonWith([
        {id: '1', name: 'unit1-web-intro', type: 'Panels'},
        {id: '2', name: 'unit1-web-build', type: 'Weblab2'},
        {id: '3', name: 'totally-unrelated', type: 'Karel'},
      ])
    );
    expect(prefix).toBe('unit1-web');
    expect(specs[2].unsupportedType).toBe('Karel');
    expect(specs[2].generate).toBe(false);
  });

  it('defaults generate off when a persisted outline exists', () => {
    const {specs} = buildInitialState(
      lessonWith([
        {id: '1', name: 'l-one', type: 'Panels', generateOutline: 'a comic'},
      ])
    );
    expect(specs[0].description).toBe('a comic');
    expect(specs[0].lastGeneratedDescription).toBe('a comic');
    expect(specs[0].generate).toBe(false);
  });

  it('restores a known aichat preset and resets an unknown one', () => {
    const {specs} = buildInitialState(
      lessonWith([
        {id: '1', name: 'l-bot', type: 'Aichat', generateAichatPreset: 'tutor'},
        {
          id: '2',
          name: 'l-bot2',
          type: 'Aichat',
          generateAichatPreset: 'removedPreset',
        },
      ])
    );
    expect(specs[0].aichatPreset).toBe('tutor');
    expect(specs[1].aichatPreset).toBeUndefined();
  });

  it('hydrates bubble choice sublevels, marking sublevel-disallowed types', () => {
    const {specs} = buildInitialState(
      lessonWith([
        {
          id: '1',
          name: 'l-choose',
          type: 'BubbleChoice',
          sublevels: [
            {id: '10', name: 'l-choose-art', type: 'Weblab2'},
            // Multi is a supported top-level type but not sublevel-allowed.
            {id: '11', name: 'l-choose-quiz', type: 'Multi'},
          ],
        },
      ])
    );
    const subs = specs[0].sublevels!;
    expect(subs.map(s => s.id)).toEqual(['art', 'quiz']);
    expect(subs[0].labType).toBe('weblab2');
    expect(subs[0].unsupportedType).toBeUndefined();
    expect(subs[1].unsupportedType).toBe('Multi');
    expect(subs[1].generate).toBe(false);
  });
});
