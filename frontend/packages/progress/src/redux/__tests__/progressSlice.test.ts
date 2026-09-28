// Ported from the reducer, getParentLevel, nextLevelId, getNextLevel,
// levelsForLessonId and processedLessons blocks of
// apps/test/unit/code-studio/progressReduxTest.js.

import type {Lesson, UnitLevel} from '@code-dot-org/core/api';
import {describe, expect, it} from 'vitest';

import {TestResults, ViewTypes} from '../../constants';
import type {ProgressState} from '../../types';
import progressSlice, {
  disablePostMilestone,
  getNextLevel,
  getParentLevel,
  initProgress,
  levelsForLessonId,
  mergeResults,
  mergeUnitProgress,
  nextLevelId,
  processedLessons,
  setCurrentLessonId,
  setIsAge13Required,
  setIsSummaryView,
  setLessonExtrasEnabled,
  setStudentDefaultsSummaryView,
  setViewType,
} from '../progressSlice';
import {
  BUBBLE_CHOICE_LEVEL_ID,
  initPayload,
  lessonData,
  lessonOneLevels,
  level,
} from './fixtures';

const reducer = progressSlice.reducer;
const initialState = reducer(undefined, {type: '@@init'});

type SelectorState = Parameters<typeof getNextLevel>[0];

// A root state on the given level in lesson 1, optionally replacing lesson
// 1's levels.
function onLevel(
  currentLevelId: number | undefined,
  lessonOne: UnitLevel[] = lessonOneLevels,
  overrides: Partial<ProgressState> = {},
): SelectorState {
  const lessons = lessonData.map((lesson, i) =>
    i === 0 ? ({...lesson, levels: lessonOne} as Lesson) : lesson,
  );
  return {
    progress: {
      ...reducer(undefined, initProgress(initPayload({lessons}))),
      currentLevelId,
      currentLessonId: lessonData[0].id,
      ...overrides,
    },
  } as unknown as SelectorState;
}

const standalone = () =>
  onLevel(341, undefined, {currentLessonId: undefined, lessons: undefined});

const finalLevel = level({
  id: 104,
  activeId: 324,
  position: 4,
  pageNumber: 3,
  kind: 'assessment',
  title: 3,
  lesson: 1,
});

// A bubble choice level that can follow level 103. Its sublevels sit at the
// same indices as 10301 and 10302, which is what next_sublevel matches on.
const nextBubbleChoiceLevel = level({
  id: 104,
  activeId: 324,
  position: 4,
  kind: 'puzzle',
  title: 3,
  lesson: 1,
  sublevels: [
    {id: 10401, position: 1, letter: 'a', navigationType: 'next_sublevel'},
    {id: 10402, position: 2, letter: 'b', navigationType: 'next_sublevel'},
  ],
});

// Lesson 1's levels with every bubble choice sublevel set to navigationType.
const withSublevelNavigation = (navigationType: string) =>
  lessonOneLevels.map(lessonLevel =>
    lessonLevel.activeId === BUBBLE_CHOICE_LEVEL_ID
      ? ({
          ...lessonLevel,
          sublevels: lessonLevel.sublevels?.map(sublevel => ({
            ...sublevel,
            navigationType,
          })),
        } as UnitLevel)
      : lessonLevel,
  );

