import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from 'chai';
import {UnconnectedTeacherHomepage as TeacherHomepage} from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';
import AmazonTeacherOfYearBanner from '@cdo/apps/templates/AmazonTeacherOfYearBanner';
import DonorTeacherBanner from '@cdo/apps/templates/DonorTeacherBanner';
import {courses, topCourse} from './homepagesTestData';
import * as utils from '@cdo/apps/utils';

describe('TeacherHomepage', () => {
  const TEST_PROPS = {
    announcements: [],
    courses,
    topCourse,
    codeOrgUrlPrefix: 'http://localhost:3000',
    joinedSections: [],
    isEnglish: true,
    showCensusBanner: false
  };

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
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    const headerBanner = wrapper.find('Connect(HeaderBanner)');
    assert.deepEqual(headerBanner.props(), {
      headingText: 'My Dashboard',
      short: true,
      backgroundUrl: '/shared/images/banners/teacher-homepage-hero.jpg'
    });
  });

  it('references 2 ProtectedStatefulDivs', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert.lengthOf(wrapper.find('ProtectedStatefulDiv'), 2);
  });

  it('renders a TeacherSections component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.containsMatchingElement(<TeacherSections />));
  });

  it('renders a StudentSections component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.find('StudentSections').exists());
  });

  it('renders a RecentCourses component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });

  describe('when teacher school is in NCES list (has donor)', () => {
    const bannerLocalStorageKey = 'hideAmazonTeacherOfYearBanner';

    afterEach(() => {
      if (utils.tryGetLocalStorage.restore) {
        utils.tryGetLocalStorage.restore();
      }
    });

    it('displays AmazonTeacherOfYearBanner when local storage does not have hideAmazonTeacherOfYearBanner set and donorName is Amazon', () => {
      const props = {...TEST_PROPS, donorName: 'Amazon'};
      const wrapper = shallow(<TeacherHomepage {...props} />);
      assert(wrapper.find(AmazonTeacherOfYearBanner).exists());
    });

    it('hides AmazonTeacherOfYearBanner when local storage does not have hideAmazonTeacherOfYearBanner set and donorName is not Amazon', () => {
      const props = {...TEST_PROPS, donorName: 'some other donor'};
      const wrapper = shallow(<TeacherHomepage {...props} />);
      expect(wrapper.find(AmazonTeacherOfYearBanner).exists()).to.be.false;
    });

    it('hides DonorTeacherBanner when AmazonTeacherOfYearBanner is present', () => {
      const props = {...TEST_PROPS, donorName: 'Amazon'};
      const wrapper = shallow(<TeacherHomepage {...props} />);
      expect(wrapper.find(DonorTeacherBanner).exists()).to.be.false;
    });

    it('hides AmazonTeacherOfYearBanner when local storage hideAmazonTeacherOfYearBanner is true', () => {
      const props = {...TEST_PROPS, donorName: 'Amazon'};
      sinon
        .stub(utils, 'tryGetLocalStorage')
        .withArgs(bannerLocalStorageKey, 'false')
        .returns('true'); // mock getting local storage value for hideAmazonTeacherOfYearBanner
      const wrapper = shallow(<TeacherHomepage {...props} />);
      expect(wrapper.find(AmazonTeacherOfYearBanner).exists()).to.be.false;
    });

    it('displays DonorTeacherBanner when donorBannerName is present and AmazonTeacherOfYearBanner is hidden', () => {
      const props = {
        ...TEST_PROPS,
        donorName: 'Amazon',
        donorBannerName: 'Amazon'
      };
      sinon
        .stub(utils, 'tryGetLocalStorage')
        .withArgs(bannerLocalStorageKey, 'false')
        .returns('true'); // mock getting local storage value for hideAmazonTeacherOfYearBanner
      const wrapper = shallow(<TeacherHomepage {...props} />);
      assert(wrapper.find(DonorTeacherBanner).exists());
    });

    it('hides both banners when hideAmazonTeacherOfYearBanner is true and donorBannerName is not present', () => {
      const props = {...TEST_PROPS, donorName: 'Amazon', donorBannerName: null};
      sinon
        .stub(utils, 'tryGetLocalStorage')
        .withArgs(bannerLocalStorageKey, 'false')
        .returns('true'); // mock getting local storage value for hideAmazonTeacherOfYearBanner
      const wrapper = shallow(<TeacherHomepage {...props} />);
      expect(wrapper.find(AmazonTeacherOfYearBanner).exists()).to.be.false;
      expect(wrapper.find(DonorTeacherBanner).exists()).to.be.false;
    });
  });
});
