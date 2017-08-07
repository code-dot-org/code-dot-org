import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/configuredChai';
import {sections} from './fakeSectionUtils';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';

const announcement = {
  heading: "Go beyond an Hour of Code",
  buttonText: "Go Beyond",
  description: "Go Beyond an Hour of Code and explore computer science concepts with your students every week. Code.org offers curriculum, lesson plans, high quality professional learning programs, and tons of great tools for all grade levels - and it's free. No experience required - find the next step that's right for your classroom.",
  link: "http://teacherblog.code.org/post/160703303174/coming-soon-access-your-top-resources-with-the"
};

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
        isRtl={false}
      />
    );
    const headerBanner = wrapper.find('HeaderBanner');
    assert.deepEqual(headerBanner.props(), {
      headingText: "Home",
      short: true
    });
  });

  it('references 2 ProtectedStatefulDivs', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={[]}
        isRtl={false}
      />
    );
    expect(wrapper.find('ProtectedStatefulDiv')).to.have.length(2);
  });

  it('shows an announcement', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[announcement]}
        courses={[]}
        sections={[]}
        isRtl={false}
      />
    );
    const announcementContainer = wrapper.find('Notification');
    assert.deepEqual(announcementContainer.props(), {
      type: "bullhorn",
      notice: announcement.heading,
      details: announcement.description,
      dismissible: false,
      buttonText: announcement.buttonText,
      buttonLink: announcement.link,
      newWindow: true,
      analyticId: announcement.id
    });
  });

  it('renders a TeacherSections component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        sections={sections}
        isRtl={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <TeacherSections
        sections={sections}
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
        isRtl={false}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      courses: courses,
      isRtl: false
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={courses}
        sections={[]}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
      />
    );
    expect(wrapper.find('ProjectWidgetWithData').exists());
  });
});
