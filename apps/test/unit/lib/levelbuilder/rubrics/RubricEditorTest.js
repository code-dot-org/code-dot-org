import React from 'react';
import {shallow} from 'enzyme';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import Button from '@cdo/apps/templates/Button';
import {expect} from '../../../../util/reconfiguredChai';
import RubricEditor from '@cdo/apps/lib/levelbuilder/rubrics/RubricEditor';
import sinon from 'sinon';

describe('RubricEditorTest ', () => {
  let wrapper;
  const addNewConceptSpy = sinon.spy();
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
    expect(wrapper.find(LearningGoalItem)).to.have.length(
      sampleLearningGoalList.length
    );
    expect(
      wrapper.find('LearningGoalItem').at(0).prop('exisitingLearningGoalData')
    ).to.equal(sampleLearningGoalList[0]);
    expect(
      wrapper.find('LearningGoalItem').at(1).prop('exisitingLearningGoalData')
    ).to.equal(sampleLearningGoalList[1]);
    expect(
      wrapper.find('LearningGoalItem').at(2).prop('exisitingLearningGoalData')
    ).to.equal(sampleLearningGoalList[2]);
  });

  it('renders the "Add new Key Concept" button and it can be clicked when submittable levels are available', () => {
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).to.have.length(1);
    addButton.simulate('click');
    expect(addNewConceptSpy).to.have.been.calledOnce;
  });
});
