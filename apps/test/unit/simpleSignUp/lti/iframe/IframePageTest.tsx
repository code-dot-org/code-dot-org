import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils'; // eslint-disable-line no-restricted-imports
import sinon, {SinonStub} from 'sinon'; // eslint-disable-line no-restricted-imports

import LtiIframePage from '@cdo/apps/simpleSignUp/lti/iframe/LtiIframePage';
import i18n from '@cdo/locale';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  logoUrl: 'https://code.org/assets/logo.svg',
  authUrl: 'https://code.org/auth',
};

const IFRAME_TIMEOUT_MILLISECONDS = 300000;

describe('LTI Iframe Page Test', () => {
  beforeEach(() => sinon.stub(window, 'open'));
  afterEach(() => (window.open as SinonStub).restore());

  it('should open a new window when the button is pressed', async () => {
    const user = userEvent.setup();
    render(<LtiIframePage {...DEFAULT_PROPS} />);

    const button = screen.getByRole('button', {
      name: i18n.ltiIframeCallToAction(),
    });

    await user.click(button);

    expect(window.open).to.have.been.calledOnce.and.calledWith(
      DEFAULT_PROPS.authUrl
    );
    expect(button.getAttribute('disabled')).to.equal('');
  });

  it('should time out after 5 minutes', async () => {
    jest.useFakeTimers();
    render(<LtiIframePage {...DEFAULT_PROPS} />);

    const button = screen.getByRole('button', {
      name: i18n.ltiIframeCallToAction(),
    });
    const message = screen.getByText(i18n.ltiIframeDescription());

    act(() => {
      jest.advanceTimersByTime(IFRAME_TIMEOUT_MILLISECONDS);
    });

    expect(message.textContent).to.equal(i18n.ltiIframeTimedOut());
    expect(button.getAttribute('disabled')).to.equal('');
  });
});
