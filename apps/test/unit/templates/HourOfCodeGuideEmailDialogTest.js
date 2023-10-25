import {assert, expect} from 'chai';
import React from 'react';
import sinon from 'sinon';
import {UnconnectedHourOfCodeGuideEmailDialog as HourOfCodeGuideEmailDialog} from '@cdo/apps/templates/HourOfCodeGuideEmailDialog';
import {shallow, mount} from 'enzyme';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

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

  it('sends Amplitude event', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    const wrapper = mount(<HourOfCodeGuideEmailDialog {...defaultProps} />);
    wrapper.find('button#uitest-email-guide').simulate('click');

    expect(analyticsSpy).to.have.been.calledOnce;
    expect(analyticsSpy.firstCall.args).to.deep.eq([EVENTS.GUIDE_SENT_EVENT]);
    analyticsSpy.restore();
  });
});
