import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedLoginTypePicker as LoginTypePicker} from '@cdo/apps/templates/teacherDashboard/LoginTypePicker';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

describe('LoginTypePicker', () => {
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
