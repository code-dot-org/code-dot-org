import React from 'react';
import {assert} from 'chai';
import {shallow} from 'enzyme';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import {courses, topCourse, joinedSections} from './homepagesTestData';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {expect} from '../../../util/reconfiguredChai';

describe('StudentHomepage', () => {
  const TEST_PROPS = {
    courses,
    topCourse,
    sections: joinedSections,
    codeOrgUrlPrefix: 'http://localhost:3000',
    studentId: 123,
    isEnglish: true,
    showVerifiedTeacherWarning: false,
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

  it('shows the special announcement for English', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} isEnglish={true} />
    );
    assert(wrapper.find('SpecialAnnouncement').exists());
  });

  it('does not show the special announcement for non-English', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} isEnglish={false} />
    );
    assert.isFalse(wrapper.find('SpecialAnnouncement').exists());
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
