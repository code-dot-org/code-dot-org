import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {sampleActivities} from '../../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';

describe('ProgressionDetails', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      progression: sampleActivities[0].activitySections[2]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.find('ProgressLevelSet').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
  });
});
