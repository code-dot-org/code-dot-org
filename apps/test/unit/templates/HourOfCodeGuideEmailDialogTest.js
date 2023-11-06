import {assert, expect} from 'chai';
import React from 'react';
import {UnconnectedHourOfCodeGuideEmailDialog as HourOfCodeGuideEmailDialog} from '@cdo/apps/templates/HourOfCodeGuideEmailDialog';
import {shallow, mount} from 'enzyme';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import sinon from 'sinon';
import cookies from 'js-cookie';

describe('HourOfCodeGuideEmailDialog', () => {
  const defaultProps = {
    isSignedIn: true,
  };

  it('renders signed out text in Dialog', () => {
    experiments.setEnabled(experiments.HOC_TUTORIAL_DIALOG, true);
    const wrapper = shallow(<HourOfCodeGuideEmailDialog {...defaultProps} />);
    expect(wrapper.contains(i18n.emailMeAGuide()));
  });

  it('renders correct translations if user is not signed in', () => {
    experiments.setEnabled(experiments.HOC_TUTORIAL_DIALOG, true);
    const wrapper = shallow(
      <HourOfCodeGuideEmailDialog {...defaultProps} isSignedIn={false} />
    );
    expect(wrapper.contains(i18n.getGuideContinue()));
  });

  it('renders null if experiment flag is false', () => {
    experiments.setEnabled(experiments.HOC_TUTORIAL_DIALOG, false);
    const wrapper = shallow(<HourOfCodeGuideEmailDialog {...defaultProps} />);
    assert.equal(wrapper.children().length, 0);
  });

  it('cookie is save when dialog is closed', () => {
    const wrapper = mount(<HourOfCodeGuideEmailDialog {...defaultProps} />);
    var cookieSetStub = sinon.stub(cookies, 'set');
    wrapper.find('.uitest-no-email-guide').simulate('click');
    expect(cookieSetStub).to.have.been.calledWith(
      'HourOfCodeGuideEmailDialogSeen',
      'true',
      {expires: 90, path: '/'}
    );
    cookies.set.restore();
  });
});
