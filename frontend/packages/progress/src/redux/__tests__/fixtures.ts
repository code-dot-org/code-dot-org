// The apps progressReduxTest.js course3 fixture, in the shape core's
// LessonSchema produces: camelCase keys and numeric ids. Levels are Lab2
// unless a spec says otherwise, so they can share a page; apps' were not.

import type {Lesson, UnitLevel} from '@code-dot-org/core/api';

import {PUZZLE_PAGE_NONE} from '../../constants';
import type {InitProgressPayload} from '../../types';

interface LevelSpec {
  id: number;
  activeId: number;
  position: number;
  kind: string;
  title: number | string;
  lesson: number;
  pageNumber?: number;
  bonus?: boolean;
  sublevels?: SublevelSpec[];
  usesLab2?: boolean;
}

interface SublevelSpec {
  id: number;
  position: number;
  letter: string;
  navigationType: string;
}

const base = '/courses/course3/units/1/lessons';

export function level(spec: LevelSpec): UnitLevel {
  const path = `${base}/${spec.lesson}/levels/${spec.position}`;
  return {
    id: spec.id,
    ids: [spec.activeId],
    activeId: spec.activeId,
    inactiveIds: [],
    position: spec.position,
    kind: spec.kind,
    icon: '',
    title: spec.title,
    url: `http://localhost-studio.code.org:3000${path}`,
    path,
    isConceptLevel: false,
    bonus: spec.bonus ?? false,
    displayAsUnplugged: spec.kind === 'unplugged',
    app: 'maze',
    usesLab2: spec.usesLab2 ?? true,
    isValidated: true,
    pageNumber: spec.pageNumber,
    sublevels: (spec.sublevels || []).map(sublevel => ({
      ...sublevel,
      url: `http://localhost-studio.code.org:3000${path}/sublevel/${sublevel.position}`,
      path: `${path}/sublevel/${sublevel.position}`,
      usesLab2: spec.usesLab2 ?? true,
      icon: null,
      type: 'maze',
    })),
  } as unknown as UnitLevel;
}

export const BUBBLE_CHOICE_LEVEL_ID = 322;

export const lessonOneLevels: UnitLevel[] = [
  level({
    id: 101,
    activeId: 2106,
    position: 1,
    kind: 'unplugged',
    title: 'Unplugged Activity',
    lesson: 1,
  }),
  level({
    id: 102,
    activeId: 323,
    position: 2,
    pageNumber: 1,
    kind: 'assessment',
    title: 1,
    lesson: 1,
  }),
  level({
    id: 103,
    activeId: BUBBLE_CHOICE_LEVEL_ID,
    position: 3,
    pageNumber: 2,
    kind: 'assessment',
    title: 2,
    lesson: 1,
    bonus: true,
    sublevels: [
      {id: 10301, position: 1, letter: 'a', navigationType: 'next_level'},
      {id: 10302, position: 2, letter: 'b', navigationType: 'parent'},
    ],
  }),
];

export function lesson(
  id: number,
  position: number,
  name: string,
  levels: UnitLevel[],
): Lesson {
  return {
    scriptId: 36,
    scriptName: 'course3',
    numScriptLessons: 2,
    id,
    position,
    relativePosition: position,
    name,
    key: name,
    title: `Lesson ${position}: ${name}`,
    lessonGroupDisplayName: null,
    lockable: false,
    numberedLesson: true,
    levels,
  } as unknown as Lesson;
}

export const lessonData: Lesson[] = [
  lesson(264, 1, 'Computational Thinking', lessonOneLevels),
  lesson(265, 2, 'Maze', [
    level({
      id: 201,
      activeId: 330,
      position: 1,
      kind: 'puzzle',
      title: 1,
      lesson: 2,
    }),
    level({
      id: 202,
      activeId: 339,
      position: 2,
      kind: 'puzzle',
      title: 2,
      lesson: 2,
    }),
    level({
      id: 203,
      activeId: 341,
      position: 3,
      kind: 'puzzle',
      title: 3,
      lesson: 2,
    }),
  ]),
];

export function initPayload(
  overrides: Partial<InitProgressPayload> = {},
): InitProgressPayload {
  return {
    currentLevelId: undefined,
    deeperLearningCourse: false,
    saveAnswersBeforeNavigation: false,
    lessonGroups: [],
    lessons: lessonData,
    scriptName: 'course3',
    scriptDisplayName: 'Course 3',
    unitStudentDescription: '',
    unitHasUnnumberedLessons: false,
    isLessonExtras: false,
    isFullProgress: true,
    currentPageNumber: PUZZLE_PAGE_NONE,
    ...overrides,
  };
}
