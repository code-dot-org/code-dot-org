import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';
import {sampleActivities} from '../../../lib/levelbuilder/lesson-editor/activitiesTestData';

describe('Activity', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activity: sampleActivities[0]
    };
  });

  it('renders title and time', () => {
    const wrapper = shallow(<Activity {...defaultProps} />);
    expect(wrapper.contains('Main Activity(20 minutes)'));
  });

  it('renders correct number of activity sections', () => {
    const wrapper = shallow(<Activity {...defaultProps} />);
    expect(wrapper.find('ActivitySection').length).to.equal(3);
  });
});
