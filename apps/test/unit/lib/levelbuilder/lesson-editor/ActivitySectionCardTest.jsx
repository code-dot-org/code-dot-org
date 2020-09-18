import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitySectionCard as ActivitySectionCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCard';
import sinon from 'sinon';
import {sampleActivities} from './activitiesTestData';

describe('ActivitySectionCard', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[0],
      activityPosition: 1,
      activitySectionsCount: 3,
      activitiesCount: 1,
      activitySectionMetrics: {},
      setTargetActivitySection: sinon.spy(),
      targetActivitySectionPos: 1,

      //redux
      moveActivitySection: sinon.spy(),
      removeActivitySection: sinon.spy(),
      updateActivitySectionField: sinon.spy(),
      addTip: sinon.spy(),
      reorderLevel: sinon.spy(),
      moveLevelToActivitySection: sinon.spy(),
      addLevel: sinon.spy()
    };
  });

  it('renders activity section without levels', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);
    expect(wrapper.find('ActivitySectionCardButtons').length).to.equal(1);
    expect(wrapper.find('LevelToken').length).to.equal(0);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Slides'));
    expect(wrapper.contains('Remarks'));
  });

  it('renders activity section with levels', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );
    expect(wrapper.find('ActivitySectionCardButtons').length).to.equal(1);
    //expect(wrapper.find('LevelToken').length).to.equal(2);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Slides'));
  });
});
