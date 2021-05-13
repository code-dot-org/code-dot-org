import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableLessonNumber from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import progressTableStyles from '@cdo/apps/templates/sectionProgress/progressTables/progressTableStyles.scss';
import * as Virtualized from 'reactabular-virtualized';
import {
  fakeLevel,
  fakeLessonWithLevels,
  fakeStudents,
  fakeStudentLevelProgress
} from '@cdo/apps/templates/progress/progressTestHelpers';
import {
  fakeRowsForStudents,
  fakeDetailRowsForStudent
} from '@cdo/apps/templates/sectionProgress/sectionProgressTestHelpers';
import sinon from 'sinon';

const STUDENTS = fakeStudents(3);
const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 3);
const LESSON_3 = fakeLessonWithLevels({
  position: 3,
  levels: [fakeLevel({isUnplugged: true})]
});
const LESSON_4 = fakeLessonWithLevels({position: 4, levels: []});
const LESSONS = [LESSON_1, LESSON_2, LESSON_3, LESSON_4];

const STUDENT_ROWS = fakeRowsForStudents(STUDENTS);

const FORMATTERS = [sinon.stub(), sinon.stub(), sinon.stub()];

const DEFAULT_PROPS = {
  rows: STUDENT_ROWS,
  onRow: () => {},
  scriptData: {
    id: 1,
    name: 'csd1-2020',
    title: 'CSD Unit 1 - Problem Solving and Computing (20-21)',
    stages: LESSONS
  },
  lessonOfInterest: 1,
  levelProgressByStudent: fakeStudentLevelProgress(LESSON_1.levels, STUDENTS),
  onClickLesson: () => {},
  columnWidths: [50, 100, 75, 50],
  lessonCellFormatters: FORMATTERS,
  extraHeaderFormatters: [],
  needsGutter: false,
  onScroll: () => {},
  includeHeaderArrows: false
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<ProgressTableContentView {...props} />);
};

describe('ProgressTableContentView', () => {
  afterEach(() => {
    FORMATTERS.forEach(formatter => {
      formatter.resetHistory();
    });
  });

  it('displays lesson number as a ProgressTableLessonNumber', () => {
    const wrapper = setUp();
    // one for each of the 4 lessons
    expect(wrapper.find(ProgressTableLessonNumber)).to.have.length(4);
  });

  it('passes includeArrow false to ProgressTableLessonNumber if includeHeaderArrows is false', () => {
    const wrapper = setUp({includeHeaderArrows: false});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().includeArrow).to.be.false;
    expect(lessonNumbers.at(1).props().includeArrow).to.be.false;
    expect(lessonNumbers.at(2).props().includeArrow).to.be.false;
  });

  it('passes includeArrow true to ProgressTableLessonNumber if includeHeaderArrows is true and there are multiple levels or the first level is unplugged', () => {
    const wrapper = setUp({includeHeaderArrows: true});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().includeArrow).to.be.false; // first lesson only has one level
    expect(lessonNumbers.at(1).props().includeArrow).to.be.true; // second lesson only has 3 levels
    expect(lessonNumbers.at(2).props().includeArrow).to.be.true; // third lesson only has one unplugged level
    expect(lessonNumbers.at(3).props().includeArrow).to.be.false; // fourth lesson has no levels
  });

  it('passes highlighted true to ProgressTableLessonNumber for the lessonOfInterest', () => {
    const wrapper = setUp({lessonOfInterest: 2});
    const lessonNumbers = wrapper.find(ProgressTableLessonNumber);
    expect(lessonNumbers.at(0).props().highlighted).to.be.false;
    expect(lessonNumbers.at(1).props().highlighted).to.be.true;
    expect(lessonNumbers.at(2).props().highlighted).to.be.false;
  });

  it('calls onClickLesson with lesson position when a lesson number is clicked', () => {
    const onClickSpy = sinon.spy();
    const wrapper = setUp({onClickLesson: onClickSpy});
    wrapper
      .find(ProgressTableLessonNumber)
      .at(0)
      .simulate('click');
    expect(onClickSpy).to.have.been.called;
  });

  it('calls onScroll when the body is scrolled', () => {
    const onScrollSpy = sinon.spy();
    const wrapper = setUp({onScroll: onScrollSpy});
    wrapper.find(Virtualized.Body).simulate('scroll');
    expect(onScrollSpy).to.have.been.called;
  });

  it('calls primary lessonCellFormatter for each cell in the body', () => {
    setUp();
    const expectedCallCount = STUDENTS.length * LESSONS.length;
    expect(FORMATTERS[0].callCount).to.equal(expectedCallCount);
  });

  it('calls each lessonCellFormatter when detail rows are passed in', () => {
    // reactabular initially only renders three rows, so we use a single
    // student to avoid needing to workaround that.
    const detailRows = fakeDetailRowsForStudent(STUDENTS[0]);
    setUp({rows: [STUDENT_ROWS[0], ...detailRows]});
    const expectedCallCount = LESSONS.length;
    expect(FORMATTERS[0].callCount).to.equal(expectedCallCount);
    expect(FORMATTERS[1].callCount).to.equal(expectedCallCount);
    expect(FORMATTERS[2].callCount).to.equal(expectedCallCount);
  });

  it('uses a fixed column width for empty lessons', () => {
    const wrapper = setUp({columnWidths: null});
    const headers = wrapper.find('th');
    expect(headers.at(0).props().style?.minWidth).to.be.undefined;
    expect(headers.at(0).props().style?.maxWidth).to.be.undefined;
    expect(headers.at(3).props().style.minWidth).to.equal(
      parseInt(progressTableStyles.MIN_COLUMN_WIDTH)
    );
    expect(headers.at(3).props().style.maxWidth).to.equal(
      parseInt(progressTableStyles.MIN_COLUMN_WIDTH)
    );
  });
});
