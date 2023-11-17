import {assert, expect} from 'chai';
import React from 'react';
import {UnconnectedHourOfCodeGuideEmailDialog as HourOfCodeGuideEmailDialog} from '@cdo/apps/templates/HourOfCodeGuideEmailDialog';
import {shallow} from 'enzyme';
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';

describe('HourOfCodeGuideEmailDialog', () => {
  const defaultProps = {
    isSignedIn: true,
    unitId: 100,
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
});
