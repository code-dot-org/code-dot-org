import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import EvidenceLevels from '@cdo/apps/templates/rubrics/EvidenceLevels';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 1, teacherDescription: 'test1'},
    {id: 2, understanding: 2, teacherDescription: 'test2'},
  ],
  isAiAssessed: true,
  learningGoalKey: 'key-1',
};

describe('EvidenceLevels', () => {
  it('renders teachers view of evidence levels when the user can not provide feedback', () => {
    const wrapper = shallow(<EvidenceLevels {...DEFAULT_PROPS} />);
    expect(wrapper.find('EvidenceLevelsForTeachersV2').length).toBe(1);
    expect(
      wrapper.find('EvidenceLevelsForTeachersV2').props().canProvideFeedback
    ).toBeUndefined();
  });

  it('renders old teachers view of evidence levels when the user can provide feedback', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback={true} />
    );
    expect(wrapper.find('EvidenceLevelsForTeachersV2').length).toBe(1);
    expect(
      wrapper.find('EvidenceLevelsForTeachersV2').props().canProvideFeedback
    ).toBe(true);
  });

  it('renders teachers view of evidence levels when the user can provide feedback', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback={true} />
    );
    expect(wrapper.find('EvidenceLevelsForTeachersV2').length).toBe(1);
    expect(
      wrapper.find('EvidenceLevelsForTeachersV2').props().canProvideFeedback
    ).toBe(true);
  });

  it('renders student view of evidence levels when student is viewing the rubric', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} isStudent={true} />
    );
    expect(wrapper.find('EvidenceLevelsForStudents').length).toBe(1);
  });
});
