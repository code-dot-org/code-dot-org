// Ported from the peer review, levelsByLesson, getLessonCount,
// progressionsFromLevels, groupedLessons, lessonExtrasUrl, peerReviewLesson,
// peerReviewLevels and isPerfect blocks of
// apps/test/unit/code-studio/progressReduxTest.js, plus the selectors apps
// left untested.

import type {Lesson, LessonGroup} from '@code-dot-org/core/api';
import {describe, expect, it} from 'vitest';

import {LevelStatuses, TestResults} from '../../constants';
import type {
  NumberedLevel,
  PeerReviewLessonInfo,
  ProgressState,
} from '../../types';
import {
  PEER_REVIEW_ID,
  getCurrentLesson,
  getLessonCount,
  groupedLessons,
  hasGroups,
  hasLessonPlan,
  hasLockableLessons,
  isPerfect,
  lessonExtrasUrl,
  lessonTutorPath,
  lessons,
  levelCount,
  levelsByLesson,
  peerReviewLesson,
  peerReviewLevels,
  progressionsFromLevels,
} from '../progressSelectors';
import progressSlice, {
  initProgress,
  mergePeerReviewProgress,
  mergeResults,
  processedLessons,
  setLessonExtrasEnabled,
} from '../progressSlice';
import {initPayload, lessonData} from './fixtures';

const reducer = progressSlice.reducer;

const peerReviewLessonInfo: PeerReviewLessonInfo = {
  name: 'You must complete 2 reviews for this unit',
  lesson_group_display_name: 'Peer Review',
  levels: [0, 1].map(
    () =>
      ({
        kind: 'peer_review',
        title: '',
        url: '',
        name: 'Reviews unavailable at this time',
        icon: 'fa-lock',
        locked: true,
      }) as unknown as PeerReviewLessonInfo['levels'][number],
  ),
  lockable: false,
};

const group = (id: number, displayName: string): LessonGroup => ({
  id,
  key: displayName,
  displayName,
  description: `About ${displayName}`,
  bigQuestions: 'Why?',
  userFacing: true,
  position: id,
});

const inGroup = (lesson: Lesson, displayName: string) =>
  ({...lesson, lessonGroupDisplayName: displayName}) as Lesson;

const initialized = (overrides = {}) =>
  reducer(undefined, initProgress(initPayload(overrides)));

const root = (progress: ProgressState) =>
  ({progress}) as unknown as Parameters<typeof getLessonCount>[0];

describe('with peer reviews', () => {
  it('can initialize progress with peer reviews on overview page', () => {
    const state = initialized({
      deeperLearningCourse: true,
      peerReviewLessonInfo,
    });
    expect(state.lessons).toEqual(processedLessons(lessonData, true));
    expect(state.peerReviewLessonInfo).toEqual(peerReviewLessonInfo);
  });

  it('can provide progress for peer reviews', () => {
    const state = initialized({peerReviewLessonInfo});
    const next = reducer(
      state,
      mergePeerReviewProgress([
        {
          id: 13,
          locked: false,
          name: 'Ready to review',
          status: 'not_started',
          url: '/peer_reviews/13',
        } as unknown as PeerReviewLessonInfo['levels'][number],
      ]),
    );
    expect(next.levelResults).toEqual(state.levelResults);
    expect(next.peerReviewLessonInfo?.levels).toHaveLength(2);
    // The previous state is not mutated.
    expect(state.peerReviewLessonInfo?.levels[0].locked).toBe(true);
    expect(next.peerReviewLessonInfo?.levels[0]).toEqual({
      id: 13,
      kind: 'peer_review',
      title: '',
      icon: 'fa-lock',
      locked: false,
      url: '/peer_reviews/13',
      name: 'Ready to review',
      status: 'not_started',
    });
    expect(next.peerReviewLessonInfo?.levels[1].locked).toBe(true);
  });
});

