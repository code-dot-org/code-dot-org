import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {registerReducers, stubRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {UnconnectedLoginTypePicker as LoginTypePicker} from '@cdo/apps/templates/teacherDashboard/LoginTypePicker';



describe('LoginTypePicker', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers({currentUser});
  });

  it('sends analytic event when a login type is selected', () => {
    const wrapper = shallow(
      <LoginTypePicker
        title="title"
        setLoginType={() => {}}
        handleCancel={() => {}}
        providers={['picture', 'word', 'email']}
      />
    );
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear().mockImplementation();

    wrapper.find('PictureLoginCard').simulate('click');

    expect(sendEventSpy).toHaveBeenCalledTimes(1);
    expect(sendEventSpy).toHaveBeenCalledWith('Login Type Selected');

    analyticsReporter.sendEvent.mockRestore();
  });
});
