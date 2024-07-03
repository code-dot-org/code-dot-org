import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EvidenceLevelsForTeachers from '@cdo/apps/templates/rubrics/EvidenceLevelsForTeachers';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal(
      'Assign a Rubric Score'
    );
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length
    );
    expect(wrapper.find('BodyThreeText').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length
    );
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('BodyThreeText').at(0).props().children).to.equal(
      firstEvidenceLevel.teacherDescription
    );
    expect(wrapper.find('Memo(RadioButton)').at(0).prop('label')).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
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
    sinon.assert.calledOnce(callback);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(callback).to.have.been.calledWith(firstEvidenceLevel.understanding);
    wrapper.unmount();
  });

  it('renders evidence levels without RadioButtons when the teacher cannot provide feedback', () => {
    const wrapper = shallow(<EvidenceLevelsForTeachers {...DEFAULT_PROPS} />);
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal('Rubric Scores');
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(0);
    // Two BodyThreeText per evidence level
    expect(wrapper.find('BodyThreeText').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length * 2
    );
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('StrongText').at(0).props().children).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.equal(
      firstEvidenceLevel.teacherDescription
    );
  });
});
