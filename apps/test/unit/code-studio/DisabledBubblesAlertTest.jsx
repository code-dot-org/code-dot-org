import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {disabledBubblesSupportArticle} from '@cdo/apps/code-studio/disabledBubbles';
import DisabledBubblesAlert from '@cdo/apps/code-studio/DisabledBubblesAlert';
import Alert from '@cdo/apps/legacySharedComponents/alert';
import i18n from '@cdo/locale';

describe('DisabledBubblesAlert', () => {
  it('is visible at first, if not seen before', () => {
    sessionStorage.setItem('disabledBubblesAlertSeen', 'false');
    const wrapper = shallow(<DisabledBubblesAlert />);
    expect(
      wrapper.containsMatchingElement(
        <Alert type={'error'} onClose={wrapper.instance().onClose}>
          <div>
            <span>{i18n.disabledButtonsWarning() + ' '}</span>
            <span>{i18n.disabledButtonsInfo() + ' '}</span>
            <a
              href={disabledBubblesSupportArticle}
              target="_blank"
              rel="noopener noreferrer"
            >
              {i18n.learnMore()}
            </a>
          </div>
        </Alert>
      )
    ).toBe(true);
  });

  it('is hidden at first, if seen before', () => {
    sessionStorage.setItem('disabledBubblesAlertSeen', 'true');
    const wrapper = shallow(<DisabledBubblesAlert />);
    expect(wrapper.find('Alert').length).toBe(0);
  });

  it('hides and remembers that the alert was seen when closed', () => {
    sessionStorage.setItem('disabledBubblesAlertSeen', 'false');
    const wrapper = shallow(<DisabledBubblesAlert />);
    expect(wrapper.find('Alert').length).toBe(1);

    // Call whatever close handler we passed to the alert
    wrapper.find('Alert').prop('onClose')();
    wrapper.update();

    expect(wrapper.find('Alert').length).toBe(0);
    expect(sessionStorage.getItem('disabledBubblesAlertSeen')).toBe('true');
  });
});
