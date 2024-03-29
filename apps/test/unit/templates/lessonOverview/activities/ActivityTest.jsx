import {shallow} from 'enzyme';
import _ from 'lodash';
import React from 'react';

import Activity from '@cdo/apps/templates/lessonOverview/activities/Activity';

import {expect} from '../../../../util/reconfiguredChai';
import {sampleActivities} from '../../../lib/levelbuilder/lesson-editor/activitiesTestData';

describe('Activity', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      activity: sampleActivities[0],
    };
  });

  it('renders title and time', () => {
    const wrapper = shallow(<Activity {...defaultProps} />);
    expect(wrapper.contains('Main Activity')).to.be.true;
    expect(wrapper.contains(' (20 minutes)')).to.be.true;
  });

  it('renders only title if time is 0', () => {
    let updatedActivity = _.cloneDeep(sampleActivities[0]);
    updatedActivity.duration = 0;
    const wrapper = shallow(<Activity {...defaultProps} />);
    expect(wrapper.contains('Main Activity')).to.be.true;
    expect(wrapper.contains(' (0 minutes)')).to.be.false;
  });

  it('renders correct number of activity sections', () => {
    const wrapper = shallow(<Activity {...defaultProps} />);
    expect(wrapper.find('ActivitySection').length).to.equal(3);
  });
});
