import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import Button from '@cdo/apps/templates/Button';

describe('RubricsContainerTest', () => {
  const defaultProps = {
    levels: [
      {id: 1, name: 'level 1', properties: {submittable: 'false'}},
      {id: 2, name: 'level 2', properties: {submittable: 'true'}},
      {id: 3, name: 'level 3', properties: {submittable: 'true'}},
    ],
    unitName: 'sample unit',
    lessonNumber: 0,
  };

  it('renders the components on the page correctly for a new rubric', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(2);
    expect(wrapper.find(LearningGoalItem)).to.have.length(1);
    expect(wrapper.find('Button[text="Save your rubric"]')).to.have.length(1);
  });

  it('adds a new learning goal on "Add new Key Concept" button click', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    const initialLearningGoalItems = wrapper.find('LearningGoalItem').length;
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).to.have.length(1);
    addButton.simulate('click');
    const afterAddLearningGoalItems = wrapper.find('LearningGoalItem').length;
    expect(afterAddLearningGoalItems).to.equal(initialLearningGoalItems + 1);
  });
});
