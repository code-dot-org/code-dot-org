import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivityCard as ActivityCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivityCard';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivityCard', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activity: sampleActivities[0],
      activitiesCount: 1,
      addActivitySection: sinon.spy(),
      removeActivity: sinon.spy(),
      moveActivity: sinon.spy(),
      updateActivityField: sinon.spy(),
      setActivitySectionMetrics: sinon.spy(),
      setTargetActivitySection: sinon.spy(),
      targetActivitySectionPos: 1,
      activitySectionMetrics: {}
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivityCard {...defaultProps} />);
    expect(wrapper.contains('Activity:'));
    expect(wrapper.contains('Time (mins):'));
    expect(wrapper.find('OrderControls').length).to.equal(1);
    //expect(wrapper.find('ActivitySectionCard').length).to.equal(1);
    expect(wrapper.find('button').length).to.equal(1);
  });
});
