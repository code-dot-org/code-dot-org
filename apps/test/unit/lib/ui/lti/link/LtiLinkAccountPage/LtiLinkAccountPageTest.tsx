import {fireEvent, render, screen, within} from '@testing-library/react';
import {
  LtiProviderContext,
  LtiProviderContextProps,
} from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/context';
import React from 'react';
import i18n from '@cdo/locale';
import {expect} from '../../../../../../util/reconfiguredChai';
import LtiLinkAccountPage from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import DCDO from '@cdo/apps/dcdo';

const DEFAULT_CONTEXT: LtiProviderContextProps = {
  ltiProvider: 'canvas_cloud',
  ltiProviderName: 'Canvas',
  newAccountUrl: '/new-account',
  existingAccountUrl: new URL('https://example.com/existing-account'),
  emailAddress: 'test@code.org',
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

      // Should render header
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardHeaderLabel()
      );
      // Should render card content
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardContent({providerName: 'Canvas'})
      );
      // Should have button to link new account
      expect(
        withinExistingAccountCard
          .getByText(i18n.ltiLinkAccountExistingAccountCardActionLabel())
          .closest('a')!
          .getAttribute('href')
      ).to.equal(
        'https://example.com/existing-account?lms_name=Canvas&lti_provider=canvas_cloud'
      );
    });
  });

  describe('LTI Link Account New Account Card Tests', () => {
    it('should render a new account card', () => {
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

      expect(utils.navigateToHref).to.have.been.calledWith('/new-account');
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
});
