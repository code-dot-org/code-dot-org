import React from 'react';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {NotificationType} from '@cdo/apps/templates/Notification';
import {VisibilityType} from '../../../../../src/code-studio/scriptAnnouncementsRedux';
import {UnconnectedScriptOverviewHeader as ScriptOverviewHeader} from '@cdo/apps/code-studio/components/progress/ScriptOverviewHeader';

const defaultProps = {
  plcHeaderProps: undefined,
  announcements: [],
  isSignedIn: true,
  viewAs: ViewType.Teacher,
  isVerifiedTeacher: true,
  hasVerifiedResources: false,
  scriptId: 99,
  scriptName: 'course1',
  scriptTitle: 'Course One',
  scriptDescription:
    '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
  versions: []
};

const fakeTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher
};
const fakeOldTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information
};
const fakeStudentAnnouncement = {
  notice: 'Notice - Student',
  details: 'Students are the best',
  link: '/foo/bar/student',
  type: NotificationType.information,
  visibility: VisibilityType.student
};
const fakeTeacherAndStudentAnnouncement = {
  notice: 'Notice - Teacher And Student',
  details: 'More detail here',
  link: '/foo/bar/teacherAndStudent',
  type: NotificationType.information,
  visibility: VisibilityType.teacherAndStudent
};

describe('ScriptOverviewHeader', () => {
  it('renders', () => {
    shallow(<ScriptOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
  });

  it('includes a PlcHeader if it has plcHeaderProps', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        plcHeaderProps={{
          unitName: 'foo',
          courseViewPath: '/s/my-course'
        }}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('PlcHeader').length, 1);
  });

  it('does not have a PlcHeader if we have no plcHeaderProps', () => {
    const wrapper = shallow(<ScriptOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    assert.equal(wrapper.find('PlcHeader').length, 0);
  });

  it('has no notifications by default', () => {
    const wrapper = shallow(<ScriptOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      0
    );
  });

  it('includes a single notification default for non-verified teachers', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        verificationCheckComplete={true}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('displays old teacher announcement for teacher', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      1
    );
  });

  it('does not display old teacher announcement for student', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        viewAs={ViewType.Student}
        announcements={[fakeOldTeacherAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      0
    );
  });

  it('has non-verified and provided teacher announcement if necessary', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        S
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        verificationCheckComplete={true}
        announcements={[fakeTeacherAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      1
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('has non-verified and provided teacher announcements if necessary', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        verificationCheckComplete={true}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      2
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('has only teacher announcements', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      2
    );
    wrapper
      .find('ScriptAnnouncements')
      .props()
      .announcements.forEach(node => {
        expect(
          node.visibility === NotificationType.teacher ||
            node.visibility === NotificationType.teacherAndStudent
        );
      });
  });

  it('has student announcement if necessary', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        viewAs={ViewType.Student}
        announcements={[fakeStudentAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      1
    );
  });

  it('has all student announcements but no teacher announcements if necessary', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        viewAs={ViewType.Student}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(
      wrapper.find('ScriptAnnouncements').props().announcements.length,
      2
    );
    wrapper
      .find('ScriptAnnouncements')
      .props()
      .announcements.forEach(node => {
        expect(
          node.visibility === NotificationType.student ||
            node.visibility === NotificationType.teacherAndStudent
        );
      });
  });

  it('passes properly-formatted versions to AssignmentVersionSelector', () => {
    const versions = [
      {
        name: 'coursea-2017',
        year: '2017',
        title: '2017',
        isStable: true,
        locales: ['English', 'Italian'],
        canViewVersion: true
      },
      {
        name: 'coursea-2018',
        year: '2018',
        title: '2018',
        isStable: true,
        locales: ['English'],
        canViewVersion: true
      },
      {
        name: 'coursea-2019',
        year: '2019',
        title: '2019',
        isStable: false,
        locales: [],
        canViewVersion: false
      }
    ];
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        scriptName="coursea-2018"
        versions={versions}
        localeEnglishName="Italian"
      />,
      {disableLifecycleMethods: true}
    );

    const versionSelector = wrapper.find('AssignmentVersionSelector');
    assert.equal(1, versionSelector.length);
    const renderedVersions = versionSelector.props().versions;
    assert.equal(2, renderedVersions.length);
    const coursea2017 = renderedVersions.find(v => v.name === 'coursea-2017');
    assert.equal(true, coursea2017.isRecommended);
    const coursea2018 = renderedVersions.find(v => v.name === 'coursea-2018');
    assert.equal(true, coursea2018.isSelected);
  });

  it('has correct unit description', () => {
    const wrapper = shallow(<ScriptOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });
});
