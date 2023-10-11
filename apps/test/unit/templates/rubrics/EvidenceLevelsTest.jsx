import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import EvidenceLevels from '@cdo/apps/templates/rubrics/EvidenceLevels';

const DEFAULT_PROPS = {
  evidenceLevels: [
    {id: 1, understanding: 1, teacherDescription: 'test'},
    {id: 2, understanding: 2, teacherDescription: 'test'},
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
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(2);
    expect(wrapper.find('BodyThreeText').length).to.equal(2);
  });

  it('renders evidence levels when feedback not available', () => {
    const wrapper = shallow(
      <EvidenceLevels {...DEFAULT_PROPS} canProvideFeedback={false} />
    );
    expect(wrapper.find('Heading6').length).to.equal(1);
    expect(wrapper.find('Heading6').props().children).to.equal('Rubric Scores');
    expect(wrapper.find('Memo(RadioButton)').length).to.equal(0);
    // Two BodyThreeText per evidence level
    expect(wrapper.find('BodyThreeText').length).to.equal(4);
  });
});
