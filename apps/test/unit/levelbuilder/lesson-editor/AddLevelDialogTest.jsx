import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddLevelDialog from '@cdo/apps/levelbuilder/lesson-editor/AddLevelDialog';

import {sampleActivities} from './activitiesTestData';

describe('AddLevelDialog', () => {
  let defaultProps, handleConfirm, addLevel;
  beforeEach(() => {
    handleConfirm = jest.fn();
    addLevel = jest.fn();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      addLevel,
      activityPosition: 1,
      activitySection: sampleActivities[0].activitySections[2],
      allowMajorCurriculumChanges: true,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelDialog {...defaultProps} />);

    expect(wrapper.contains('Add Levels')).toBe(true);
    expect(wrapper.find('LessonEditorDialog').length).toBe(1);
    expect(wrapper.find('Connect(AddLevelDialogTop)').length).toBe(1);
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).toBe(2);
    expect(wrapper.find('FontAwesome').length).toBe(0); // no spinner
  });
});
