import React from 'react';
import {shallow} from 'enzyme';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import Button from '@cdo/apps/templates/Button';
import {expect} from '../../../../util/reconfiguredChai';
import RubricEditor from '@cdo/apps/lib/levelbuilder/rubrics/RubricEditor';
import sinon from 'sinon';

describe('RubricEditorTest ', () => {
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
    disabled: false,
  };

  it('renders correct number of LearningGoalItem components', () => {
    const wrapper = shallow(<RubricEditor {...defaultProps} />);
    expect(wrapper.find(LearningGoalItem)).to.have.length(
      sampleLearningGoalList.length
    );
  });

  it('renders the "Add new Key Concept" button and it can be clicked when submittable levels are available', () => {
    const wrapper = shallow(<RubricEditor {...defaultProps} />);
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).to.have.length(1);
    addButton.simulate('click');
    expect(addNewConceptSpy).to.have.been.calledOnce;
  });

  it('renders the "Add new Key Concept" button with alternative text when disabled', () => {
    const wrapper = shallow(<RubricEditor {...defaultProps} disabled={true} />);
    const addButton = wrapper
      .find(Button)
      .findWhere(
        n => n.props().text === 'Create a submittable level to create a rubric'
      );
    expect(addButton).to.have.length(1);
    expect(addButton.props().disabled).to.be.true;
    expect(addNewConceptSpy).to.have.been.calledOnce;
  });
});
