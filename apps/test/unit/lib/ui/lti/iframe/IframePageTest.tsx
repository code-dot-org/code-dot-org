import i18n from '@cdo/locale';
import {render, screen} from '@testing-library/react';
import LtiIframePage from '@cdo/apps/lib/ui/lti/iframe/LtiIframePage';
import React from 'react';
import sinon, {SinonStub} from 'sinon';
import {expect} from '../../../../../util/reconfiguredChai';
import userEvent from '@testing-library/user-event';

const DEFAULT_PROPS = {
  logoUrl: 'https://code.org/assets/logo.svg',
  authUrl: 'https://code.org/auth',
};

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
});
