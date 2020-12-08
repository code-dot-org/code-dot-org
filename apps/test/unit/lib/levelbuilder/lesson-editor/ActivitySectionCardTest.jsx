import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitySectionCard as ActivitySectionCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCard';
import sinon from 'sinon';
import {sampleActivities} from './activitiesTestData';

describe('ActivitySectionCard', () => {
  let defaultProps,
    setTargetActivitySection,
    updateTargetActivitySection,
    clearTargetActivitySection,
    updateActivitySectionMetrics,
    moveActivitySection,
    removeActivitySection,
    updateActivitySectionField,
    reorderLevel,
    moveLevelToActivitySection,
    addLevel;
  beforeEach(() => {
    setTargetActivitySection = sinon.spy();
    updateTargetActivitySection = sinon.spy();
    clearTargetActivitySection = sinon.spy();
    updateActivitySectionMetrics = sinon.spy();
    moveActivitySection = sinon.spy();
    removeActivitySection = sinon.spy();
    updateActivitySectionField = sinon.spy();
    reorderLevel = sinon.spy();
    moveLevelToActivitySection = sinon.spy();
    addLevel = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[0],
      activityPosition: 1,
      activitySectionsCount: 3,
      activitiesCount: 1,
      activitySectionMetrics: [],
      updateTargetActivitySection,
      clearTargetActivitySection,
      updateActivitySectionMetrics,
      setTargetActivitySection,
      targetActivitySectionPos: 1,

      //redux
      moveActivitySection,
      removeActivitySection,
      updateActivitySectionField,
      reorderLevel,
      moveLevelToActivitySection,
      addLevel
    };
  });

  it('renders activity section without levels', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).to.equal(
      1
    );
    expect(wrapper.find('LevelToken').length).to.equal(0);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Slides')).to.be.true;
    expect(wrapper.contains('Remarks')).to.be.true;
  });

  it('renders activity section with levels', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).to.equal(
      1
    );
    expect(wrapper.find('Connect(LevelToken)').length).to.equal(2);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Slides')).to.be.true;
  });

  it('edit activity section title', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    titleInput.simulate('change', {target: {value: 'New Title'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'displayName',
      'New Title'
    );
  });

  it('edit activity section slides', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(2);
    titleInput.simulate('change', {target: {value: ''}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'slide',
      true
    );
  });

  it('edit activity section remarks', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(1);
    titleInput.simulate('change', {target: {value: ''}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'remarks',
      false
    );
  });

  it('edit activity section description', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('textarea').at(0);
    titleInput.simulate('change', {target: {value: 'My section description'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'text',
      'My section description'
    );
  });
});