describe('reducer', () => {
  it('can initialize progress on script overview page', () => {
    const state = reducer(undefined, initProgress(initPayload()));
    expect(state.currentLevelId).toBeUndefined();
    expect(state.deeperLearningCourse).toBe(false);
    expect(state.saveAnswersBeforeNavigation).toBe(false);
    expect(state.lessons).toEqual(processedLessons(lessonData, false));
    expect(state.scriptName).toBe('course3');
    expect(state.currentLessonId).toBeUndefined();
  });

  it('can initialize progress on puzzle page', () => {
    const state = reducer(
      undefined,
      initProgress(
        initPayload({currentLevelId: 341, lessons: [lessonData[1]]}),
      ),
    );
    expect(state.currentLevelId).toBe(341);
    expect(state.lessons).toEqual(processedLessons([lessonData[1]], false));
    expect(state.currentLessonId).toBe(265);
  });

  it('can merge in fresh progress', () => {
    const initialized = reducer(undefined, initProgress(initPayload()));
    const state = reducer(
      initialized,
      mergeResults({
        339: TestResults.ALL_PASS,
        341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED,
      }),
    );
    expect(state.levelResults).toEqual({
      339: TestResults.ALL_PASS,
      341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED,
    });
    expect(state.lessons).toBe(initialized.lessons);
  });

  it('can update progress', () => {
    const state = reducer(
      {
        ...initialState,
        levelResults: {341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED},
      },
      mergeResults({341: TestResults.ALL_PASS}),
    );
    expect(state.levelResults[341]).toBe(TestResults.ALL_PASS);
  });

  it('cannot move progress backwards', () => {
    const state = reducer(
      {...initialState, levelResults: {341: TestResults.ALL_PASS}},
      mergeResults({341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED}),
    );
    expect(state.levelResults[341]).toBe(TestResults.ALL_PASS);
  });

  it('can update postMilestoneDisabled', () => {
    expect(initialState.postMilestoneDisabled).toBe(false);
    expect(
      reducer(initialState, disablePostMilestone()).postMilestoneDisabled,
    ).toBe(true);
  });

  it('can update isAge13Required', () => {
    expect(initialState.isAge13Required).toBe(false);
    expect(
      reducer(initialState, setIsAge13Required(true)).isAge13Required,
    ).toBe(true);
  });

  it('can update isSummaryView', () => {
    expect(reducer(initialState, setIsSummaryView(true)).isSummaryView).toBe(
      true,
    );
    expect(reducer(initialState, setIsSummaryView(false)).isSummaryView).toBe(
      false,
    );
  });

  it('can update studentDefaultsSummaryView', () => {
    for (const value of [true, false]) {
      expect(
        reducer(initialState, setStudentDefaultsSummaryView(value))
          .studentDefaultsSummaryView,
      ).toBe(value);
    }
  });

  it('can enable lesson extras', () => {
    expect(initialState.lessonExtrasEnabled).toBe(false);
    expect(
      reducer(initialState, setLessonExtrasEnabled(true)).lessonExtrasEnabled,
    ).toBe(true);
  });

  describe('setViewType', () => {
    it('shows detail view to an instructor', () => {
      const state = {...initialState, isSummaryView: true};
      expect(
        reducer(state, setViewType(ViewTypes.Instructor)).isSummaryView,
      ).toBe(false);
    });

    it('shows summary view to a participant when that is the default', () => {
      const state = {
        ...initialState,
        studentDefaultsSummaryView: true,
        isSummaryView: false,
      };
      expect(
        reducer(state, setViewType(ViewTypes.Participant)).isSummaryView,
      ).toBe(true);
    });

    it('shows detail view to a participant when that is the default', () => {
      const state = {
        ...initialState,
        studentDefaultsSummaryView: false,
        isSummaryView: true,
      };
      expect(
        reducer(state, setViewType(ViewTypes.Participant)).isSummaryView,
      ).toBe(false);
    });
  });

  it('can setCurrentLessonId', () => {
    expect(
      reducer(initialState, setCurrentLessonId(1234)).currentLessonId,
    ).toBe(1234);
  });

  it('does not allow setCurrentLessonId to replace an existing lesson id', () => {
    const state = {...initialState, currentLessonId: 111};
    expect(reducer(state, setCurrentLessonId(222)).currentLessonId).toBe(111);
  });

  describe('mergeUnitProgress', () => {
    it('adds progress for a level the server had not reported', () => {
      const state = reducer(
        initialState,
        mergeUnitProgress({levelId: 7, result: TestResults.ALL_PASS}),
      );
      expect(state.unitProgress[7]).toMatchObject({
        result: TestResults.ALL_PASS,
        status: 'perfect',
        locked: false,
      });
    });

    it('keeps the better result and the other fields of an existing entry', () => {
      const existing = reducer(
        {
          ...initialState,
          unitProgress: {
            7: {
              ...reducer(
                initialState,
                mergeUnitProgress({
                  levelId: 7,
                  result: TestResults.LEVEL_INCOMPLETE_FAIL,
                }),
              ).unitProgress[7],
              paired: true,
            },
          },
        },
        mergeUnitProgress({levelId: 7, result: TestResults.ALL_PASS}),
      );
      expect(existing.unitProgress[7]).toMatchObject({
        result: TestResults.ALL_PASS,
        status: 'perfect',
        paired: true,
      });

      const unchanged = reducer(
        existing,
        mergeUnitProgress({
          levelId: 7,
          result: TestResults.LEVEL_INCOMPLETE_FAIL,
        }),
      );
      expect(unchanged.unitProgress[7].result).toBe(TestResults.ALL_PASS);
      expect(unchanged.unitProgress[7].status).toBe('perfect');
    });
  });
});

