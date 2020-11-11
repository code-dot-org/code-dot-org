import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitiesEditor as ActivitiesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {sampleActivities} from './activitiesTestData';

describe('ActivitiesEditor', () => {
  let defaultProps, addActivity, serializeActivities;
  beforeEach(() => {
    addActivity = sinon.spy();
    serializeActivities = sinon.spy();
    defaultProps = {
      activities: sampleActivities,
      addActivity,
      serializeActivities
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.find('ActivityCardAndPreview').length).to.equal(1);
  });

  it('adds activity when button pressed', () => {
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);

    const button = wrapper.find('button');
    expect(button.text()).to.include('Activity');
    button.simulate('mouseDown');
    expect(addActivity).to.have.been.calledOnce;
  });
});
