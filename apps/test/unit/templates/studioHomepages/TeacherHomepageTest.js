import React from 'react';
import sinon from 'sinon';
import {assert, expect} from '../../../util/configuredChai';
import {shallow} from 'enzyme';
import {sections} from './fakeSectionUtils';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';

const announcements = [
  {
    heading: "Go beyond an Hour of Code",
    buttonText: "Go Beyond",
    description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
    link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
  },
  {
    heading: "Check out your new teacher homepage",
    buttonText: "Learn More",
    description: "A redesign is underway so you have better access to your top tools and resources. Your sections, courses and links are all readily accessible. Also, there's more teal than ever!",
    link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
  }
];

const courses = [
  {
    title: "Course 1",
    description: "Start with Course 1 for early readers. Students will create computer programs that will help them learn to collaborate with others, develop problem-solving skills, and persist through difficult tasks. By the end of this course, students create their very own custom game or story that they can share. Recommended for grades K-1.",
    link: "https://studio.code.org/s/course1",
  },
  {
    title: "Course 2",
    description: "Start with Course 2 for students who can read and have no prior programming experience. In this course students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5.",
    link: "https://studio.code.org/s/course2",
  },
];

describe('TeacherHomepage', () => {
  let server;

  const successResponse = () => [
    200,
    {"Content-Type": "application/json"},
    JSON.stringify({})
  ];
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/dashboardapi/courses', successResponse());
    server.respondWith('POST', '/dashboardapi/sections', successResponse());
  });
  afterEach(() => server.restore());

  it('shows a non-extended Header Banner that says Home', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const headerBanner = wrapper.childAt(0);
    assert.equal(headerBanner.name(),'HeaderBanner');
    assert.equal(headerBanner.props().headingText, 'Home');
    assert.equal(headerBanner.props().extended, false);
  });

  it('references ProtectedStatefulDiv for the terms reminder', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const termsReminderRef = wrapper.childAt(1);
    assert.equal(termsReminderRef.name(),'ProtectedStatefulDiv');
  });

  it('shows one announcement', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[announcements[0]]}
        courses={[]}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const announcementsContainer = wrapper.childAt(3).childAt(0);
    assert.equal(announcementsContainer.name(), 'Notification');
    // Check if Announcements receives correct props.
    const announcement = announcementsContainer.props();
    assert.equal(announcement.notice, announcements[0].heading);
    assert.equal(announcement.buttonText, announcements[0].buttonText);
    assert.equal(announcement.details, announcements[0].description);
    assert.equal(announcement.buttonLink, announcements[0].link);
  });

  it('renders a TeacherSections component', () => {
    const codeOrgUrlPrefix = "http://localhost:3000/";
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={sections}
        codeOrgUrlPrefix={codeOrgUrlPrefix}
        isRtl={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <TeacherSections
        sections={sections}
        codeOrgUrlPrefix={codeOrgUrlPrefix}
        isRtl={false}
      />
    );
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={courses}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      heading: "Recent Courses",
      isTeacher: true,
      courses: courses,
      isRtl: false
    });
  });
});
