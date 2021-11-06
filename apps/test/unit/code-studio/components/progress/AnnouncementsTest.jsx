import React from 'react';
import {assert} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import Notification from '@cdo/apps/templates/Notification';
import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement,
  fakeOldTeacherAnnouncement
} from './FakeAnnouncementsTestData';

const defaultProps = {
  announcements: [],
  viewAs: ViewType.Instructor,
  width: 1000
};

const firehoseAnalyticsData = {
  user_id: 1,
  script_id: 2
};

describe('Announcements', () => {
  it('does not show Notifications if no announcements', () => {
    const wrapper = shallow(<Announcements {...defaultProps} />);
    assert.equal(wrapper.find(Notification).length, 0);
  });

  it('displays old teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
      />
    );
    assert.equal(wrapper.find(Notification).length, 1);
  });

  it('does not display old teacher announcement for participant', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
        viewAs={ViewType.Participant}
      />
    );
    assert.equal(wrapper.find(Notification).length, 0);
  });

  it('displays new teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    assert.equal(wrapper.find(Notification).length, 1);
  });

  it('has only instructor announcements', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement
        ]}
      />
    );
    assert.equal(wrapper.find(Notification).length, 2);
  });

  it('has participant announcement if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />
    );
    assert.equal(wrapper.find(Notification).length, 1);
  });

  it('has all participant announcements but no instructor announcements if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find(Notification).length, 2);
  });

  it('displays instructor announcement with analytics data', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        firehoseAnalyticsData={firehoseAnalyticsData}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    assert.equal(wrapper.find(Notification).length, 1);
  });
});
