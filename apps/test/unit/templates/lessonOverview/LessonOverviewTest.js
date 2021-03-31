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
import _ from 'lodash';

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
        ],
        programmingExpressions: [
          {
            name: 'playSound',
            link: '/docs/applab/playSound'
          }
        ],
        standards: [],
        opportunityStandards: []
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

    const enhancedSafeMarkdowns = wrapper.find('EnhancedSafeMarkdown');
    expect(enhancedSafeMarkdowns.at(0).props().markdown).to.contain(
      'Lesson Overview'
    );
    expect(enhancedSafeMarkdowns.at(1).props().markdown).to.contain(
      'The purpose of the lesson is for people to learn'
    );
    expect(enhancedSafeMarkdowns.at(2).props().markdown).to.contain(
      'Assessment Opportunities Details'
    );
    expect(enhancedSafeMarkdowns.at(3).props().markdown).to.contain('- One');

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

    expect(wrapper.containsMatchingElement(<h2>Standards</h2>)).to.be.false;
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
    assert.equal(resourceSection.find('ResourceList').length, 2);
  });

  it('displays the introduced code', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    const codeSection = wrapper.find('#unit-test-introduced-code');
    assert.equal(codeSection.find('StyledCodeBlock').length, 1);
  });

  it('does not display the introduced code if no code', () => {
    const newDefaultProps = _.cloneDeep(defaultProps);
    newDefaultProps.lesson.programmingExpressions = [];

    const wrapper = shallow(<LessonOverview {...newDefaultProps} />);
    assert.equal(wrapper.find('#unit-test-introduced-code').length, 0);
  });

  it('renders standards header when standards are present', () => {
    const standards = [
      {
        frameworkName: 'ngss',
        parentCategoryShortcode: 'ESS',
        parentCategoryDescription: 'Earth and Space Science',
        categoryShortcode: 'ESS1',
        categoryDescription: "Earth's Place in the Universe",
        shortcode: '1-ESS1-1',
        description:
          'Use observations of the sun, moon, and stars to describe patterns that can be predicted.'
      }
    ];
    const lesson = {
      ...defaultProps.lesson,
      standards: standards
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );

    expect(wrapper.containsMatchingElement(<h2>Standards</h2>)).to.be.true;
    expect(
      wrapper.containsMatchingElement(<h2>Cross-Curricular Opportunities</h2>)
    ).to.be.false;
  });

  it('renders opportunities header when opportunity standards are present', () => {
    const standards = [
      {
        frameworkName: 'ngss',
        parentCategoryShortcode: 'ESS',
        parentCategoryDescription: 'Earth and Space Science',
        categoryShortcode: 'ESS1',
        categoryDescription: "Earth's Place in the Universe",
        shortcode: '1-ESS1-1',
        description:
          'Use observations of the sun, moon, and stars to describe patterns that can be predicted.'
      }
    ];
    const lesson = {
      ...defaultProps.lesson,
      opportunityStandards: standards
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );

    expect(wrapper.containsMatchingElement(<h2>Standards</h2>)).to.be.false;
    expect(
      wrapper.containsMatchingElement(<h2>Cross-Curricular Opportunities</h2>)
    ).to.be.true;
  });
});
