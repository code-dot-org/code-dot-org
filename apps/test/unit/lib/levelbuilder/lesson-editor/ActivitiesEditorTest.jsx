import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitiesEditor as ActivitiesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {sampleActivities} from './activitiesTestData';

describe('ActivitiesEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activities: sampleActivities,
      addActivity: sinon.spy()
    };
  });

  it('renders default props', () => {
    console.log(sampleActivities);
    const wrapper = shallow(<ActivitiesEditor {...defaultProps} />);
    //expect(wrapper.find('ActivityCard').length).to.equal(1);
    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.contains('Preview'));
    expect(wrapper.find('Activity').length).to.equal(1);
  });
});
