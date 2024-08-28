import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import Notification from '@cdo/apps/sharedComponents/Notification';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import {courses, topCourse, joinedSections} from './homepagesTestData';

describe('StudentHomepage', () => {
  const TEST_PROPS = {
    courses,
    topCourse,
    sections: joinedSections,
    codeOrgUrlPrefix: 'http://localhost:3000',
    studentId: 123,
    isEnglish: true,
    showVerifiedTeacherWarning: false,
    specialAnnouncement: {
      id: 'id',
      image: '/image',
      title: 'title',
      body: 'body',
      link: '/link',
      description: 'description',
      buttonUrl: '/url',
      buttonText: 'press me',
      heading: 'heading',
    },
  };

  it('shows a Header Banner that says My Dashboard', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const headerBanner = wrapper.find(HeaderBanner);
    expect(headerBanner.props().headingText).to.equal('My Dashboard');
  });

  it('references a ProtectedStatefulDiv for flashes', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProtectedStatefulDiv').exists());
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      courses: courses,
      topCourse: topCourse,
      isTeacher: false,
      hasFeedback: false,
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });

  it('shows a JoinSectionArea component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const joinSectionArea = wrapper.find('JoinSectionArea');
    assert.deepEqual(joinSectionArea.props(), {
      initialJoinedStudentSections: joinedSections,
    });
  });

  it('does not log an Amplitude event for student signing-in', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    shallow(<StudentHomepage {...TEST_PROPS} />);

    expect(analyticsSpy).not.to.have.been.called;
    analyticsSpy.restore();
  });

  it('shows the special announcement for all languages', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    assert(wrapper.find('MarketingAnnouncementBanner').exists());
  });

  it('displays a notification for verified teacher permissions if showVerifiedTeacherWarning is true', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} showVerifiedTeacherWarning={true} />
    );
    const notification = wrapper.find(Notification);
    assert(notification.exists());
    assert.equal(
      notification.props().notice,
      i18n.studentAsVerifiedTeacherWarning()
    );
  });
});
