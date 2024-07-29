import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {registerReducers, stubRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {UnconnectedLoginTypePicker as LoginTypePicker} from '@cdo/apps/templates/teacherDashboard/LoginTypePicker';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');

    wrapper.find('PictureLoginCard').simulate('click');

    expect(sendEventSpy).to.be.calledOnce;
    expect(sendEventSpy).calledWith('Login Type Selected');

    analyticsReporter.sendEvent.restore();
  });
});
