import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import Button from '@cdo/apps/templates/Button';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';

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

  const rubricInfo = {
    learningGoals: [
      {
        key: 'ui-1',
        id: 'ui-1',
        learningGoal: '',
        aiEnabled: false,
        position: 1,
        learningGoalEvidenceLevelsAttributes: [
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.NONE,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.LIMITED,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.CONVINCING,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.EXTENSIVE,
            aiPrompt: '',
          },
        ],
      },
      {
        key: 'ui-2',
        id: 'ui-2',
        learningGoal: '',
        aiEnabled: false,
        position: 2,
        learningGoalEvidenceLevelsAttributes: [
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.NONE,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.LIMITED,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.CONVINCING,
            aiPrompt: '',
          },
          {
            teacherDescription: '',
            understanding: RubricUnderstandingLevels.EXTENSIVE,
            aiPrompt: '',
          },
        ],
      },
    ],
  };

  it('renders the components on the page correctly for a new rubric', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    expect(wrapper.find('Heading1').text()).to.equal('Create your rubric');
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(3);
    expect(wrapper.find(LearningGoalItem)).to.have.length(1);
    expect(wrapper.find('Button[text="Save your rubric"]')).to.have.length(1);
  });

  it('renders "the components on the page correctly for an exisiting rubric"', () => {
    const props = {...defaultProps, rubric: rubricInfo};
    const wrapper = mount(<RubricsContainer {...props} />);
    expect(wrapper.find('Heading1').text()).to.equal('Modify your rubric');
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(3);
    expect(wrapper.find(LearningGoalItem)).to.have.length(2);
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
