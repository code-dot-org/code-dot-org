import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {UnconnectedProgressTableContainer as ProgressTableContainer} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContainer';
import ProgressTableStudentList from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableStudentList';
import ProgressTableContentView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContentView';

const LESSON_1 = {
  name: 'CS Discoveries Pre-survey',
  relative_position: 1,
  lockable: false,
  position: 1,
  levels: [
    {
      id: 22484,
      url: '/s/csd1-2020/lockable/1/puzzle/1/page/1',
      kind: 'assessment',
      icon: 'fa fa-list-ul',
      isUnplugged: false,
      levelNumber: 1,
      bubbleText: '1',
      isConceptLevel: false,
      bonus: null
    }
  ]
};

const LESSON_2 = {
  name: 'Intro to Problem Solving',
  relative_position: 2,
  lockable: false,
  position: 2,
  levels: [
    {
      id: 12345,
      url: '/s/csd1-2020/lockable/1/puzzle/1/page/1',
      kind: 'assessment',
      icon: 'fa fa-list-ul',
      isUnplugged: false,
      levelNumber: 1,
      bubbleText: '1',
      isConceptLevel: false,
      bonus: null
    }
  ]
};

const DEFAULT_PROPS = {
  onClickLesson: () => {},
  getTableWidth: () => 500,
  columnWidths: [50, 100, 75, 50],
  lessonCellFormatter: () => {},
  extraHeaderFormatters: [],
  extraHeaderLabels: [],
  children: <div />,
  section: {id: 1, students: [{id: 1, name: 'joey'}, {id: 2, name: 'rachael'}]},
  scriptData: {
    id: 1,
    name: 'csd1-2020',
    title: 'CSD Unit 1 - Problem Solving and Computing (20-21)',
    stages: [LESSON_1, LESSON_2]
  },
  lessonOfInterest: 1,
  levelProgressByStudent: {
    1: {
      1: {
        status: 'perfect',
        result: 100,
        paired: false
      }
    },
    2: {
      1: {
        status: 'perfect',
        result: 100,
        paired: false
      }
    }
  },
  studentTimestamps: {1: 0, 2: 0},
  localeCode: 'en-US'
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<ProgressTableContainer {...props} />);
};

describe('ProgressTableContainer', () => {
  it('renders a ProgressTableStudentList', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableStudentList)).to.have.length(1);
  });

  it('renders a ProgressTableContentView', () => {
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContentView)).to.have.length(1);
  });

  it('passes needsGutter true to the ProgressTableContentView when the student row height exceeds the body height', () => {
    // 18 students will exceed max height
    const students = Array(18)
      .fill()
      .map((x, i) => ({id: i, name: `student-${i}`}));

    const wrapper = setUp({section: {id: 1, students: students}});
    expect(wrapper.find(ProgressTableContentView).props().needsGutter).to.be
      .true;
  });

  it('passes needsGutter false to the ProgressTableContentView when the student row height is less than the body height', () => {
    // 2 students will not exceed max height (default props)
    const wrapper = setUp();
    expect(wrapper.find(ProgressTableContentView).props().needsGutter).to.be
      .false;
  });

  it('passes needsGutter true to the ProgressTableStudentList when the width of the stages exceeds the content view width', () => {
    // 2000px will exceed with content view width
    const getTableWidth = () => 2000;
    const wrapper = setUp({getTableWidth});
    expect(wrapper.find(ProgressTableStudentList).props().needsGutter).to.be
      .true;
  });

  it('passes needsGutter false to the ProgressTableStudentList when the width of the stages is less than the content view width', () => {
    // 20px will be less than the content view width
    const getTableWidth = () => 20;
    const wrapper = setUp({getTableWidth});
    expect(wrapper.find(ProgressTableStudentList).props().needsGutter).to.be
      .false;
  });

  it('passes extraHeaderLabels to the ProgressTableStudentList', () => {
    const extraHeaderLabels = ['extraheader'];
    const wrapper = setUp({extraHeaderLabels});
    expect(
      wrapper.find(ProgressTableStudentList).props().extraHeaderLabels
    ).to.equal(extraHeaderLabels);
  });

  it('renders props.children', () => {
    const children = <div id="child-div">This is the child</div>;
    const wrapper = setUp({children});
    expect(wrapper.find('#child-div')).to.have.length(1);
  });
});
