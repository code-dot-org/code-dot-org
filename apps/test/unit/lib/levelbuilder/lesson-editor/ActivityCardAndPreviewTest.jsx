import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import ActivityCardAndPreview from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCardAndPreview';
import {sampleActivities} from './activitiesTestData';

describe('ActivityCardAndPreview', () => {
  let defaultProps,
    setActivitySectionRef,
    updateTargetActivitySection,
    clearTargetActivitySection,
    generateActivitySectionKey,
    updateActivitySectionMetrics;
  beforeEach(() => {
    setActivitySectionRef = sinon.spy();
    updateTargetActivitySection = sinon.spy();
    clearTargetActivitySection = sinon.spy();
    updateActivitySectionMetrics = sinon.spy();
    generateActivitySectionKey = sinon.spy();
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
      hasLessonPlan: true
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivityCardAndPreview {...defaultProps} />);
    expect(wrapper.find('Connect(ActivityCard)').length).to.equal(1);
    expect(wrapper.find('Activity').length).to.equal(1);
  });

  it('hides preview when collapsed', () => {
    const wrapper = shallow(<ActivityCardAndPreview {...defaultProps} />);
    wrapper.setState({collapsed: true});

    expect(wrapper.find('Connect(ActivityCard)').length).to.equal(1);
    expect(wrapper.find('Activity').length).to.equal(0);
    expect(
      wrapper.contains(
        'This activity has been collapsed. Expand activity to see preview.'
      )
    ).to.be.true;
  });
});
