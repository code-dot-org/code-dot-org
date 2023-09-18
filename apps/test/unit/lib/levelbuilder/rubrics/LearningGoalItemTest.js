import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import sinon from 'sinon';

describe('LearningGoalItem', () => {
  let defaultProps;
  const deleteLearningGoalSpy = sinon.spy();
  const exisitingLearningGoalData = {
    key: 'learningGoal-1',
    id: 'learningGoal-1',
    learningGoal: 'Testing Learning Goal',
    aiEnabled: false,
  };

  beforeEach(() => {
    defaultProps = {
      deleteLearningGoal: deleteLearningGoalSpy,
      exisitingLearningGoalData: exisitingLearningGoalData,
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    expect(wrapper.find('.uitest-learning-goal-card').length).to.equal(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').length).to.equal(1);
    expect(
      wrapper.find('.uitest-rubric-key-concept-input').props().value
    ).to.equal('Testing Learning Goal');
    expect(wrapper.find('input[type="checkbox"]').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
    expect(wrapper.find('EvidenceDescriptions').length).to.equal(1);
  });

  it('disables editing of AI textboxes when unchecked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).to.be.false;
    expect(
      wrapper.find('EvidenceDescriptions').at(0).props().learningGoalData
        .aiEnabled
    ).to.be.false;
  });

  it('enables editing of AI textboxes when checked', () => {
    const enabledAiData = {
      key: 'learningGoal-1',
      id: 'learningGoal-1',
      learningGoal: '',
      aiEnabled: true,
    };
    const wrapper = shallow(
      <LearningGoalItem
        {...defaultProps}
        exisitingLearningGoalData={enabledAiData}
      />
    );
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).to.be.true;
    expect(
      wrapper.find('EvidenceDescriptions').at(0).props().learningGoalData
        .aiEnabled
    ).to.be.true;
  });

  it('calls deleteLearningGoal when delete button is clicked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(deleteLearningGoalSpy.calledOnce).to.be.true;
  });
});
