import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';

describe('RubricsContainerTest', () => {
  it('adds and deletes Learning Goals when add or delete button is clicked', () => {
    // add LearningGoals
    const wrapper = mount(<RubricsContainer />);
    expect(wrapper.find('.uitest-learning-goal-card').length).to.equal(1);
    const addConceptButton = wrapper
      .find('#ui-test-add-new-concept-button')
      .first();
    addConceptButton.simulate('click');
    expect(wrapper.find('LearningGoalItem').length).to.equal(2);
    addConceptButton.simulate('click');
    expect(wrapper.find('LearningGoalItem').length).to.equal(3);

    // delete a Learning Goal
    expect(wrapper.find('LearningGoalItem').at(0).key()).to.equal('1');
    const firstDeleteButton = wrapper
      .find('LearningGoalItem')
      .at(0)
      .find('Button');
    firstDeleteButton.simulate('click');

    // validate that the item has been deleted
    expect(wrapper.find('LearningGoalItem').length).to.equal(2);
    expect(wrapper.find('LearningGoalItem').at(0).key()).to.equal('2');
  });
});
