import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';

import {sampleActivities} from '../../../levelbuilder/lesson-editor/activitiesTestData';

describe('ProgressionDetails', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      section: sampleActivities[0].activitySections[2],
    };
  });

  it('renders without errors', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('can show level details dialog after bubble click', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    wrapper.instance().handleBubbleClick({id: 1});
    expect(wrapper.find('Connect(LevelDetailsDialog)').length).toBe(1);
  });
});
