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

  it('renders default props and ProgressLevelSet', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.find('Connect(ProgressLevelSet)').length).toBe(1);
  });

  it('can show level details dialog after bubble click', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.find('Connect(ProgressLevelSet)').length).toBe(1);
    wrapper.instance().handleBubbleClick({id: 1});
    expect(wrapper.find('Connect(LevelDetailsDialog)').length).toBe(1);
  });
});
