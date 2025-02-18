import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EvidenceLevelsForTeachersV2 from '@cdo/apps/templates/rubrics/EvidenceLevelsForTeachersV2';
import {
  UNDERSTANDING_LEVEL_STRINGS_V2,
  UNDERSTANDING_LEVEL_STRINGS,
} from '@cdo/apps/templates/rubrics/rubricHelpers';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  isAiAssessed: false,
  evidenceLevels: [
    {id: 1, understanding: 0, teacherDescription: 'test1'},
    {id: 2, understanding: 1, teacherDescription: 'test2'},
    {id: 3, understanding: 2, teacherDescription: 'test3'},
    {id: 4, understanding: 3, teacherDescription: 'test4'},
  ],
  learningGoalKey: 'key-1',
  arrowPositionCallback: _ => {},
};

describe('EvidenceLevelsForTeachersV2', () => {
  it('renders evidence levels', () => {
    const wrapper = mount(
      <EvidenceLevelsForTeachersV2
        {...DEFAULT_PROPS}
        canProvideFeedback={true}
      />
    );
    expect(wrapper.find('BodyThreeText').length).to.equal(1);
    expect(wrapper.find('BodyThreeText StrongText').first().text()).to.equal(
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
    const wrapper = mount(<EvidenceLevelsForTeachersV2 {...DEFAULT_PROPS} />);
    expect(wrapper.find('BodyThreeText').first().text()).to.equal(
      'Rubric Scores'
    );
    // Two BodyThreeText per evidence level (plus the header)
    expect(wrapper.find('BodyThreeText').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length * 2 + 1
    );
    const firstEvidenceLevel = DEFAULT_PROPS.evidenceLevels[0];
    expect(wrapper.find('StrongText').at(1).text()).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[firstEvidenceLevel.understanding]
    );
    expect(wrapper.find('BodyThreeText').at(2).text()).to.equal(
      firstEvidenceLevel.teacherDescription
    );
  });
});
