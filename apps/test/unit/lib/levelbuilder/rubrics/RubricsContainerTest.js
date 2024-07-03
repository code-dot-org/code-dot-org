import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import RubricEditor from '@cdo/apps/lib/levelbuilder/rubrics/RubricEditor';
import * as rubricHelper from '@cdo/apps/lib/levelbuilder/rubrics/rubricHelper';
import RubricsContainer from '@cdo/apps/lib/levelbuilder/rubrics/RubricsContainer';
import Button from '@cdo/apps/templates/Button';
import {RubricUnderstandingLevels} from '@cdo/generated-scripts/sharedConstants';



describe('RubricsContainerTest', () => {
  const defaultProps = {
    submittableLevels: [
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
    expect(wrapper.find('Heading1').text()).toBe('Create your rubric');
    expect(wrapper.find('select#rubric_level_id option')).toHaveLength(defaultProps.submittableLevels.length);
    expect(wrapper.find(RubricEditor)).toHaveLength(1);
    expect(wrapper.find('Button[text="Delete key concept"]')).toHaveLength(1);
    expect(wrapper.find(LearningGoalItem)).toHaveLength(1);
    expect(wrapper.find('Button[text="Save your rubric"]')).toHaveLength(1);
  });

  it('renders "the components on the page correctly for an exisiting rubric"', () => {
    const props = {...defaultProps, rubric: rubricInfo};
    const wrapper = mount(<RubricsContainer {...props} />);
    expect(wrapper.find('Heading1').text()).toBe('Modify your rubric');
    expect(wrapper.find('select#rubric_level_id option')).toHaveLength(defaultProps.submittableLevels.length);
    expect(wrapper.find(RubricEditor).prop('learningGoalList')).toBe(rubricInfo.learningGoals);
    expect(wrapper.find(LearningGoalItem)).toHaveLength(rubricInfo.learningGoals.length);
    expect(wrapper.find('Button[text="Save your rubric"]')).toHaveLength(1);
  });

  it('adds a new learning goal on "Add new Key Concept" button click', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    const initialLearningGoalItems = wrapper.find('LearningGoalItem').length;
    const addButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Add new Key Concept');
    expect(addButton).toHaveLength(1);
    addButton.simulate('click');
    const afterAddLearningGoalItems = wrapper.find('LearningGoalItem').length;
    expect(afterAddLearningGoalItems).toBe(initialLearningGoalItems + 1);
  });

  it('adds a deletes learning goal on "Delete Key Concept" button click', () => {
    const wrapper = mount(<RubricsContainer {...defaultProps} />);
    const initialLearningGoalItems = wrapper.find('LearningGoalItem').length;
    const deleteButton = wrapper
      .find(Button)
      .findWhere(n => n.props().text === 'Delete key concept');
    expect(deleteButton).toHaveLength(1);
    deleteButton.simulate('click');
    const afterAddDeletingGoalItems = wrapper.find('LearningGoalItem').length;
    expect(afterAddDeletingGoalItems).toBe(initialLearningGoalItems - 1);
  });

  it('changes the selected level for assessment when the dropdown is changed', () => {
    const wrapper = shallow(<RubricsContainer {...defaultProps} />);
    let dropdown = wrapper.find('select#rubric_level_id');
    const dropdownValue = dropdown.prop('value');
    expect(dropdownValue).toBe(defaultProps.submittableLevels[0].id);

    dropdown.simulate('change', {
      target: {value: defaultProps.submittableLevels[1].id},
    });
    dropdown = wrapper.find('select#rubric_level_id');
    expect(dropdown.prop('value')).toBe(defaultProps.submittableLevels[1].id);
  });

  it('changes the saveNotificationText and disables the save Button when saving rubric', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockClear().mockImplementation();
    mockFetch.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    const props = {...defaultProps, rubric: rubricInfo};

    const wrapper = mount(<RubricsContainer {...props} />);
    const notification = wrapper.find('BodyThreeText');

    expect(notification.text()).not.toContain('Saving...');
    expect(notification.text()).not.toContain('Save complete!');

    // Simulate the save button click
    let saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).toBe(false);
    saveButton.simulate('click');
    expect(notification.text()).toContain('Saving...');
    saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).toBe(true);

    // Allow state to change from the fetch request and the re-render of components
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();

    expect(notification.text()).toContain('Save complete!');
    saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).toBe(false);
    jest.restoreAllMocks();
  });

  it('calls the save helper on save click', () => {
    const mockSave = jest.spyOn(rubricHelper, 'saveRubricToTable').mockClear().mockImplementation();
    mockSave.mockReturnValue(
      Promise.resolve(new Response(JSON.stringify({redirectUrl: 'test_url'})))
    );

    const props = {...defaultProps, rubric: rubricInfo};

    const wrapper = mount(<RubricsContainer {...props} />);
    const notification = wrapper.find('BodyThreeText');

    expect(notification.text()).not.toContain('Saving...');
    expect(notification.text()).not.toContain('Save complete!');

    // Simulate the save button click
    let saveButton = wrapper.find('Button.ui-test-save-button');
    expect(saveButton.props().disabled).toBe(false);
    saveButton.simulate('click');
    expect(mockSave).toHaveBeenCalledWith();
    jest.restoreAllMocks();
  });
});
