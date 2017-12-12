import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/configuredChai';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';
import Notification from '@cdo/apps/templates/Notification';
import { announcement, courses, topCourse } from './homepagesTestData';

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

  it('shows a non-extended Header Banner that says My Dashboard', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        topCourse={topCourse}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    const headerBanner = wrapper.find('Connect(HeaderBanner)');
    assert.deepEqual(headerBanner.props(), {
      headingText: "My Dashboard",
      short: true
    });
  });

  it('references 2 ProtectedStatefulDivs', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        topCourse={topCourse}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    expect(wrapper.find('ProtectedStatefulDiv')).to.have.length(2);
  });

  it('shows an announcement', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[announcement]}
        courses={[]}
        topCourse={topCourse}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    const announcementContainer = wrapper.find(Notification);
    assert.deepEqual(announcementContainer.props(), {
      type: "bullhorn",
      notice: announcement.heading,
      details: announcement.description,
      dismissible: false,
      buttonText: announcement.buttonText,
      buttonLink: announcement.link,
      newWindow: true,
      analyticId: announcement.id,
    });
  });

  it('renders a TeacherSections component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        topCourse={topCourse}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <TeacherSections
        isRtl={false}
      />
    );
  });

  it('renders a StudentSections component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={[]}
        topCourse={topCourse}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    expect(wrapper.find('StudentSections').exists()).to.be.true;
  });

  it('renders a RecentCourses component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        topCourse={topCourse}
        courses={courses}
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      courses: courses,
      topCourse: topCourse,
      isRtl: false
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(
      <TeacherHomepage
        announcements={[]}
        courses={courses}
        topCourse={topCourse}
        codeOrgUrlPrefix="http://localhost:3000/"
        isRtl={false}
        joinedSections={[]}
        isEnglish={true}
      />
    );
    expect(wrapper.find('ProjectWidgetWithData').exists()).to.be.true;
  });
});
