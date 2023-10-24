import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EvidenceDescriptions from '@cdo/apps/lib/levelbuilder/rubrics/EvidenceDescriptions';
import sinon from 'sinon';

describe('EvidenceDescriptions', () => {
  let defaultProps;
  const updateLearningGoal = sinon.spy();
  const learningGoalData = {
    key: 'learningGoal-1',
    id: 'learningGoal-1',
    learningGoal: 'Testing Learning Goal',
    learningGoalEvidenceLevelsAttributes: [],
    aiEnabled: false,
  };

  beforeEach(() => {
    defaultProps = {
      updateLearningGoal: updateLearningGoal,
      learningGoalData: learningGoalData,
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(<EvidenceDescriptions {...defaultProps} />);
    expect(wrapper.find('EvidenceDescriptionsRow').length).to.equal(4);

    expect(wrapper.find('.uitest-learning-goal-card').length).to.equal(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').length).to.equal(1);
    expect(
      wrapper.find('.uitest-rubric-key-concept-input').props().value
    ).to.equal('Testing Learning Goal');
    expect(wrapper.find('input[type="checkbox"]').length).to.equal(1);

    expect(wrapper.find('EvidenceDescriptions').length).to.equal(1);
    expect(
      wrapper.find('EvidenceDescriptions').prop('learningGoalData')
    ).to.equal(defaultProps.exisitingLearningGoalData);
    expect(wrapper.find('textarea').length).to.equal(1);
  });
});