describe('levelsByLesson', () => {
  it('gives each level its status from levelResults', () => {
    const state = reducer(
      initialized(),
      mergeResults({
        339: TestResults.ALL_PASS,
        341: TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED,
      }),
    );
    const levels = levelsByLesson(state);
    expect(levels.map(lessonLevels => lessonLevels.map(l => l.id))).toEqual([
      [2106, 323, 322],
      [330, 339, 341],
    ]);
    expect(levels[1].map(l => l.status)).toEqual([
      LevelStatuses.NotTried,
      LevelStatuses.Perfect,
      LevelStatuses.Attempted,
    ]);
    expect(levels[0][2].sublevels?.map(l => l.bubbleText)).toEqual(['a', 'b']);
  });

  it('only numbers non-unplugged levels', () => {
    const results = levelsByLesson({
      ...initialized(),
      lessons: [
        {
          ...lessonData[0],
          levels: lessonData[0].levels.slice(0, 2),
        } as Lesson,
      ],
    });
    expect(results[0][0].levelNumber).toBeUndefined();
    expect(results[0][1].levelNumber).toBe(1);
  });

  it('sets isLocked to true if lesson is lockable', () => {
    const results = levelsByLesson({
      ...initialized(),
      lessons: [{...lessonData[0], lockable: true} as Lesson],
    });
    expect(results[0][0].isLocked).toBe(true);
  });
});

describe('getLessonCount', () => {
  it('returns the number of lessons in the unit', () => {
    expect(getLessonCount(root(initialized()))).toBe(2);
  });

  it('returns 1 even if there are no lessons (a standalone level)', () => {
    expect(getLessonCount(root({...initialized(), lessons: undefined}))).toBe(
      1,
    );
  });

  it('returns 1 if the lesson count is not provided', () => {
    const state = initialized({
      lessons: lessonData.map(
        lesson =>
          ({...lesson, numScriptLessons: undefined}) as unknown as Lesson,
      ),
    });
    expect(getLessonCount(root(state))).toBe(1);
  });
});

describe('progressionsFromLevels', () => {
  const levels = (...specs: object[]) =>
    specs.map(
      (spec, i) => ({url: `/level${i}`, ...spec}) as unknown as NumberedLevel,
    );

  it('returns a single progression when no levels have names', () => {
    const input = levels({}, {}, {});
    expect(progressionsFromLevels(input)).toEqual([
      {name: undefined, displayName: undefined, start: 0, levels: input},
    ]);
  });

  it('puts adjacent levels with the same name in the same progression', () => {
    const input = levels(
      {name: 'Progression 1'},
      {name: 'Progression 1'},
      {name: 'Progression 2'},
    );
    const progressions = progressionsFromLevels(input);
    expect(progressions).toHaveLength(2);
    expect(progressions[0]).toEqual({
      name: 'Progression 1',
      displayName: 'Progression 1',
      start: 0,
      levels: input.slice(0, 2),
    });
  });

  it('puts non-adjacent levels with the same name in different progressions', () => {
    const progressions = progressionsFromLevels(
      levels({name: 'One'}, {name: 'Two'}, {name: 'One'}),
    );
    expect(progressions.map(p => p.levels.length)).toEqual([1, 1, 1]);
  });

  it('puts adjacent levels with the same progression name in the same progression', () => {
    const input = levels(
      {progression: 'P1', progressionDisplayName: 'Progression 1'},
      {progression: 'P1', progressionDisplayName: 'Progression 1'},
      {progression: 'P2', progressionDisplayName: 'Progression 2'},
    );
    const progressions = progressionsFromLevels(input);
    expect(progressions).toHaveLength(2);
    expect(progressions[0]).toEqual({
      name: 'P1',
      displayName: 'Progression 1',
      start: 0,
      levels: input.slice(0, 2),
    });
  });

  it('puts non-adjacent levels with the same progression name in different progressions', () => {
    const progressions = progressionsFromLevels(
      levels({progression: 'One'}, {progression: 'Two'}, {progression: 'One'}),
    );
    expect(progressions).toHaveLength(3);
  });

  it('takes progression name over level name if both are provided', () => {
    const progressions = progressionsFromLevels(
      levels(
        {name: 'Level 1', progression: 'ProgressionOne'},
        {name: 'Level 2', progression: 'ProgressionOne'},
        {name: 'Level 3', progression: 'ProgressionTwo'},
      ),
    );
    expect(progressions.map(p => p.name)).toEqual([
      'ProgressionOne',
      'ProgressionTwo',
    ]);
    expect(progressions[0].levels).toHaveLength(2);
  });

  it('sets the right start value for progressions that are not the first one', () => {
    const progressions = progressionsFromLevels(
      levels({progression: 'P1'}, {progression: 'P1'}, {progression: 'P2'}),
    );
    expect(progressions[1].start).toBe(2);
  });

  it('returns nothing for no levels', () => {
    expect(progressionsFromLevels([])).toEqual([]);
  });
});

