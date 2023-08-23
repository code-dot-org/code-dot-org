import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import sinon from 'sinon';

describe('RubricsContainerTest', () => {
  const defaultProps = {
    levels: [
      {id: 1, name: 'level 1'},
      {id: 2, name: 'level 2'},
      {id: 3, name: 'level 3'},
    ],
    unitName: 'sample unit',
    lessonNumber: 0,
  };

  it('renders the components on the page correctly for a new rubric', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(3);
    expect(wrapper.find(LearningGoalItem)).to.have.length(1);
    expect(wrapper.find('Button[text="Save your rubric"]')).to.have.length(1);
  });

  it('adds a new learning goal on "Add new Key Concept" button click', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    const initialLearningGoalItems = wrapper.find('LearningGoalItem').length;
    wrapper.find('RubricEditor').invoke('addNewConcept')({
      preventDefault: sinon.spy(),
    });
    wrapper.update();
    const afterAddLearningGoalItems = wrapper.find('LearningGoalItem').length;
    expect(afterAddLearningGoalItems).to.equal(initialLearningGoalItems + 1);
  });
});
