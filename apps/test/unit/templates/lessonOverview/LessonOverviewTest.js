import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedLessonOverview as LessonOverview} from '@cdo/apps/templates/lessonOverview/LessonOverview';
import {sampleActivities} from '../../lib/levelbuilder/lesson-editor/activitiesTestData';

describe('LessonOverview', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview',
      activities: [],
      announcements: [],
      viewAs: 'Teacher',
      isSignedIn: true,
      purpose: 'The purpose of the lesson is for people to learn',
      preparation: '- One'
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    expect(wrapper.contains('Lesson Name'));
    expect(wrapper.contains('Lesson Overview'));
    expect(
      wrapper.contains('The purpose of the lesson is for people to learn')
    );
    expect(wrapper.contains('- One'));
  });

  it('renders correct number of activities', () => {
    const wrapper = shallow(
      <LessonOverview {...defaultProps} activities={sampleActivities} />
    );
    expect(wrapper.find('Activity').length).to.equal(1);
  });
});