describe('getParentLevel', () => {
  it('returns undefined if this is a standalone level', () => {
    expect(getParentLevel(standalone())).toBeUndefined();
  });

  it('returns undefined if this is not a sublevel', () => {
    expect(getParentLevel(onLevel(323))).toBeUndefined();
  });

  it('returns the parent level of a sublevel', () => {
    expect(getParentLevel(onLevel(10302))?.id).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });
});

describe('nextLevelId', () => {
  it('returns undefined when not on a level', () => {
    expect(nextLevelId(onLevel(undefined))).toBeUndefined();
  });

  it('returns undefined if this is a standalone level', () => {
    expect(nextLevelId(standalone())).toBeUndefined();
  });

  it('returns the next level id for a standard level within a lesson', () => {
    expect(nextLevelId(onLevel(323))).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it('returns the next level id after an unplugged level', () => {
    expect(nextLevelId(onLevel(2106))).toBe(323);
  });

  it('returns the parent level id when this is a sublevel without the "next_level" navigation', () => {
    expect(nextLevelId(onLevel(10302))).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it('returns the next level when this is a sublevel with the "next_level" navigation and there is a level after the parent', () => {
    expect(nextLevelId(onLevel(10301, [...lessonOneLevels, finalLevel]))).toBe(
      finalLevel.activeId,
    );
  });
});

describe('getNextLevel', () => {
  it('returns undefined when not on a level', () => {
    expect(getNextLevel(onLevel(undefined))).toBeUndefined();
  });

  it('returns undefined if this is a standalone level', () => {
    expect(getNextLevel(standalone())).toBeUndefined();
  });

  it('returns the next level for a standard level within a lesson', () => {
    expect(getNextLevel(onLevel(323))?.id).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it('returns the parent level when this is a sublevel without the "next_level" navigation', () => {
    expect(getNextLevel(onLevel(10302))?.id).toBe(BUBBLE_CHOICE_LEVEL_ID);
  });

  it('returns the next level when this is a sublevel with the "next_level" navigation and there is a level after the parent', () => {
    expect(
      getNextLevel(onLevel(10301, [...lessonOneLevels, finalLevel]))?.id,
    ).toBe(finalLevel.activeId);
  });

  it('returns undefined when on the last level of the lesson', () => {
    expect(getNextLevel(onLevel(BUBBLE_CHOICE_LEVEL_ID))).toBeUndefined();
  });

  it('returns undefined for a sublevel with the "next_level" navigation when the parent is the last level', () => {
    expect(getNextLevel(onLevel(10301))).toBeUndefined();
  });

  it('returns the matching sublevel of the next level for a sublevel with the "next_sublevel" navigation', () => {
    const state = onLevel(10302, [
      ...withSublevelNavigation('next_sublevel'),
      nextBubbleChoiceLevel,
    ]);
    expect(getNextLevel(state)?.id).toBe(10402);
  });

  it('falls back to the next level when the "next_sublevel" navigation finds no matching sublevel', () => {
    const state = onLevel(10302, [
      ...withSublevelNavigation('next_sublevel'),
      {
        ...nextBubbleChoiceLevel,
        sublevels: nextBubbleChoiceLevel.sublevels?.slice(0, 1),
      } as UnitLevel,
    ]);
    expect(getNextLevel(state)?.id).toBe(nextBubbleChoiceLevel.activeId);
  });

  it('falls back to the next level when the "next_sublevel" navigation is followed by a level without sublevels', () => {
    const state = onLevel(10302, [
      ...withSublevelNavigation('next_sublevel'),
      {...nextBubbleChoiceLevel, sublevels: []} as UnitLevel,
    ]);
    expect(getNextLevel(state)?.id).toBe(nextBubbleChoiceLevel.activeId);
  });

  it('returns undefined for a sublevel with the "next_sublevel" navigation when the parent is the last level', () => {
    const state = onLevel(10302, withSublevelNavigation('next_sublevel'));
    expect(getNextLevel(state)).toBeUndefined();
  });
});

describe('levelsForLessonId', () => {
  const progress = (currentLevelId?: number) =>
    onLevel(currentLevelId).progress;

  it('returns levels for the given lesson', () => {
    expect(levelsForLessonId(progress(), lessonData[0].id)).toHaveLength(3);
  });

  it('sets isCurrentLevel to true for current level only', () => {
    const levels = levelsForLessonId(progress(323), lessonData[0].id);
    expect(levels.map(l => l.isCurrentLevel)).toEqual([false, true, false]);
  });

  it('correctly sets isCurrentLevel if current level is a sublevel', () => {
    const levels = levelsForLessonId(progress(10301), lessonData[0].id);
    expect(levels.map(l => l.isCurrentLevel)).toEqual([false, false, false]);
    expect(levels[2].sublevels?.map(l => l.isCurrentLevel)).toEqual([
      true,
      false,
    ]);
  });

  it('reports unitProgress status over levelResults', () => {
    const state = {
      ...progress(),
      levelResults: {323: TestResults.LEVEL_INCOMPLETE_FAIL},
    };
    const merged = reducer(
      state,
      mergeUnitProgress({levelId: 323, result: TestResults.ALL_PASS}),
    );
    expect(levelsForLessonId(merged, lessonData[0].id)[1].status).toBe(
      'perfect',
    );
  });
});

describe('processedLessons', () => {
  it('strips "hidden" field from lessons', () => {
    const lessons = [
      {name: 'lesson1', id: 123, hidden: false},
      {name: 'lesson2', id: 124, hidden: true},
    ] as unknown as Lesson[];
    const processed = processedLessons(lessons, false);
    expect(processed[0]).not.toHaveProperty('hidden');
    expect(processed[1]).not.toHaveProperty('hidden');
  });

  it('adds lessonNumber to numbered lessons', () => {
    const lessons = [
      {name: 'lesson1', id: 123, numberedLesson: true},
      {name: 'lesson2', id: 124, numberedLesson: true},
      {name: 'survey1', id: 125, numberedLesson: false},
      {name: 'lesson3', id: 126, numberedLesson: true},
    ] as unknown as Lesson[];
    expect(processedLessons(lessons, false).map(l => l.lessonNumber)).toEqual([
      1,
      2,
      undefined,
      3,
    ]);
  });

  it('does not number lessons in a deeper learning course', () => {
    const lessons = [{id: 1, numberedLesson: true}] as unknown as Lesson[];
    expect(processedLessons(lessons, true)[0].lessonNumber).toBeUndefined();
  });
});
