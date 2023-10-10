import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import EvidenceLevels from '@cdo/apps/templates/rubrics/EvidenceLevels';
import {UNDERSTANDING_LEVEL_STRINGS} from '@cdo/apps/templates/rubrics/rubricHelpers';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 1, teacherDescription: 'test1'},
    {id: 2, understanding: 2, teacherDescription: 'test2'},
  ],
  learningGoalKey: 'key-1',
};

describe('EvidenceLevels', () => {
  it('renders evidence levels when feedback available', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback />
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
    const lastEvidenceLevel =
      DEFAULT_PROPS.evidenceLevels[DEFAULT_PROPS.evidenceLevels.length - 1];
    expect(wrapper.find('Memo(RadioButton)').at(0).prop('label')).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[lastEvidenceLevel.understanding]
    );
  });

  it('renders evidence levels when feedback not available', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback={false} />
    );
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal('Rubric Scores');
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(0);
    // Two BodyThreeText per evidence level
    expect(wrapper.find('BodyThreeText').length).to.equal(
      DEFAULT_PROPS.evidenceLevels.length * 2
    );
    const lastEvidenceLevel =
      DEFAULT_PROPS.evidenceLevels[DEFAULT_PROPS.evidenceLevels.length - 1];
    expect(wrapper.find('BodyThreeText').at(0).props().children).to.equal(
      UNDERSTANDING_LEVEL_STRINGS[lastEvidenceLevel.understanding]
    );
  });
});
