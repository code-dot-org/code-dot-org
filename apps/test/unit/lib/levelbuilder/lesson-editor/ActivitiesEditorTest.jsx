import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitiesEditor as ActivitiesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {sampleActivities} from './activitiesTestData';

describe('ActivitiesEditor', () => {
  let defaultProps, addActivity;
  beforeEach(() => {
    addActivity = sinon.spy();
    defaultProps = {
      activities: sampleActivities,
      addActivity
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.contains('Preview')).to.be.true;
    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.find('Connect(ActivityCard)').length).to.equal(1);
    expect(wrapper.find('Activity').length).to.equal(1);

    const hiddenInputs = wrapper.find('input[type="hidden"]');
    expect(hiddenInputs.length, 'hidden input').to.equal(1);
    const serializedActivities = hiddenInputs.first().props().value;

    // Verify that the JSON contains serialized activities.
    const activities = JSON.parse(serializedActivities);
    expect(activities.length).to.equal(1);
    expect(activities[0].key).to.equal('activity-1');
    const sections = activities[0].activitySections;
    expect(sections.length).to.equal(3);
    expect(sections[0].key).to.equal('section-3');
  });

  it('adds activity when button pressed', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);

    const button = wrapper.find('button');
    expect(button.text()).to.include('Activity');
    button.simulate('click');
    expect(addActivity).to.have.been.calledOnce;
  });
});