describe('groupedLessons', () => {
  it('returns the lesson group', () => {
    const state = initialized({
      lessonGroups: [group(1, 'Lesson Group')],
      lessons: [inGroup(lessonData[0], 'Lesson Group')],
    });
    const groups = groupedLessons(state);
    expect(groups).toHaveLength(1);
    expect(groups[0].lessonGroup).toEqual({
      id: 1,
      userFacing: true,
      displayName: 'Lesson Group',
      description: 'About Lesson Group',
      bigQuestions: 'Why?',
    });
    expect(groups[0].lessons.map(l => l.id)).toEqual([264]);
  });

  it('returns a single group if all lessons have the same lesson group', () => {
    const state = initialized({
      lessonGroups: [group(1, 'Lesson Group')],
      lessons: lessonData.map(lesson => inGroup(lesson, 'Lesson Group')),
    });
    expect(groupedLessons(state)).toHaveLength(1);
    expect(hasGroups(state)).toBe(false);
  });

  it('splits lessons across groups', () => {
    const state = initialized({
      lessonGroups: [group(1, 'First'), group(2, 'Second')],
      lessons: [
        inGroup(lessonData[0], 'First'),
        inGroup(lessonData[1], 'Second'),
      ],
    });
    expect(groupedLessons(state).map(g => g.lessons.length)).toEqual([1, 1]);
    expect(hasGroups(state)).toBe(true);
  });

  it('includes bonus levels in groups only if includeBonusLevels is true', () => {
    const state = initialized({
      lessonGroups: [group(1, 'Lesson Group')],
      lessons: [inGroup(lessonData[0], 'Lesson Group')],
    });
    // Level 103 is the bonus level of lesson 1.
    expect(groupedLessons(state, false)[0].levelsByLesson[0]).toHaveLength(2);
    expect(groupedLessons(state, true)[0].levelsByLesson[0]).toHaveLength(3);
  });

  it('gives peer reviews a group of their own', () => {
    const state = initialized({
      lessonGroups: [group(1, 'Lesson Group')],
      lessons: [inGroup(lessonData[0], 'Lesson Group')],
      peerReviewLessonInfo,
    });
    const groups = groupedLessons(state);
    expect(groups.map(g => g.lessonGroup.displayName)).toEqual([
      'Lesson Group',
      'Peer Review',
    ]);
    expect(groups[1].lessonGroup.id).toBeNull();
    expect(groups[1].levelsByLesson[0]).toHaveLength(2);
  });
});

describe('lessons', () => {
  it('marks focus-area lessons', () => {
    const state = {...initialized(), focusAreaLessonIds: [265]};
    expect(lessons(state).map(l => [l.id, l.isFocusArea])).toEqual([
      [264, false],
      [265, true],
    ]);
  });
});

describe('hasLockableLessons', () => {
  it('is true only when some lesson is lockable', () => {
    expect(hasLockableLessons(initialized())).toBe(false);
    const lessonsWithLock = [
      {...lessonData[0], lockable: true} as Lesson,
      lessonData[1],
    ];
    expect(hasLockableLessons({lessons: lessonsWithLock})).toBe(true);
  });
});

