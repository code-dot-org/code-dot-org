import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import {UnconnectedLessonOverview as LessonOverview} from '@cdo/apps/templates/lessonOverview/LessonOverview';
import * as currentLocaleModule from '@cdo/apps/util/currentLocale';

import {assert, expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement,
} from '../../code-studio/components/progress/FakeAnnouncementsTestData';
import {sampleActivities} from '../../levelbuilder/lesson-editor/activitiesTestData';

describe('LessonOverview', () => {
  let currentLocaleStub;
  let defaultProps;
  beforeEach(() => {
    currentLocaleStub = sinon.stub(currentLocaleModule, 'default');
    defaultProps = {
      lesson: {
        unit: {
          displayName: 'Unit 1',
          link: '/s/unit-1',
          publishedState: 'beta',
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
        duration: 45,
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
              type: 'Slides',
            },
          ],
          Student: [
            {
              key: 'student-resource',
              name: 'Student Resource',
              url: 'fake.url',
              download_url: 'download.fake.url',
              type: 'Activity Guide',
            },
          ],
        },
        objectives: [{id: 1, description: 'what students will learn'}],
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
        standards: [],
        opportunityStandards: [],
        courseVersionStandardsUrl: 'standards/url',
      },
      activities: [],
      announcements: [],
      viewAs: ViewType.Instructor,
      isSignedIn: true,
      hasVerifiedResources: false,
      isVerifiedInstructor: false,
    };
  });

  afterEach(() => {
    currentLocaleStub.restore();
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonOverview {...defaultProps} />);
    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).to.contain('/s/unit-1');
    expect(navLink.contains('< Unit 1')).to.be.true;

    expect(wrapper.find('LessonNavigationDropdown').length).to.equal(1);

    expect(wrapper.contains('Lesson 1: Lesson 1'), 'Lesson Name').to.be.true;
    expect(wrapper.contains('45 minutes'), 'Lesson Duration').to.be.true;

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

  it('has provided instructor announcements if necessary', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement,
        ]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 2);
  });

  it('shows verified resources warning if instructor is not verified and lesson has verified resources', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        isVerifiedInstructor={false}
        hasVerifiedResources={true}
      />
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('does not show verified resources warning if instructor is verified', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        isVerifiedInstructor={true}
        hasVerifiedResources={true}
      />
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
  });

  it('does not show verified resources warning if lesson does not have verified resources', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        isVerifiedInstructor={false}
        hasVerifiedResources={false}
      />
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
  });

  it('has participant announcement if viewing as participant', () => {
    const wrapper = shallow(
      <LessonOverview
        {...defaultProps}
        viewAs={ViewType.Participant}
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

  it('renders standards header with standards alignment button when standards are present', () => {
    const standards = [
      {
        frameworkName: 'ngss',
        parentCategoryShortcode: 'ESS',
        parentCategoryDescription: 'Earth and Space Science',
        categoryShortcode: 'ESS1',
        categoryDescription: "Earth's Place in the Universe",
        shortcode: '1-ESS1-1',
        description:
          'Use observations of the sun, moon, and stars to describe patterns that can be predicted.',
      },
    ];
    const lesson = {
      ...defaultProps.lesson,
      standards: standards,
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );

    expect(wrapper.containsMatchingElement(<h2>Standards</h2>)).to.be.true;
    expect(
      wrapper.containsMatchingElement(
        <Button
          href={lesson.courseVersionStandardsUrl}
          text="Full Course Alignment"
        />
      )
    ).to.be.true;
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
          'Use observations of the sun, moon, and stars to describe patterns that can be predicted.',
      },
    ];
    const lesson = {
      ...defaultProps.lesson,
      opportunityStandards: standards,
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );

    expect(wrapper.containsMatchingElement(<h2>Standards</h2>)).to.be.false;
    expect(
      wrapper.containsMatchingElement(<h2>Cross-Curricular Opportunities</h2>)
    ).to.be.true;
  });

  it('renders dropdown button with links to printing options if not pilot or in development', () => {
    currentLocaleStub.returns('en-US');
    const lesson = {
      ...defaultProps.lesson,
      lessonPlanPdfUrl: '/link/to/lesson_plan.pdf',
      scriptResourcesPdfUrl: '/link/to/script_resources.pdf',
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper.find(DropdownButton).first().props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql([
      '/link/to/lesson_plan.pdf',
      '/link/to/script_resources.pdf',
    ]);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Lesson Plan',
      'Print Handouts',
    ]);
  });

  it('renders dropdown button with lessonPlanPdf if no scriptResourcesPdfUrl provided and not pilot or in development', () => {
    currentLocaleStub.returns('en-US');
    const lesson = {
      ...defaultProps.lesson,
      lessonPlanPdfUrl: '/link/to/lesson_plan.pdf',
      scriptResourcesPdfUrl: null,
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper.find(DropdownButton).first().props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql([
      '/link/to/lesson_plan.pdf',
    ]);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Lesson Plan',
    ]);
  });

  it('does not render dropdown with links if locale is not en-US', () => {
    currentLocaleStub.returns('te-ST');
    const lesson = {
      ...defaultProps.lesson,
      lessonPlanPdfUrl: '/link/to/lesson_plan.pdf',
      scriptResourcesPdfUrl: '/link/to/script_resources.pdf',
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper.find(DropdownButton).first().props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql(['#']);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Lesson Plan',
    ]);
  });

  it('does not render overview printing option in dropdown for pilot course', () => {
    currentLocaleStub.returns('en-US');
    const unit = {
      ...defaultProps.lesson.unit,
      publishedState: PublishedState.pilot,
    };
    const lesson = {
      ...defaultProps.lesson,
      unit: unit,
      lessonPlanPdfUrl: '/link/to/lesson_plan.pdf',
      scriptResourcesPdfUrl: '/link/to/script_resources.pdf',
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper.find(DropdownButton).first().props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql([
      '/link/to/script_resources.pdf',
    ]);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Handouts',
    ]);
  });

  it('does not render overview printing option in dropdown for in development course', () => {
    currentLocaleStub.returns('en-US');
    const unit = {
      ...defaultProps.lesson.unit,
      publishedState: PublishedState.in_development,
    };
    const lesson = {
      ...defaultProps.lesson,
      unit: unit,
      lessonPlanPdfUrl: '/link/to/lesson_plan.pdf',
      scriptResourcesPdfUrl: '/link/to/script_resources.pdf',
    };
    const wrapper = shallow(
      <LessonOverview {...defaultProps} lesson={lesson} />
    );
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    const dropdownLinks = wrapper.find(DropdownButton).first().props().children;
    expect(dropdownLinks.map(link => link.props.href)).to.eql([
      '/link/to/script_resources.pdf',
    ]);
    expect(dropdownLinks.map(link => link.props.children)).to.eql([
      'Print Handouts',
    ]);
  });

  it('logs Amplitude event when rendered', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    shallow(<LessonOverview {...defaultProps} />);

    expect(analyticsSpy).to.have.been.calledOnce;
    assert.equal(
      analyticsSpy.getCall(0).firstArg,
      EVENTS.LESSON_OVERVIEW_PAGE_VISITED_EVENT
    );
    analyticsSpy.restore();
  });
});
