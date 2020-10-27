import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import StudentTable from '@cdo/apps/code-studio/components/progress/StudentTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';

const MINIMUM_PROPS = {
  students: [{id: 1, name: 'Student 1'}, {id: 2, name: 'Student 2'}],
  onSelectUser: () => {},
  getSelectedUserId: () => {},
  levels: null,
  studentProgress: null
};

const levels = [
  {
    id: 11,
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    passed: false,
    submitLevel: false,
    user_id: 1
  },
  {
    id: 22,
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    passed: false,
    submitLevel: false,
    user_id: 2
  }
];

const levelProgressByStudent = {
  1: {11: levelProgressWithStatus(LevelStatus.not_tried)},
  2: {22: levelProgressWithStatus(LevelStatus.not_tried)}
};

describe('StudentTable', () => {
  it('display bubbles when levels', () => {
    const wrapper = shallow(
      <StudentTable
        {...MINIMUM_PROPS}
        levels={levels}
        levelProgressByStudent={levelProgressByStudent}
      />
    );

    expect(wrapper.find('TeacherPanelProgressBubble')).to.have.length(2);
  });

  it('does not display bubbles when no levels', () => {
    const wrapper = shallow(<StudentTable {...MINIMUM_PROPS} />);

    expect(wrapper.find('TeacherPanelProgressBubble')).to.have.length(0);
  });
});
