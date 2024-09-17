import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedActivitiesEditor as ActivitiesEditor} from '@cdo/apps/levelbuilder/lesson-editor/ActivitiesEditor';

import {sampleActivities} from './activitiesTestData';

describe('ActivitiesEditor', () => {
  let defaultProps, addActivity;
  beforeEach(() => {
    addActivity = jest.fn();
    defaultProps = {
      activities: sampleActivities,
      hasLessonPlan: true,
      allowMajorCurriculumChanges: true,
      addActivity,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(1);
    expect(wrapper.find('ActivityCardAndPreview').length).toBe(1);

    const hiddenInputs = wrapper.find('input[type="hidden"]');
    // hidden input
    expect(hiddenInputs.length).toBe(1);
  });

  it('renders without activity button if hasLessonPlan false', () => {
    const wrapper = shallow(
      <ActivitiesEditor {...defaultProps} hasLessonPlan={false} />
    );
    expect(wrapper.find('button').length).toBe(0);
    expect(wrapper.find('ActivityCardAndPreview').length).toBe(1);

    const hiddenInputs = wrapper.find('input[type="hidden"]');
    // hidden input
    expect(hiddenInputs.length).toBe(1);
  });

  it('adds activity when activity button pressed', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(1);

    const button = wrapper.find('button').at(0);
    expect(button.text()).toContain('Activity');
    button.simulate('mouseDown');
    expect(addActivity).toHaveBeenCalledWith(
      1,
      'activity-2',
      'activitySection-1'
    );
  });
});