describe('getCurrentLesson and levelCount', () => {
  it('reads the current lesson and counts its levels', () => {
    const state = root({...initialized(), currentLessonId: 265});
    expect(getCurrentLesson(state)?.name).toBe('Maze');
    expect(levelCount(state)).toBe(3);
  });

  it('counts a standalone level as one', () => {
    expect(
      levelCount(
        root({...initialized(), lessons: undefined, currentLevelId: 5}),
      ),
    ).toBe(1);
  });

  it('counts nothing without a level', () => {
    expect(levelCount(root({...initialized(), lessons: undefined}))).toBe(0);
  });
});

describe('lessonExtrasUrl, lessonTutorPath and hasLessonPlan', () => {
  const lessonTwo = {
    ...lessonData[1],
    lessonExtrasLevelUrl:
      '//localhost.code.org:3000/courses/course3/units/1/lessons/2/extras',
    lessonTutorPath: '/lessons/2/tutor',
    hasLessonPlan: true,
  } as Lesson;
  const state = initialized({lessons: [lessonTwo]});

  it('derives the extras url from the lesson when extras are on', () => {
    expect(lessonExtrasUrl(state, 265)).toBe('');
    const enabled = reducer(state, setLessonExtrasEnabled(true));
    expect(lessonExtrasUrl(enabled, 265)).toBe(
      '//localhost.code.org:3000/courses/course3/units/1/lessons/2/extras',
    );
  });

  it('reads the tutor path and lesson plan flag', () => {
    expect(lessonTutorPath(state, 265)).toBe('/lessons/2/tutor');
    expect(lessonTutorPath(state, 999)).toBe('');
    expect(hasLessonPlan(state, 265)).toBe(true);
    expect(hasLessonPlan(state, 999)).toBe(false);
  });
});

describe('peerReviewLesson', () => {
  it('extracts lesson data from our peerReviewLessonInfo', () => {
    const lesson = peerReviewLesson({peerReviewLessonInfo});
    expect(lesson.id).toBe(PEER_REVIEW_ID);
    expect(lesson.lockable).toBe(false);
    expect(lesson.isFocusArea).toBe(false);
    expect(lesson.name).toBe(peerReviewLessonInfo.name);
  });
});

describe('peerReviewLevels', () => {
  it('keeps a locked level locked', () => {
    const levels = peerReviewLevels({peerReviewLessonInfo});
    expect(levels).toHaveLength(2);
    expect(levels[0]).toMatchObject({
      id: PEER_REVIEW_ID,
      isLocked: true,
      status: LevelStatuses.NotTried,
      url: '',
      icon: 'fa-lock',
      levelNumber: 1,
    });
  });

  it('uses the given status when not locked', () => {
    const levels = peerReviewLevels({
      peerReviewLessonInfo: {
        ...peerReviewLessonInfo,
        levels: [
          {
            ...peerReviewLessonInfo.levels[0],
            locked: false,
            icon: '',
            status: LevelStatuses.Perfect,
            url: '/peer_reviews/1',
          },
        ],
      },
    });
    expect(levels[0]).toMatchObject({
      id: PEER_REVIEW_ID,
      isLocked: false,
      status: LevelStatuses.Perfect,
      url: '/peer_reviews/1',
      icon: '',
    });
  });
});

describe('isPerfect', () => {
  it('returns false if progress was not initialized', () => {
    expect(isPerfect({}, 1)).toBe(false);
  });

  it('returns false if the level was not started', () => {
    expect(isPerfect({levelResults: {}}, 1)).toBe(false);
  });

  it('returns false if the level was not perfected', () => {
    expect(
      isPerfect({levelResults: {1: TestResults.TOO_MANY_BLOCKS_FAIL}}, 1),
    ).toBe(false);
  });

  it('returns true if the level was perfected', () => {
    expect(isPerfect({levelResults: {1: TestResults.ALL_PASS}}, 1)).toBe(true);
  });
});
