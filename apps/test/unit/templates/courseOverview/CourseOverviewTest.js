import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedCourseOverview as CourseOverview} from '@cdo/apps/templates/courseOverview/CourseOverview';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import * as utils from '@cdo/apps/utils';
import sinon from 'sinon';
import {VisibilityType} from '../../../../src/code-studio/announcementsRedux';
import {NotificationType} from '@cdo/apps/templates/Notification';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const defaultProps = {
  name: 'csp',
  title: 'Computer Science Principles 2017',
  assignmentFamilyTitle: 'Computer Science Principles',
  id: 30,
  descriptionStudent:
    '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  descriptionTeacher:
    '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* ',
  sectionsInfo: [],
  viewAs: ViewType.Instructor,
  scripts: [
    {
      course_id: 30,
      id: 112,
      title: 'CSP Unit 1',
      name: 'csp1',
      description: 'desc',
    },
    {
      course_id: 30,
      id: 113,
      title: 'CSP Unit 2',
      name: 'csp2',
      description: 'desc',
    },
  ],
  isVerifiedInstructor: true,
  hasVerifiedResources: false,
  versions: {},
  sectionsForDropdown: [],
  announcements: [],
  isSignedIn: true,
};

const fakeTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher,
};
const fakeStudentAnnouncement = {
  notice: 'Notice - Student',
  details: 'Students are the best',
  link: '/foo/bar/student',
  type: NotificationType.information,
  visibility: VisibilityType.student,
};
const fakeTeacherAndStudentAnnouncement = {
  notice: 'Notice - Teacher And Student',
  details: 'More detail here',
  link: '/foo/bar/teacherAndStudent',
  type: NotificationType.information,
  visibility: VisibilityType.teacherAndStudent,
};

describe('CourseOverview', () => {
  it('has correct course description for instructor', () => {
    const wrapper = shallow(<CourseOverview {...defaultProps} />);
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Teacher description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  it('has correct course description for participant', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        isInstructor={false}
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Student description \n This is the course description with [link](https://studio.code.org/home) **Bold** *italics* '
    );
  });

  it('has non-verified and provided instructor announcements if necessary', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement,
        ]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 2);
  });

  it('has participant announcement if viewing as participant', () => {
    const wrapper = shallow(
      <CourseOverview
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 1);
  });

  it('renders a top row for instructors', () => {
    const wrapper = shallow(
      <CourseOverview {...defaultProps} isInstructor={true} />
    );
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });

  it('renders a CourseScript for each script', () => {
    const wrapper = shallow(<CourseOverview {...defaultProps} />);
    assert.equal(wrapper.find('Connect(CourseScript)').length, 2);
  });

  describe('VerifiedResourcesNotification', () => {
    const propsToShow = {
      ...defaultProps,
      isVerifiedInstructor: false,
      hasVerifiedResources: true,
    };

    it('is shown to unverified instructors if course has verified resources', () => {
      const wrapper = shallow(<CourseOverview {...propsToShow} />);
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
    });

    it('is not shown if instructor is verified', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} isVerifiedInstructor={true} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });

    it('is not shown if course does not have verified resources', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} hasVerifiedResources={false} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });

    it('is not shown while viewing as participant', () => {
      const wrapper = shallow(
        <CourseOverview {...propsToShow} viewAs={ViewType.Participant} />
      );
      assert.equal(wrapper.find('VerifiedResourcesNotification').length, 0);
    });
  });

  describe('versions dropdown', () => {
    beforeEach(() => {
      sinon.stub(utils, 'navigateToHref');
    });

    afterEach(() => {
      utils.navigateToHref.restore();
    });

    it('appears when two versions are present and viewable', () => {
      const wrapper = shallow(
        <CourseOverview
          {...defaultProps}
          versions={courseOfferings['2'].course_versions}
          isInstructor={true}
        />
      );

      const versionSelector = wrapper.find('AssignmentVersionSelector');
      expect(versionSelector.length).to.equal(1);
      const renderedVersions = versionSelector.props().courseVersions;
      assert.equal(2, Object.values(renderedVersions).length);
    });

    it('does not appear when only one version is viewable', () => {
      const wrapper = shallow(
        <CourseOverview
          {...defaultProps}
          versions={courseOfferings['3'].course_versions}
          isInstructor={true}
        />
      );
      expect(wrapper.find('AssignmentVersionSelector').length).to.equal(0);
    });

    it('does not appear when no versions are present', () => {
      const wrapper = shallow(
        <CourseOverview {...defaultProps} isInstructor={true} />
      );
      expect(wrapper.find('AssignmentVersionSelector').length).to.equal(0);
    });
  });
});
