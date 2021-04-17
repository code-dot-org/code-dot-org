import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgressionDetails from '@cdo/apps/templates/lessonOverview/activities/ProgressionDetails';
import {sampleActivities} from '../../../lib/levelbuilder/lesson-editor/activitiesTestData';

describe('ProgressionDetails', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      section: sampleActivities[0].activitySections[2]
    };
  });

  it('renders default props and ProgressLevelSet', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.find('Connect(ProgressLevelSet)').length).to.equal(1);
  });

  it('can show level details dialog after bubble click', () => {
    const wrapper = shallow(<ProgressionDetails {...defaultProps} />);
    expect(wrapper.find('Connect(ProgressLevelSet)').length).to.equal(1);
    wrapper.instance().handleBubbleClick({id: 1});
    expect(wrapper.find('Connect(LevelDetailsDialog)').length).to.equal(1);
  });
});
