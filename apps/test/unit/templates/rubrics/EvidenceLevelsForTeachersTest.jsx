import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import EvidenceLevelsForTeachers from '@cdo/apps/templates/rubrics/EvidenceLevelsForTeachers';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';



const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 0, teacherDescription: 'test1'},
    {id: 2, understanding: 1, teacherDescription: 'test2'},
  ],
  learningGoalKey: 'key-1',
};

describe('EvidenceLevelsForTeachers', () => {
  it('renders evidence levels', () => {
    const wrapper = shallow(
      <EvidenceLevelsForTeachers {...DEFAULT_PROPS} canProvideFeedback={true} />
    );
    expect(wrapper.find('Heading6').length).toBe(1);
    expect(wrapper.find('Heading6').props().children).toBe('Assign a Rubric Score');
    expect(wrapper.find('Memo(RadioButton)').length).toBe(DEFAULT_PROPS.evidenceLevels.length);
    expect(wrapper.find('BodyThreeText').length).toBe(DEFAULT_PROPS.evidenceLevels.length);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('BodyThreeText').at(0).props().children).toBe(firstEvidenceLevel.teacherDescription);
    expect(wrapper.find('Memo(RadioButton)').at(0).prop('label')).toBe(UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]);
  });

  it('calls radioButtonCallback when understanding is selected', () => {
    const callback = sinon.spy();
    const wrapper = mount(
      <EvidenceLevelsForTeachers
        {...DEFAULT_PROPS}
        radioButtonCallback={callback}
        canProvideFeedback={true}
      />
    );
    wrapper.find('input').first().simulate('change');
    sinon.toHaveBeenCalledTimes(1);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(callback).toHaveBeenCalledWith(firstEvidenceLevel.understanding);
    wrapper.unmount();
  });

  it('renders evidence levels without RadioButtons when the teacher cannot provide feedback', () => {
    const wrapper = shallow(<EvidenceLevelsForTeachers {...DEFAULT_PROPS} />);
    expect(wrapper.find('Heading6').length).toBe(1);
    expect(wrapper.find('Heading6').props().children).toBe('Rubric Scores');
    expect(wrapper.find('Memo(RadioButton)').length).toBe(0);
    // Two BodyThreeText per evidence level
    expect(wrapper.find('BodyThreeText').length).toBe(DEFAULT_PROPS.evidenceLevels.length * 2);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('StrongText').at(0).props().children).toBe(UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]);
    expect(wrapper.find('BodyThreeText').at(1).props().children).toBe(firstEvidenceLevel.teacherDescription);
  });
});
