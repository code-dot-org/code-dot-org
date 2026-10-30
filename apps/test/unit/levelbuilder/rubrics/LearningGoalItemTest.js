import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LearningGoalItem from '@cdo/apps/levelbuilder/rubrics/LearningGoalItem';

describe('LearningGoalItem', () => {
  let defaultProps;
  const deleteLearningGoalSpy = jest.fn();
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
    expect(wrapper.find('.uitest-learning-goal-card').length).toBe(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').length).toBe(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').props().value).toBe(
      'Testing Learning Goal'
    );
    expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
    expect(wrapper.find('Button').length).toBe(1);
    expect(wrapper.find('EvidenceDescriptions').length).toBe(1);
    expect(wrapper.find('EvidenceDescriptions').prop('learningGoalData')).toBe(
      defaultProps.exisitingLearningGoalData
    );
    expect(wrapper.find('textarea').length).toBe(1);
  });

  it('disables editing of AI textboxes when unchecked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).toBe(false);
    expect(
      wrapper.find('EvidenceDescriptions').at(0).props().learningGoalData
        .aiEnabled
    ).toBe(false);
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
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).toBe(true);
    expect(
      wrapper.find('EvidenceDescriptions').at(0).props().learningGoalData
        .aiEnabled
    ).toBe(true);
  });

  it('calls deleteLearningGoal when delete button is clicked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(deleteLearningGoalSpy).toHaveBeenCalledTimes(1);
  });

  it('calls updateLearningGoal when tips text is changed', () => {
    const updateLearningGoalSpy = jest.fn();
    const wrapper = shallow(
      <LearningGoalItem
        {...defaultProps}
        updateLearningGoal={updateLearningGoalSpy}
      />
    );
    wrapper
      .find('textarea')
      .simulate('change', {target: {value: 'Learning Goal Tip'}});
    expect(updateLearningGoalSpy).toHaveBeenCalledWith(
      exisitingLearningGoalData.id,
      'tips',
      'Learning Goal Tip'
    );
  });

  it('displays confirmation dialog when learning goal name input receives focus and AI assessment is checked', () => {
    const dialogStub = jest
      .spyOn(window, 'confirm')
      .mockClear()
      .mockReturnValue(true);

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

    wrapper.find('input').first().prop('onFocus')();
    expect(dialogStub).toHaveBeenCalledTimes(1);
    dialogStub.mockRestore();
  });
});
