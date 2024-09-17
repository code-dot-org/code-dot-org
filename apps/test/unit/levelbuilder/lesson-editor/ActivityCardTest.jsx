import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedActivityCard as ActivityCard} from '@cdo/apps/levelbuilder/lesson-editor/ActivityCard';

import {
  sampleActivities,
  sampleActivityForLessonWithoutLessonPlan,
} from './activitiesTestData';

describe('ActivityCard', () => {
  let defaultProps,
    addActivitySection,
    removeActivity,
    moveActivity,
    updateActivityField,
    setActivitySectionRef,
    updateTargetActivitySection,
    clearTargetActivitySection,
    handleCollapse,
    generateActivitySectionKey,
    updateActivitySectionMetrics;
  beforeEach(() => {
    addActivitySection = jest.fn();
    removeActivity = jest.fn();
    moveActivity = jest.fn();
    updateActivityField = jest.fn();
    setActivitySectionRef = jest.fn();
    updateTargetActivitySection = jest.fn();
    clearTargetActivitySection = jest.fn();
    updateActivitySectionMetrics = jest.fn();
    handleCollapse = jest.fn();
    generateActivitySectionKey = jest.fn();
    defaultProps = {
      activity: sampleActivities[0],
      activitiesCount: 1,
      addActivitySection,
      removeActivity,
      moveActivity,
      updateActivityField,
      setActivitySectionRef,
      updateTargetActivitySection,
      clearTargetActivitySection,
      updateActivitySectionMetrics,
      generateActivitySectionKey,
      targetActivitySectionPos: 1,
      activitySectionMetrics: [],
      handleCollapse,
      collapsed: false,
      hasLessonPlan: true,
      allowMajorCurriculumChanges: true,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);
    expect(wrapper.contains('Activity:')).toBe(true);
    expect(wrapper.contains('Duration:')).toBe(true);
    expect(wrapper.find('OrderControls').length).toBe(1);
    expect(wrapper.find('Connect(ActivitySectionCard)').length).toBe(3);
    expect(wrapper.find('button').length).toBe(1);
  });

  it('show OrderControls when not allowed to make major curriculum changes but there are no levels in activity', () => {
    const activityWithNoLevels = {
      key: 'activity-1',
      displayName: 'Main Activity',
      position: 1,
      duration: 20,
      activitySections: [
        {
          key: 'section-3',
          position: 1,
          displayName: 'Making programs',
          duration: 10,
          remarks: true,
          scriptLevels: [],
          text: 'Simple text',
          tips: [],
        },
        {
          key: 'section-1',
          position: 2,
          displayName: '',
          duration: 0,
          remarks: false,
          scriptLevels: [],
          text: 'Details about this section',
          tips: [
            {
              key: 'tip-1',
              type: 'teachingTip',
              markdown: 'Teaching tip content',
            },
            {
              key: 'tip-2',
              type: 'discussionGoal',
              markdown: 'Discussion Goal content',
            },
          ],
        },
      ],
    };
    const wrapper = shallow(
      <ActivityCard
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        activity={activityWithNoLevels}
      />
    );
    expect(wrapper.find('OrderControls').length).toBe(1);
  });

  it('hides OrderControls when not allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <ActivityCard {...defaultProps} allowMajorCurriculumChanges={false} />
    );
    expect(wrapper.find('OrderControls').length).toBe(0);
  });

  it('shows OrderControls when allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <ActivityCard {...defaultProps} allowMajorCurriculumChanges={true} />
    );
    expect(wrapper.find('OrderControls').length).toBe(1);
  });

  it('renders correct fields for lesson without lesson plan', () => {
    const wrapper = shallow(
      <ActivityCard
        {...defaultProps}
        hasLessonPlan={false}
        activity={sampleActivityForLessonWithoutLessonPlan}
      />
    );
    expect(wrapper.contains('Activity:')).toBe(false);
    expect(wrapper.contains('Duration:')).toBe(true);
    expect(wrapper.find('OrderControls').length).toBe(0);
    expect(wrapper.find('Connect(ActivitySectionCard)').length).toBe(1);
    expect(wrapper.find('button').length).toBe(1);
  });

  it('adds activity section when button pressed', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);
    expect(wrapper.find('button').length).toBe(1);

    const button = wrapper.find('button');
    expect(button.text()).toContain('Activity Section');
    button.simulate('mouseDown');
    expect(addActivitySection).toHaveBeenCalledTimes(1);
    expect(generateActivitySectionKey).toHaveBeenCalledTimes(1);
  });

  it('edit activity title', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    titleInput.simulate('change', {target: {value: 'New Title'}});
    expect(updateActivityField).toHaveBeenCalledWith(
      1,
      'displayName',
      'New Title'
    );
  });

  it('edit activity duration', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(1);
    titleInput.simulate('change', {target: {value: '1000'}});
    expect(updateActivityField).toHaveBeenCalledWith(1, 'duration', 1000);
  });
});
