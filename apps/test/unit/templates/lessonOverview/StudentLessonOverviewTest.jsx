import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';

import Button from '@cdo/apps/templates/Button';
import {UnconnectedStudentLessonOverview as StudentLessonOverview} from '@cdo/apps/templates/lessonOverview/StudentLessonOverview';
import {fakeLevels} from '@cdo/apps/templates/progress/progressTestHelpers';

import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
} from '../../code-studio/components/progress/FakeAnnouncementsTestData';

describe('StudentLessonOverview', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      lesson: {
        unit: {
          displayName: 'Unit 1',
          link: '/s/unit-1',
          lessonGroups: [
            {
              key: 'lg-1',
              displayName: 'Lesson Group',
              userFacing: true,
              lessons: [
                {
                  key: 'lesson-1',
                  position: 1,
                  displayName: 'Lesson 1',
                  link: '/lessons/1',
                  lockable: false,
                },
                {
                  key: 'lesson-2',
                  position: 2,
                  displayName: 'Lesson 2',
                  link: '/lessons/2',
                  lockable: false,
                },
              ],
            },
          ],
        },
        id: 1,
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
            type: 'Activity Guide',
          },
          {
            key: 'all-resource',
            name: 'All Resource',
            url: 'fake.url',
            download_url: 'download.fake.url',
            type: 'Activity Guide',
          },
        ],
        vocabularies: [
          {
            key: 'Algorithm',
            word: 'Algorithm',
            definition: 'A list of steps to finish a task.',
          },
        ],
        programmingExpressions: [
          {
            name: 'playSound',
            syntax: 'playSound',
            link: '/docs/applab/playSound',
          },
        ],
        studentLessonPlanPdfUrl:
          'https://lesson-plans.code.org/unit-1/20210302010608/student/lesson-1.pdf',
      },
      activities: [],
      announcements: [],
      isSignedIn: true,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).toContain('/s/unit-1');
    expect(navLink.contains('< Unit 1')).toBe(true);

    expect(wrapper.find('LessonNavigationDropdown').length).toBe(1);

    // Lesson Name
    expect(wrapper.contains('Lesson 1: Lesson 1')).toBe(true);

    const enhancedSafeMarkdowns = wrapper.find('EnhancedSafeMarkdown');
    expect(enhancedSafeMarkdowns.at(0).props().markdown).toContain(
      'Lesson Overview'
    );

    const inlineMarkdowns = wrapper.find('InlineMarkdown');

    // The first contains the vocabulary
    expect(inlineMarkdowns.at(0).props().markdown).toContain(
      '**Algorithm** - A list of steps to finish a task.'
    );
  });

  it('show print button if there is a pdf', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);

    expect(
      wrapper.containsMatchingElement(
        <Button
          href={
            'https://lesson-plans.code.org/unit-1/20210302010608/student/lesson-1.pdf'
          }
          text="Print"
        />
      )
    ).toBe(true);
  });

  it('hide print button if there is no pdf', () => {
    let myProps = defaultProps;
    myProps.lesson.studentLessonPlanPdfUrl = null;
    const wrapper = shallow(<StudentLessonOverview {...myProps} />);

    expect(
      wrapper.containsMatchingElement(
        <Button
          href={
            'https://lesson-plans.code.org/unit-1/20210302010608/student/lesson-1.pdf'
          }
          text="Print"
        />
      )
    ).toBe(false);
  });

  it('has no announcements if none provided', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    expect(wrapper.find('Announcements').props().announcements.length).toEqual(
      0
    );
  });

  it('has student announcements', () => {
    const wrapper = shallow(
      <StudentLessonOverview
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
        ]}
      />
    );
    expect(wrapper.find('Announcements').props().announcements.length).toEqual(
      2
    );
  });

  it('displays the student resources', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    const resourceSection = wrapper.find('#resource-section');
    expect(resourceSection.find('ResourceList').length).toEqual(1);
  });

  it('does not display the resources section if there are no student resources', () => {
    let myProps = defaultProps;
    myProps.lesson.resources = [];
    const wrapper = shallow(<StudentLessonOverview {...myProps} />);
    expect(wrapper.find('#resource-section').length).toEqual(0);
  });

  it('displays the introduced code', () => {
    const wrapper = shallow(<StudentLessonOverview {...defaultProps} />);
    const codeSection = wrapper.find('#unit-test-introduced-code');
    expect(codeSection.find('StyledCodeBlock').length).toEqual(1);
  });

  it('does not display the introduced code if no code', () => {
    const newDefaultProps = _.cloneDeep(defaultProps);
    newDefaultProps.lesson.programmingExpressions = [];

    const wrapper = shallow(<StudentLessonOverview {...newDefaultProps} />);
    expect(wrapper.find('#unit-test-introduced-code').length).toEqual(0);
  });

  it('displays levels with progress if levels present', () => {
    const lessonLevels = fakeLevels(4);
    const wrapper = shallow(
      <StudentLessonOverview {...defaultProps} lessonLevels={lessonLevels} />
    );
    expect(wrapper.find('#level-section').length).toEqual(1);
    expect(wrapper.text()).toContain('Lesson 1');
  });

  it('Does not render levels if no levels present', () => {
    const wrapper = shallow(
      <StudentLessonOverview {...defaultProps} lessonLevels={[]} />
    );
    expect(wrapper.find('#level-section')).toEqual({});
  });
});
