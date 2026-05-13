import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import React from 'react';

import LtiLinkAccountPage from '@cdo/apps/simpleSignUp/lti/link/LtiLinkAccountPage';
import {
  LtiProviderContext,
  LtiProviderContextProps,
} from '@cdo/apps/simpleSignUp/lti/link/LtiLinkAccountPage/context';
import {navigateToHref} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const DEFAULT_CONTEXT: LtiProviderContextProps = {
  ltiProvider: 'canvas_cloud',
  ltiProviderName: 'Canvas',
  newAccountUrl: new URL('https://example.com/new-account'),
  existingAccountUrl: new URL('https://example.com/existing-account'),
  finishSignUpUrl: '/finish',
  emailAddress: 'test@code.org',
  newCtaType: 'new',
  continueAccountUrl: '/continue',
  userType: 'teacher',
};

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  navigateToHref: jest.fn(),
}));

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn(),
}));

fetchMock.enableMocks();

const navigateToHrefMock = navigateToHref as jest.Mock;

describe('LTI Link Account Page Tests', () => {
  describe('LTI Link Account Existing Account Card Tests', () => {
    it('should render an existing account card', () => {
      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

      // eslint-disable-next-line no-restricted-properties
      const existingAccountCard = screen.getByTestId('existing-account-card');
      const withinExistingAccountCard = within(existingAccountCard);
      const urlParams = new URLSearchParams({
        lms_name: DEFAULT_CONTEXT.ltiProviderName,
        lti_provider: DEFAULT_CONTEXT.ltiProvider,
        email: DEFAULT_CONTEXT.emailAddress,
      });

      // Should render header
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardHeaderLabel()
      );
      // Should render card content
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardContent({providerName: 'Canvas'})
      );
      // Should have button to link new account
      const existingAccountButton = withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardActionLabel()
      );

      fireEvent.click(existingAccountButton);

      expect(navigateToHrefMock).toBeCalledWith(
        `https://example.com/existing-account?${urlParams}`
      );
    });
  });

  describe('LTI Link Account New Account Card Tests', () => {
    it('should render a new account card', async () => {
      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

      // eslint-disable-next-line no-restricted-properties
      const newAccountCard = screen.getByTestId('new-account-card');
      const withinNewAccountCard = within(newAccountCard);

      // Should render header
      withinNewAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardHeaderLabel()
      );
      // Should render card content
      withinNewAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardContent({providerName: 'Canvas'})
      );
      // Should have button to link new account
      const newAccountButton = withinNewAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardActionLabel()
      );

      fetchMock.mockIf(DEFAULT_CONTEXT.newAccountUrl.href, async () => {
        return {
          status: 200,
        };
      });

      fireEvent.click(newAccountButton);

      waitFor(() => {
        expect(navigateToHrefMock).toHaveBeenCalledWith(
          DEFAULT_CONTEXT.finishSignUpUrl
        );
      });
    });
  });

  describe('LTI Link Account Continue Card Tests', () => {
    it('should render a continue card', () => {
      render(
        <LtiProviderContext.Provider
          value={{...DEFAULT_CONTEXT, newCtaType: 'continue'}}
        >
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

      // eslint-disable-next-line no-restricted-properties
      const continueAccountCard = screen.getByTestId('continue-account-card');
      const withinContinueAccountCard = within(continueAccountCard);

      // Should render header
      withinContinueAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardHeaderLabel()
      );
      // Should render card content
      withinContinueAccountCard.getByText(
        i18n.ltiLinkAccountContinueAccountCardContent({providerName: 'Canvas'})
      );
      // Should have button to continue to existing account
      const continueAccountButton = withinContinueAccountCard.getByText(
        i18n.ltiIframeCallToAction()
      );

      fireEvent.click(continueAccountButton);

      fetchMock.mockIf(DEFAULT_CONTEXT.newAccountUrl.href, async () => {
        return {
          status: 200,
        };
      });

      waitFor(() => {
        expect(navigateToHrefMock).toHaveBeenCalledWith(
          DEFAULT_CONTEXT.continueAccountUrl
        );
      });
    });
  });

  describe('cancel button', () => {
    it('should link to the cancel controller', () => {
      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

      const cancelButton = screen.getByText(i18n.cancel());

      fireEvent.click(cancelButton);

      expect(navigateToHrefMock).toBeCalledWith(`/users/cancel`);
    });

    it('should link to the sign out controller', () => {
      render(
        <LtiProviderContext.Provider
          value={{...DEFAULT_CONTEXT, newCtaType: 'continue'}}
        >
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

      const cancelButton = screen.getByText(i18n.cancel());

      fireEvent.click(cancelButton);

      expect(navigateToHref).toBeCalledWith(`/users/sign_out`);
    });
  });
});
