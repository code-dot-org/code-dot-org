import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ActivityCardAndPreview from '@cdo/apps/levelbuilder/lesson-editor/ActivityCardAndPreview';

import {sampleActivities} from './activitiesTestData';

describe('ActivityCardAndPreview', () => {
  let defaultProps,
    setActivitySectionRef,
    updateTargetActivitySection,
    clearTargetActivitySection,
    generateActivitySectionKey,
    updateActivitySectionMetrics;
  beforeEach(() => {
    setActivitySectionRef = jest.fn();
    updateTargetActivitySection = jest.fn();
    clearTargetActivitySection = jest.fn();
    updateActivitySectionMetrics = jest.fn();
    generateActivitySectionKey = jest.fn();
    defaultProps = {
      activity: sampleActivities[0],
      activitiesCount: 1,
      setActivitySectionRef,
      updateTargetActivitySection,
      clearTargetActivitySection,
      updateActivitySectionMetrics,
      generateActivitySectionKey,
      targetActivitySectionPos: 1,
      activitySectionMetrics: [],
      hasLessonPlan: true,
      allowMajorCurriculumChanges: true,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivityCardAndPreview {...defaultProps} />);
    expect(wrapper.find('Connect(ActivityCard)').length).toBe(1);
    expect(wrapper.find('Activity').length).toBe(1);
  });

  it('hides preview when collapsed', () => {
    const wrapper = shallow(<ActivityCardAndPreview {...defaultProps} />);
    wrapper.setState({collapsed: true});

    expect(wrapper.find('Connect(ActivityCard)').length).toBe(1);
    expect(wrapper.find('Activity').length).toBe(0);
    expect(
      wrapper.contains(
        'This activity has been collapsed. Expand activity to see preview.'
      )
    ).toBe(true);
  });
});
