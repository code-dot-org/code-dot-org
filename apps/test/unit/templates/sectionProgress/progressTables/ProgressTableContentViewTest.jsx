import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';
import ProgressTableLessonNumber from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import * as Virtualized from 'reactabular-virtualized';
import {
  fakeLevel,
  fakeLessonWithLevels,
  fakeStudents,
  fakeStudentLevelProgress
} from '@cdo/apps/templates/progress/progressTestHelpers';
import sinon from 'sinon';

const STUDENTS = fakeStudents(3);
const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 3);
const LESSON_3 = fakeLessonWithLevels({
  position: 3,
  levels: [fakeLevel({isUnplugged: true})]
});
const LESSONS = [LESSON_1, LESSON_2, LESSON_3];

const DEFAULT_PROPS = {
  section: {id: 1, students: STUDENTS},
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
  lessonCellFormatter: () => {},
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
  it('displays lesson number as a ProgressTableLessonNumber', () => {
    const wrapper = setUp();
    // one for each of the 3 lessons
    expect(wrapper.find(ProgressTableLessonNumber)).to.have.length(3);
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

  it('calls lessonCellFormatter for each cell in the body', () => {
    const lessonCellFormatterSpy = sinon.spy();
    setUp({lessonCellFormatter: lessonCellFormatterSpy});
    const expectedFormatCallCount = STUDENTS.length * LESSONS.length;
    expect(lessonCellFormatterSpy.callCount).to.equal(expectedFormatCallCount);
  });
});
