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
      lesson: {
        unit: {
          displayName: 'Unit 1',
          link: '/s/unit-1',
          lessons: [
            {
              key: 'lesson-1',
              position: 1,
              displayName: 'Lesson 1',
              link: '/lessons/1',
              lockable: false
            },
            {
              key: 'lesson-2',
              position: 2,
              displayName: 'Lesson 2',
              link: '/lessons/2',
              lockable: false
            }
          ]
        },
        key: 'lesson-1',
        position: 1,
        lockable: false,
        displayName: 'Lesson 1',
        overview: 'Lesson Overview',
        purpose: 'The purpose of the lesson is for people to learn',
        preparation: '- One',
        assessmentOpportunities: 'Assessment Opportunities Details',
        resources: {
          Teacher: [
            {
              key: 'teacher-resource',
              name: 'Teacher Resource',
              url: 'fake.url',
              type: 'Slides'
            }
          ],
          Student: [
            {
              key: 'student-resource',
              name: 'Student Resource',
              url: 'fake.url',
              download_url: 'download.fake.url',
              type: 'Activity Guide'
            }
          ]
        },
        objectives: [{id: 1, description: 'what students will learn'}],
        vocabularies: [
          {
            key: 'Algorithm',
            word: 'Algorithm',
            definition: 'A list of steps to finish a task.'
          }
        ]
      },
      activities: [],
      announcements: [],
      viewAs: ViewType.Teacher,
      isSignedIn: true
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).to.contain('/s/unit-1');
    expect(navLink.contains('< Unit 1')).to.be.true;

    expect(wrapper.find('LessonNavigationDropdown').length).to.equal(1);

    expect(wrapper.contains('Lesson 1: Lesson 1'), 'Lesson Name').to.be.true;

    const safeMarkdowns = wrapper.find('SafeMarkdown');
    expect(safeMarkdowns.at(0).props().markdown).to.contain('Lesson Overview');
    expect(safeMarkdowns.at(1).props().markdown).to.contain(
      'The purpose of the lesson is for people to learn'
    );
    expect(safeMarkdowns.at(2).props().markdown).to.contain(
      'Assessment Opportunities Details'
    );
    expect(safeMarkdowns.at(3).props().markdown).to.contain('- One');

    const inlineMarkdowns = wrapper.find('InlineMarkdown');

    // The first contains the objective
    expect(inlineMarkdowns.at(0).props().markdown).to.contain(
      'what students will learn'
    );
    // The second contains the vocabulary
    expect(inlineMarkdowns.at(1).props().markdown).to.contain(
      '**Algorithm** - A list of steps to finish a task.'
    );

    expect(wrapper.find('LessonAgenda').length).to.equal(1);
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

  it('displays the resources', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    const resourceSection = wrapper.find('#resource-section');
    assert.equal(resourceSection.find('ul').length, 2);
  });
});
