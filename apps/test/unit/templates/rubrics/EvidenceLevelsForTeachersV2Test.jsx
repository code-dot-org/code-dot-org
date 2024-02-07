import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import EvidenceLevelsForTeachersV2 from '@cdo/apps/templates/rubrics/EvidenceLevelsForTeachersV2';
import {
  UNDERSTANDING_LEVEL_STRINGS_V2,
  UNDERSTANDING_LEVEL_STRINGS,
} from '@cdo/apps/templates/rubrics/rubricHelpers';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 0, teacherDescription: 'test1'},
    {id: 2, understanding: 1, teacherDescription: 'test2'},
    {id: 3, understanding: 2, teacherDescription: 'test3'},
    {id: 4, understanding: 3, teacherDescription: 'test4'},
  ],
  learningGoalKey: 'key-1',
};

describe('EvidenceLevelsForTeachersV2', () => {
  it('renders evidence levels', () => {
    const wrapper = shallow(
      <EvidenceLevelsForTeachersV2
        {...DEFAULT_PROPS}
        canProvideFeedback={true}
      />
    );
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal(
      'Assign a Rubric Score'
    );
    expect(wrapper.find('button').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length
    );
    expect(wrapper.find('BodyFourText').length).to.equal(1);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('button').first().text()).to.equal(
      UNDERSTANDING_LEVEL_STRINGS_V2[firstEvidenceLevel.understanding]
    );
  });

  it('calls radioButtonCallback when understanding is selected', () => {
    const callback = sinon.spy();
    const wrapper = mount(
      <EvidenceLevelsForTeachersV2
        {...DEFAULT_PROPS}
        radioButtonCallback={callback}
        canProvideFeedback={true}
      />
    );
    wrapper.find('button').first().simulate('click');
    sinon.assert.calledOnce(callback);
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(callback).to.have.been.calledWith(firstEvidenceLevel.understanding);
    wrapper.unmount();
  });

  it('renders evidence levels without RadioButtons when the teacher cannot provide feedback', () => {
    const wrapper = shallow(<EvidenceLevelsForTeachersV2 {...DEFAULT_PROPS} />);
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
