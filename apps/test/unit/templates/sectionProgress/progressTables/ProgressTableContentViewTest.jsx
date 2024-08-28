import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import * as Virtualized from 'reactabular-virtualized';

import {
  fakeLevel,
  fakeLessonWithLevels,
  fakeStudents,
  fakeStudentLevelProgress,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableLessonNumber from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import {
  fakeRowsForStudents,
  fakeDetailRowsForStudent,
} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';

import {allowConsoleWarnings} from '../../../../util/testUtils';

import progressTableStyleConstants from '@cdo/apps/templates/sectionProgress/progressTables/progress-table-constants.module.scss';

const STUDENTS = fakeStudents(3);
const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 3);
const LESSON_3 = fakeLessonWithLevels({
  position: 3,
  levels: [fakeLevel({isUnplugged: true})],
});
const LESSON_4 = fakeLessonWithLevels({position: 4, levels: []});
const LESSONS = [LESSON_1, LESSON_2, LESSON_3, LESSON_4];

const STUDENT_ROWS = fakeRowsForStudents(STUDENTS);

const FORMATTERS = [jest.fn(), jest.fn(), jest.fn()];

const DEFAULT_PROPS = {
  rows: STUDENT_ROWS,
  onRow: () => {},
  scriptData: {
    id: 1,
    name: 'csd1-2020',
    title: 'CSD Unit 1 - Problem Solving and Computing (20-21)',
    lessons: LESSONS,
  },
  lessonOfInterest: 1,
  levelProgressByStudent: fakeStudentLevelProgress(LESSON_1.levels, STUDENTS),
  onClickLesson: () => {},
  columnWidths: [50, 100, 75, 50],
  lessonCellFormatters: FORMATTERS,
  extraHeaderFormatters: [],
  needsGutter: false,
  onScroll: () => {},
  includeHeaderArrows: false,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<ProgressTableContentView {...props} />);
};

describe('ProgressTableContentView', () => {
  allowConsoleWarnings();

  afterEach(() => {
    FORMATTERS.forEach(formatter => {
      formatter.mockReset();
    });
  });

  it('displays lesson number as a ProgressTableLessonNumber', () => {
    const wrapper = setUp();
    // one for each of the 4 lessons
    expect(wrapper.find(ProgressTableLessonNumber)).toHaveLength(4);
  });

  it('passes includeArrow false to ProgressTableLessonNumber if includeHeaderArrows is false', () => {
    const wrapper = setUp({includeHeaderArrows: false});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().includeArrow).toBe(false);
    expect(lessonNumbers.at(1).props().includeArrow).toBe(false);
    expect(lessonNumbers.at(2).props().includeArrow).toBe(false);
  });

  it('passes includeArrow true to ProgressTableLessonNumber if includeHeaderArrows is true and there are multiple levels or the first level is unplugged', () => {
    const wrapper = setUp({includeHeaderArrows: true});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().includeArrow).toBe(false); // first lesson only has one level
    expect(lessonNumbers.at(1).props().includeArrow).toBe(true); // second lesson only has 3 levels
    expect(lessonNumbers.at(2).props().includeArrow).toBe(true); // third lesson only has one unplugged level
    expect(lessonNumbers.at(3).props().includeArrow).toBe(false); // fourth lesson has no levels
  });

  it('passes highlighted true to ProgressTableLessonNumber for the lessonOfInterest', () => {
    const wrapper = setUp({lessonOfInterest: 2});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().highlighted).toBe(false);
    expect(lessonNumbers.at(1).props().highlighted).toBe(true);
    expect(lessonNumbers.at(2).props().highlighted).toBe(false);
  });

  it('calls onClickLesson with lesson position when a lesson number is clicked', () => {
    const onClickSpy = jest.fn();
    const wrapper = setUp({onClickLesson: onClickSpy});
    wrapper.find(ProgressTableLessonNumber).at(0).simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
  });

  it('calls onScroll when the body is scrolled', () => {
    const onScrollSpy = jest.fn();
    const wrapper = setUp({onScroll: onScrollSpy});
    wrapper.find(Virtualized.Body).simulate('scroll');
    expect(onScrollSpy).toHaveBeenCalled();
  });

  it('calls primary lessonCellFormatter for each cell in the body', () => {
    setUp();
    const expectedCallCount = STUDENTS.length * LESSONS.length;
    expect(FORMATTERS[0]).toHaveBeenCalledTimes(expectedCallCount);
  });

  it('calls each lessonCellFormatter when detail rows are passed in', () => {
    // reactabular initially only renders three rows, so we use a single
    // student to avoid needing to workaround that.
    const detailRows = fakeDetailRowsForStudent(STUDENTS[0]);
    setUp({rows: [STUDENT_ROWS[0], ...detailRows]});
    const expectedCallCount = LESSONS.length;
    expect(FORMATTERS[0]).toHaveBeenCalledTimes(expectedCallCount);
    expect(FORMATTERS[1]).toHaveBeenCalledTimes(expectedCallCount);
    expect(FORMATTERS[2]).toHaveBeenCalledTimes(expectedCallCount);
  });

  it('uses a fixed column width for empty lessons', () => {
    const wrapper = setUp({columnWidths: null});
    const headers = wrapper.find('th');
    expect(headers.at(0).props().style?.minWidth).toBeUndefined();
    expect(headers.at(0).props().style?.maxWidth).toBeUndefined();
    expect(headers.at(3).props().style.minWidth).toBe(
      parseInt(progressTableStyleConstants.MIN_COLUMN_WIDTH)
    );
    expect(headers.at(3).props().style.maxWidth).toBe(
      parseInt(progressTableStyleConstants.MIN_COLUMN_WIDTH)
    );
  });
});
