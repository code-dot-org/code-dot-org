import React from 'react';
import {mount, shallow} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {expect} from '../../../../util/reconfiguredChai';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import Button from '@cdo/apps/templates/Button';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
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
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(
      defaultProps.levels.length
    );
    expect(wrapper.find(LearningGoalItem)).to.have.length(1);
    expect(wrapper.find('Button[text="Save your rubric"]')).to.have.length(1);
  });

  it('renders "the components on the page correctly for an exisiting rubric"', () => {
    const props = {...defaultProps, rubric: rubricInfo};
    const wrapper = mount(<RubricsContainer {...props} />);
    expect(wrapper.find('Heading1').text()).to.equal('Modify your rubric');
    expect(wrapper.find('select#rubric_level_id option')).to.have.length(
      props.levels.length
    );
    expect(wrapper.find(LearningGoalItem)).to.have.length(
      rubricInfo.learningGoals.length
    );
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

  it('changes the selected level for assessment when the dropdown is changed', () => {
    const wrapper = shallow(<RubricsContainer {...defaultProps} />);
    let dropdown = wrapper.find('select#rubric_level_id');
    const dropdownValue = dropdown.prop('value');
    expect(dropdownValue).to.equal(defaultProps.levels[0].id);

    dropdown.simulate('change', {target: {value: defaultProps.levels[1].id}});
    dropdown = wrapper.find('select#rubric_level_id');
    expect(dropdown.prop('value')).to.equal(defaultProps.levels[1].id);
  });

  it('changes the saveNotificationText and disables the save Button when saving rubric', async () => {
    const mockFetch = sinon.stub(global, 'fetch');
    mockFetch.returns(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    const props = {...defaultProps, rubric: rubricInfo};

    const wrapper = mount(<RubricsContainer {...props} />);
    const notification = wrapper.find('BodyThreeText');

    expect(notification.text()).not.to.contain('Saving...');
    expect(notification.text()).not.to.contain('Save complete!');

    // Simulate the save button click
    let saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).to.be.false;
    saveButton.simulate('click');
    expect(notification.text()).to.contain('Saving...');
    saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).to.be.true;
    expect(saveButton.props().testProp).to.equal('Saving...');

    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();

    expect(notification.text()).to.contain('Save complete!');
    saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).to.be.false;
    sinon.restore();
  });
});
