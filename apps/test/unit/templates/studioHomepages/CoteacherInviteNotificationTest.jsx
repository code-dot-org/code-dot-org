import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedCoteacherInviteNotification as CoteacherInviteNotification} from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';

describe('CoteacherInviteNotification', () => {
  const defaultProps = {
    asyncLoadCoteacherInvite: () => {},
    coteacherInvite: {
      id: 1,
      invited_by_name: 'The Great Pumpkin',
      invited_by_email: 'thegreatpumpkin@code.org',
      section_name: 'The Pumpkin Patch',
      status: 'invited',
      instructor_name: 'Linus',
    },
  };

  it('renders nothing if there is no coteacher invite', () => {
    const wrapper = shallow(
      <CoteacherInviteNotification {...defaultProps} coteacherInvite={null} />
    );
    expect(wrapper.find(Notification).length, 0);
  });

  it('renders notification if there is a coteacher invite', () => {
    const wrapper = shallow(<CoteacherInviteNotification {...defaultProps} />);
    const notification = wrapper.find(Notification);
    expect(notification.length).to.equal(1);
    expect(notification.props().dismissible).to.equal(false);
    expect(notification.props().type).to.equal(NotificationType.collaborate);
    expect(notification.props().notice).to.include('The Great Pumpkin');
  });
});
