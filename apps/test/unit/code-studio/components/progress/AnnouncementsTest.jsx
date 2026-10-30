import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement,
  fakeTeacherAnnouncementWithDismissibleAndButtonText,
  fakeOldTeacherAnnouncement,
} from './FakeAnnouncementsTestData';

const defaultProps = {
  announcements: [],
  viewAs: ViewType.Instructor,
  width: 1000,
};

const firehoseAnalyticsData = {
  user_id: 1,
  script_id: 2,
};

describe('Announcements', () => {
  it('does not show NotificationBanner if no announcements', () => {
    const wrapper = shallow(<Announcements {...defaultProps} />);
    expect(wrapper.find(NotificationBanner).length).toEqual(0);
  });

  it('displays old teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(1);
  });

  it('does not display old teacher announcement for participant', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(0);
  });

  it('displays new teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(1);
  });

  it('defaults to dismissible and "Learn more" action for announcement without dismissible and button text', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    const banner = wrapper.find(NotificationBanner);
    expect(banner.length).toEqual(1);
    expect(typeof banner.prop('onClose')).toEqual('function');
    expect(banner.prop('actions').props.text).toEqual('Learn more');
  });

  it('displays non-dismissible announcement with custom action text', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncementWithDismissibleAndButtonText]}
      />
    );
    const banner = wrapper.find(NotificationBanner);
    expect(banner.length).toEqual(1);
    expect(banner.prop('onClose')).toBeUndefined();
    expect(banner.prop('actions').props.text).toEqual('Push the button');
  });

  it('has only instructor announcements', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement,
        ]}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(2);
  });

  it('has participant announcement if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(1);
  });

  it('has all participant announcements but no instructor announcements if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement,
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(2);
  });

  it('displays instructor announcement with analytics data', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        firehoseAnalyticsData={firehoseAnalyticsData}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(NotificationBanner).length).toEqual(1);
  });
});
