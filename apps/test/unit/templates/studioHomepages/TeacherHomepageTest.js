import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert} from 'chai';
import {UnconnectedTeacherHomepage as TeacherHomepage} from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';
import {courses, topCourse, plCourses, topPlCourse} from './homepagesTestData';

const DEFAULT_PROPS = {
  announcements: [],
  censusQuestion: 'how_many_10_hours',
  courses,
  topCourse,
  plCourses,
  topPlCourse,
  isEnglish: true,
  joinedSections: [],
  ncesSchoolId: 'school-id',
  schoolYear: 2021,
  showCensusBanner: false,
  teacherId: 1,
  teacherEmail: 'teacher@code.org',
  teacherName: 'Teacher'
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TeacherHomepage {...props} />);
};

describe('TeacherHomepage', () => {
  let server;
  const successResponse = () => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify({})
  ];
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/dashboardapi/courses', successResponse());
    server.respondWith('POST', '/dashboardapi/sections', successResponse());
  });
  afterEach(() => server.restore());

  it('shows a non-extended Header Banner that says My Dashboard', () => {
    const wrapper = setUp();
    const headerBanner = wrapper.find('Connect(HeaderBanner)');
    assert.deepEqual(headerBanner.props(), {
      headingText: 'My Dashboard',
      short: true,
      backgroundUrl: '/shared/images/banners/teacher-homepage-hero.jpg'
    });
  });

  it('renders 2 ProtectedStatefulDivs', () => {
    const wrapper = setUp();
    assert.lengthOf(wrapper.find('ProtectedStatefulDiv'), 2);
  });

  it('renders a NpsSurveyBlock if showNpsSurvey is true', () => {
    const wrapper = setUp({showNpsSurvey: true});
    assert(wrapper.find('NpsSurveyBlock').exists());
  });

  it('renders a Finish Application call to action if showFinishTeacherApplication is true', () => {
    const wrapper = setUp({showFinishTeacherApplication: true});
    assert.equal(
      wrapper.find('BorderedCallToAction').props().buttonText,
      'Finish Application'
    );
  });

  it('renders a MarketingAnnouncementBanner if isEnglish and specialAnnouncement exists', () => {
    const specialAnnouncement = {
      title: 'An announcement',
      image: '/image',
      body: 'body',
      buttonUrl: '/button',
      buttonText: 'press me'
    };
    const wrapper = setUp({
      isEnglish: true,
      specialAnnouncement
    });
    assert(wrapper.find('MarketingAnnouncementBanner').exists());
  });

  // Notifications are configured not to be rendered right now with showAnnouncement = false
  it('does not render a Notification', () => {
    const announcement = {
      heading: 'heading',
      buttonText: 'press me',
      description: 'description',
      link: '/link',
      image: '/image',
      id: 'id'
    };
    const wrapper = setUp({
      announcement
    });
    assert(!wrapper.find('Notification').exists());
  });

  it('renders a CensusTeacherBanner if showCensusBanner is true', () => {
    const wrapper = setUp({showCensusBanner: true});
    assert(wrapper.find('CensusTeacherBanner').exists());
  });

  it('renders a DonorTeacherBanner if isEnglish and donorBannerName exists', () => {
    const wrapper = setUp({isEnglish: true, donorBannerName: 'Donor Name'});
    assert(wrapper.find('DonorTeacherBanner').exists());
  });

  it('renders a TeacherSections component', () => {
    const wrapper = setUp();
    assert(wrapper.containsMatchingElement(<TeacherSections />));
  });

  it('renders two RecentCourses component', () => {
    const wrapper = setUp();
    const recentCourses = wrapper.find('RecentCourses');
    assert.equal(recentCourses.length, 2);
    assert.deepEqual(recentCourses.at(0).props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: plCourses,
      topCourse: topPlCourse
    });
  });

  it('does not render PL recentCourse if no topPlCourse or plCourses', () => {
    const wrapper = setUp({plCourses: [], topPlCourse: null});
    const recentCourses = wrapper.find('RecentCourses');
    assert.equal(recentCourses.length, 1);
    assert.deepEqual(recentCourses.at(0).props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
  });

  it('renders PL recentCourse if topPlCourse but no plCourses', () => {
    const wrapper = setUp({plCourses: [], topPlCourse: topPlCourse});
    const recentCourses = wrapper.find('RecentCourses');
    assert.equal(recentCourses.length, 2);
    assert.deepEqual(recentCourses.at(0).props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: [],
      topCourse: topPlCourse
    });
  });

  it('renders PL recentCourse if plCourses but no topPlCourse', () => {
    const wrapper = setUp({plCourses: plCourses, topPlCourse: null});
    const recentCourses = wrapper.find('RecentCourses');
    assert.equal(recentCourses.length, 2);
    assert.deepEqual(recentCourses.at(0).props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: plCourses,
      topCourse: null
    });
  });

  it('renders a TeacherResources component', () => {
    const wrapper = setUp();
    assert(wrapper.find('TeacherResources').exists());
  });

  it('renders a StudentSections component', () => {
    const wrapper = setUp();
    assert(wrapper.find('StudentSections').exists());
  });

  it('renders ProjectWidgetWithData component', () => {
    const wrapper = setUp();
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });
});
