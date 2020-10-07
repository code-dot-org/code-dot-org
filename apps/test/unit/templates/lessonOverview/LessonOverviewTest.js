import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import {UnconnectedLessonOverview as LessonOverview} from '@cdo/apps/templates/lessonOverview/LessonOverview';
import {sampleActivities} from '../../lib/levelbuilder/lesson-editor/activitiesTestData';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement
} from '../../code-studio/components/progress/FakeAnnouncementsTestData';

describe('LessonOverview', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview',
      activities: [],
      announcements: [],
      viewAs: ViewType.Teacher,
      isSignedIn: true,
      purpose: 'The purpose of the lesson is for people to learn',
      preparation: '- One'
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    expect(wrapper.contains('Lesson Name'), 'Lesson Name').to.be.true;

    const safeMarkdowns = wrapper.find('SafeMarkdown');
    expect(safeMarkdowns.at(0).props().markdown).to.contain('Lesson Overview');
    expect(safeMarkdowns.at(1).props().markdown).to.contain(
      'The purpose of the lesson is for people to learn'
    );
    expect(safeMarkdowns.at(2).props().markdown).to.contain('- One');
  });

  it('renders correct number of activities', () => {
    const wrapper = shallow(
      <LessonOverview {...defaultProps} activities={sampleActivities} />
    );
    expect(wrapper.find('Activity').length).to.equal(1);
  });

  it('has no announcements if none provided', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    assert.equal(wrapper.find('Announcements').props().announcements.length, 0);
  });

  it('has provided teacher announcements if necessary', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement
        ]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 2);
  });

  it('has student announcement if viewing as student', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        viewAs={ViewType.Student}
        announcements={[fakeStudentAnnouncement]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 1);
  });
});
