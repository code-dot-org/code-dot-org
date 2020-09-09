import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ActivitySection from '@cdo/apps/templates/lessonOverview/activities/ActivitySection';
import {sampleActivities} from '../../../lib/levelbuilder/lesson-editor/activitiesTestData';

describe('ActivitySection', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      section: sampleActivities[0].activitySections[0]
    };
  });

  it('Renders description section with remarks correctly', () => {
    const wrapper = shallow(<ActivitySection {...defaultProps} />);
    expect(wrapper.find('ProgressionDetails').length).to.equal(0);
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.contains('Remarks'));
    expect(wrapper.find('FontAwesome[icon="microphone"]').length).to.equal(1);
  });

  it('Renders description section with slides', () => {
    const wrapper = shallow(
      <ActivitySection section={sampleActivities[0].activitySections[1]} />
    );
    expect(wrapper.find('ProgressionDetails').length).to.equal(0);
    expect(wrapper.find('SafeMarkdown').length).to.equal(1);
    expect(wrapper.find('FontAwesome[icon="list-alt"]').length).to.equal(1);
  });

  it('Shows progression details if there are levels', () => {
    const wrapper = shallow(
      <ActivitySection section={sampleActivities[0].activitySections[2]} />
    );
    expect(wrapper.find('ProgressionDetails').length).to.equal(1);
    expect(wrapper.find('SafeMarkdown').length).to.equal(0);
  });

  it('Shows correct number of lesson tips', () => {
    const wrapper = shallow(
      <ActivitySection section={sampleActivities[0].activitySections[1]} />
    );
    expect(wrapper.find('LessonTip').length).to.equal(1);
  });
});
