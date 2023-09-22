import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert} from 'chai';
import {UnconnectedTeacherHomepage as TeacherHomepage} from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';
import {courses, topCourse, plCourses, topPlCourse} from './homepagesTestData';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {expect} from '../../../util/reconfiguredChai';

const DEFAULT_PROPS = {
  announcements: [],
  censusQuestion: 'how_many_10_hours',
  courses,
  topCourse,
  plCourses,
  topPlCourse,
  isEnglish: true,
  joinedStudentSections: [],
  joinedPlSections: [],
  ncesSchoolId: 'school-id',
  schoolYear: 2021,
  showCensusBanner: false,
  teacherId: 1,
  teacherEmail: 'teacher@code.org',
  teacherName: 'Teacher',
  hasFeedback: false,
  currentUserId: 42,
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
    JSON.stringify({}),
  ];
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/dashboardapi/sections', successResponse());
    sinon.stub(sessionStorage, 'getItem');
    sinon.stub(sessionStorage, 'setItem');
  });
  afterEach(() => {
    server.restore();
    sessionStorage.setItem.restore();
    sessionStorage.getItem.restore();
  });

  it('shows a Header Banner that says My Dashboard', () => {
    const wrapper = setUp();
    const headerBanner = wrapper.find('HeaderBanner');
    expect(headerBanner.props().headingText).to.equal('My Dashboard');
  });

  it('renders 2 ProtectedStatefulDivs', () => {
    const wrapper = setUp();
    assert.lengthOf(wrapper.find('ProtectedStatefulDiv'), 2);
  });

  it('logs an Amplitude event only on first render', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    sessionStorage.getItem.withArgs('logged_teacher_session').returns(false);
    setUp();

    expect(sessionStorage.setItem).to.have.been.calledOnce;
    expect(sessionStorage.setItem).to.have.been.calledWith(
      'logged_teacher_session',
      'true'
    );
    expect(analyticsSpy).to.have.been.calledOnce;
    expect(analyticsSpy.firstCall.args).to.deep.eq([
      'Teacher Login',
      {'user id': 42},
    ]);

    // After setting the session value to true, we should not see sessionStorage.setItem or analyticsSpy called again.
    sessionStorage.getItem.withArgs('logged_teacher_session').returns('true');
    setUp();
    expect(sessionStorage.setItem).to.have.been.calledOnce;
    expect(analyticsSpy).to.have.been.calledOnce;

    analyticsSpy.restore();
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

  it('renders a Return to Application call to action if showReturnToReopenedTeacherApplication is true', () => {
    const wrapper = setUp({showReturnToReopenedTeacherApplication: true});
    assert.equal(
      wrapper.find('BorderedCallToAction').props().buttonText,
      'Return to Application'
    );
  });

  it('renders a MarketingAnnouncementBanner if isEnglish and specialAnnouncement exists', () => {
    const specialAnnouncement = {
      title: 'An announcement',
      image: '/image',
      body: 'body',
      buttonUrl: '/button',
      buttonText: 'press me',
    };
    const wrapper = setUp({
      isEnglish: true,
      specialAnnouncement,
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
      id: 'id',
    };
    const wrapper = setUp({
      announcement,
    });
    assert(!wrapper.find('Notification').exists());
  });

  it('renders CensusTeacherBanner if showCensusBanner is true', () => {
    const wrapper = setUp({showCensusBanner: true});
    assert(wrapper.find('CensusTeacherBanner').exists());
  });

  /*
    We have disabled the AFE Banner on the Teacher Homepage (September 2023) to conserve
    space. If we decide to show the banner again this test will need to be updated. See
    TeacherHomepage.jsx to make the banner show.
   */
  it('does not render a DonorTeacherBanner even if isEnglish and afeEligible are true', () => {
    const wrapper = setUp({isEnglish: true, afeEligible: true});
    assert(!wrapper.find('DonorTeacherBanner').exists());
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
      topCourse: topCourse,
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: plCourses,
      topCourse: topPlCourse,
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
      topCourse: topCourse,
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
      topCourse: topCourse,
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: [],
      topCourse: topPlCourse,
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
      topCourse: topCourse,
    });
    assert.deepEqual(recentCourses.at(1).props(), {
      showAllCoursesLink: true,
      isTeacher: false,
      hasFeedback: false,
      isProfessionalLearningCourse: true,
      courses: plCourses,
      topCourse: null,
    });
  });

  it('renders a TeacherResources component', () => {
    const wrapper = setUp();
    assert(wrapper.find('TeacherResources').exists());
  });

  it('renders a JoinSectionArea component', () => {
    const wrapper = setUp();
    assert(wrapper.find('JoinSectionArea').exists());
  });

  it('renders ProjectWidgetWithData component', () => {
    const wrapper = setUp();
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });

  it('renders a ParticipantFeedbackNotification component if has feedback and pl courses', () => {
    const wrapper = setUp({
      plCourses: plCourses,
      topPlCourse: topPlCourse,
      hasFeedback: true,
    });
    assert.equal(wrapper.find('ParticipantFeedbackNotification').length, 1);
  });

  it('does not render a ParticipantFeedbackNotification component if there is no feedback', () => {
    const wrapper = setUp({
      plCourses: plCourses,
      topPlCourse: topPlCourse,
      hasFeedback: false,
    });
    assert.equal(wrapper.find('ParticipantFeedbackNotification').length, 0);
  });

  it('does not render a ParticipantFeedbackNotification component if there are no PL courses', () => {
    const wrapper = setUp({
      plCourses: [],
      topPlCourse: null,
      hasFeedback: true,
    });
    assert.equal(wrapper.find('ParticipantFeedbackNotification').length, 0);
  });
});
