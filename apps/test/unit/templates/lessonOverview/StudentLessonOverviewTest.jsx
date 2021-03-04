import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from '../../../util/reconfiguredChai';
import {UnconnectedStudentLessonOverview as StudentLessonOverview} from '@cdo/apps/templates/lessonOverview/StudentLessonOverview';
import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement
} from '../../code-studio/components/progress/FakeAnnouncementsTestData';

describe('StudentLessonOverview', () => {
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
        displayName: 'Lesson 1',
        overview: 'Lesson Overview',
        resources: [
          {
            key: 'student-resource',
            name: 'Student Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide'
          },
          {
            key: 'all-resource',
            name: 'All Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide'
          }
        ],
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
      isSignedIn: true
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).to.contain('/s/unit-1');
    expect(navLink.contains('< Unit 1')).to.be.true;

    expect(wrapper.find('LessonNavigationDropdown').length).to.equal(1);

    expect(wrapper.contains('Lesson 1: Lesson 1'), 'Lesson Name').to.be.true;

    const enhancedSafeMarkdowns = wrapper.find('EnhancedSafeMarkdown');
    expect(enhancedSafeMarkdowns.at(0).props().markdown).to.contain(
      'Lesson Overview'
    );

    const inlineMarkdowns = wrapper.find('InlineMarkdown');

    // The first contains the vocabulary
    expect(inlineMarkdowns.at(0).props().markdown).to.contain(
      '**Algorithm** - A list of steps to finish a task.'
    );
  });

  it('has no announcements if none provided', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    assert.equal(wrapper.find('Announcements').props().announcements.length, 0);
  });

  it('has student announcements', () => {
    const wrapper = shallow(
      <StudentLessonOverview
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement
        ]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 2);
  });

  it('displays the student resources', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    const resourceSection = wrapper.find('#resource-section');
    assert.equal(resourceSection.find('ul').length, 1);
    assert.equal(resourceSection.find('li').length, 2);
  });

  it('does not display the resources section if there are no student resources', () => {
    let myProps = defaultProps;
    myProps.lesson.resources = [];
    const wrapper = shallow(<StudentLessonOverview {...myProps} />);
    assert.equal(wrapper.find('#resource-section').length, 0);
  });
});
