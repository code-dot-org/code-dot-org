import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import DCDO from '@cdo/apps/dcdo';
import LtiLinkAccountPage from '@cdo/apps/lib/ui/simpleSignUp/lti/link/LtiLinkAccountPage';
import {
  LtiProviderContext,
  LtiProviderContextProps,
} from '@cdo/apps/lib/ui/simpleSignUp/lti/link/LtiLinkAccountPage/context';
import * as authenticityTokenStore from '@cdo/apps/util/AuthenticityTokenStore';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {expect} from '../../../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_CONTEXT: LtiProviderContextProps = {
  ltiProvider: 'canvas_cloud',
  ltiProviderName: 'Canvas',
  newAccountUrl: '/new-account',
  existingAccountUrl: new URL('https://example.com/existing-account'),
  emailAddress: 'test@code.org',
  newCtaType: 'new',
  continueAccountUrl: '/continue',
};

describe('LTI Link Account Page Tests', () => {
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
  });

  afterEach(() => {
    (utils.navigateToHref as sinon.SinonStub).restore();
  });

  describe('LTI Link Account Existing Account Card Tests', () => {
    it('should render an existing account card', () => {
      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

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

      expect(utils.navigateToHref).to.have.been.calledWith(
        `https://example.com/existing-account?${urlParams}`
      );
    });
  });

  describe('LTI Link Account New Account Card Tests', () => {
    it('should render a new account card', async () => {
      const authenticityTokenStoreStub = sinon.stub(
        authenticityTokenStore,
        'getAuthenticityToken'
      );
      authenticityTokenStoreStub.returns(Promise.resolve('123'));

      const fetchStub = sinon.stub(window, 'fetch');
      fetchStub
        .withArgs('/lti/v1/account_linking/new_account')
        .returns(Promise.resolve({ok: true} as never));

      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

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

      fireEvent.click(newAccountButton);

      await waitFor(
        () =>
          expect(utils.navigateToHref).to.have.been.calledWith('/new-account'),
        {timeout: 999999}
      );
    });

    it('should render a new account card - student email post enabled', () => {
      DCDO.set('student-email-post-enabled', true);

      render(
        <LtiProviderContext.Provider value={DEFAULT_CONTEXT}>
          <LtiLinkAccountPage />
        </LtiProviderContext.Provider>
      );

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
      const newAccountForm: HTMLFormElement =
        screen.getByTestId('new-account-form');

      const formValues = new FormData(newAccountForm);

      expect(formValues.get('user[email]')).to.equal(
        DEFAULT_CONTEXT.emailAddress
      );
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

      expect(utils.navigateToHref).to.have.been.calledWith(`/users/cancel`);
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

      expect(utils.navigateToHref).to.have.been.calledWith(`/users/sign_out`);
    });
  });
});
