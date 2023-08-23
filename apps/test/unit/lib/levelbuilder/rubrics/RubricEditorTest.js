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
  const deleteItemSpy = sinon.spy();
  const hndleAiEnabledChangeSpy = sinon.spy();
  const handleLearningGoalNameChangeSpy = sinon.spy();
  const sampleLearningGoalList = [
    {id: 1, learningGoal: 'Goal 1', aiEnabled: true},
    {id: 2, learningGoal: 'Goal 2', aiEnabled: false},
    {id: 3, learningGoal: 'Goal 3', aiEnabled: true},
  ];

  beforeEach(() => {
    wrapper = shallow(
      <RubricEditor
        learningGoalList={sampleLearningGoalList}
        addNewConcept={addNewConceptSpy}
        deleteItem={deleteItemSpy}
        handleAiEnabledChange={hndleAiEnabledChangeSpy}
        handleLearningGoalNameChange={handleLearningGoalNameChangeSpy}
      />
    );
  });

  it('renders correct number of LearningGoalItem components', () => {
    expect(wrapper.find(LearningGoalItem)).to.have.length(
      sampleLearningGoalList.length
    );
  });

  it('renders the "Add new Key Concept" button and it can be clicked', () => {
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).to.have.length(1);
    addButton.simulate('click');
    expect(addNewConceptSpy).to.have.been.calledOnce;
  });
});
