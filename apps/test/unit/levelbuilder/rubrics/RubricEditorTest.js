import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import RubricEditor from '@cdo/apps/lib/levelbuilder/rubrics/RubricEditor';

describe('RubricEditorTest ', () => {
  let wrapper;
  const addNewConceptSpy = jest.fn();
  const sampleLearningGoalList = [
    {id: 1, learningGoal: 'Goal 1', aiEnabled: true},
    {id: 2, learningGoal: 'Goal 2', aiEnabled: false},
    {id: 3, learningGoal: 'Goal 3', aiEnabled: true},
  ];
  const defaultProps = {
    learningGoalList: sampleLearningGoalList,
    addNewConcept: addNewConceptSpy,
    deleteItem: () => {},
    updateLearningGoal: () => {},
  };

  beforeEach(() => {
    wrapper = shallow(<RubricEditor {...defaultProps} />);
  });

  it('renders correct LearningGoalItem components', () => {
    expect(wrapper.find(LearningGoalItem)).toHaveLength(
      sampleLearningGoalList.length
    );
    expect(
      wrapper.find('LearningGoalItem').at(0).prop('exisitingLearningGoalData')
    ).toBe(sampleLearningGoalList[0]);
    expect(
      wrapper.find('LearningGoalItem').at(1).prop('exisitingLearningGoalData')
    ).toBe(sampleLearningGoalList[1]);
    expect(
      wrapper.find('LearningGoalItem').at(2).prop('exisitingLearningGoalData')
    ).toBe(sampleLearningGoalList[2]);
  });

  it('renders the "Add new Key Concept" button and it can be clicked when submittable levels are available', () => {
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).toHaveLength(1);
    addButton.simulate('click');
    expect(addNewConceptSpy).toHaveBeenCalledTimes(1);
  });
});
