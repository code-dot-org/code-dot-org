import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedCoteacherInviteNotification as CoteacherInviteNotification} from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import DCDO from '@cdo/apps/dcdo';

describe('CoteacherInviteNotification', () => {
  const defaultProps = {
    asyncLoadCoteacherInvite: () => {},
    asyncLoadSectionData: () => {},
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
    DCDO.set('show-coteacher-ui', true);
    const wrapper = shallow(
      <CoteacherInviteNotification {...defaultProps} coteacherInvite={null} />
    );
    expect(wrapper.find(Notification).length).to.equal(0);
  });

  it('renders nothing if flag is off', () => {
    DCDO.set('show-coteacher-ui', false);
    const wrapper = shallow(
      <CoteacherInviteNotification {...defaultProps} coteacherInvite={null} />
    );
    expect(wrapper.find(Notification).length).to.equal(0);
  });

  it('renders notification if there is a coteacher invite and flag is not set', () => {
    DCDO.reset();
    const wrapper = shallow(<CoteacherInviteNotification {...defaultProps} />);
    const notification = wrapper.find(Notification);
    expect(notification.length).to.equal(1);
    expect(notification.props().dismissible).to.equal(false);
    expect(notification.props().type).to.equal(NotificationType.collaborate);
    expect(notification.props().notice).to.include('The Great Pumpkin');
  });

  it('renders notification if there is a coteacher invite and flag is on', () => {
    DCDO.set('show-coteacher-ui', true);
    const wrapper = shallow(<CoteacherInviteNotification {...defaultProps} />);
    const notification = wrapper.find(Notification);
    expect(notification.length).to.equal(1);
    expect(notification.props().dismissible).to.equal(false);
    expect(notification.props().type).to.equal(NotificationType.collaborate);
    expect(notification.props().notice).to.include('The Great Pumpkin');
  });
});
