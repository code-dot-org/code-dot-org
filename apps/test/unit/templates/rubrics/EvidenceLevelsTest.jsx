import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import EvidenceLevels from '@cdo/apps/templates/rubrics/EvidenceLevels';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 1, teacherDescription: 'test1'},
    {id: 2, understanding: 2, teacherDescription: 'test2'},
  ],
  learningGoalKey: 'key-1',
};

describe('EvidenceLevels', () => {
  it('renders teachers view of evidence levels when the user can not provide feedback', () => {
    const wrapper = shallow(<EvidenceLevels {...DEFAULT_PROPS} />);
    expect(wrapper.find('EvidenceLevelsForTeachers').length).to.equal(1);
    expect(
      wrapper.find('EvidenceLevelsForTeachers').props().canProvideFeedback
    ).to.equal(undefined);
  });

  it('renders teachers view of evidence levels when the user can provide feedback', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback={true} />
    );
    expect(wrapper.find('EvidenceLevelsForTeachers').length).to.equal(1);
    expect(
      wrapper.find('EvidenceLevelsForTeachers').props().canProvideFeedback
    ).to.equal(true);
  });

  it('renders student view of evidence levels when student is viewing the rubric', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} isStudent={true} />
    );
    expect(wrapper.find('EvidenceLevelsForStudents').length).to.equal(1);
  });
});
