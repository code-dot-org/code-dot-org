import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedHourOfCodeGuideEmailDialog as HourOfCodeGuideEmailDialog} from '@cdo/apps/templates/HourOfCodeGuideEmailDialog';
import i18n from '@cdo/locale';

describe('HourOfCodeGuideEmailDialog', () => {
  const defaultProps = {
    isSignedIn: true,
    unitId: 100,
  };

  it('renders signed out text in Dialog', () => {
    const wrapper = shallow(<HourOfCodeGuideEmailDialog {...defaultProps} />);
    expect(wrapper.contains(i18n.emailMeAGuide()));
  });

  it('renders correct translations if user is not signed in', () => {
    const wrapper = shallow(
      <HourOfCodeGuideEmailDialog {...defaultProps} isSignedIn={false} />
    );
    expect(wrapper.contains(i18n.getGuideContinue()));
  });
});
