import {render, screen, within} from '@testing-library/react';
import React from 'react';

import WorkshopLinkAccountPage from '@cdo/apps/lib/ui/simpleSignUp/workshop/WorkshopLinkAccountPage';
import i18n from '@cdo/locale';

describe('Workshop Link Account Page Tests', () => {
  const defaultProps = {
    newCtaType: 'new',
    emailAddress: 'test_workshop_signup@code.org',
    newAccountUrl: 'newAccountUrl.com',
    continueAccountUrl: 'continueAccountUrl.com',
    existingAccountUrlHref: 'existingAccountUrl.com',
  };

  function renderDefault(overrideProps?: object) {
    const props = {...defaultProps, ...overrideProps};
    render(<WorkshopLinkAccountPage {...props} />);
  }

  describe('Workshop Link Account Existing Account Card Tests', () => {
    it('should render an existing account card', () => {
      renderDefault();

      const existingAccountCard = screen.getByTestId('existing-account-card');
      const withinExistingAccountCard = within(existingAccountCard);

      // Should render header
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardHeaderLabel()
      );
      // Should render card content
      withinExistingAccountCard.getByText(
        i18n.accountExistingAccountCardContentWorkshopEnroll()
      );
      // Should have button to link new account
      withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardActionLabel()
      );
      expect(
        withinExistingAccountCard.getByRole('link').getAttribute('href')
      ).toBe(defaultProps.existingAccountUrlHref);
    });
  });

  describe('Workshop Link Account New Account Card Tests', () => {
    it('should render a new account card', async () => {
      renderDefault();

      const newAccountCard = screen.getByTestId('new-account-card');
      const withinNewAccountCard = within(newAccountCard);

      // Should render header
      withinNewAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardHeaderLabel()
      );
      // Should render card content
      withinNewAccountCard.getByText(
        i18n.accountNewAccountCardContentWorkshopEnroll()
      );
      // Should have button to link new account
      withinNewAccountCard.getByText(i18n.createAccount());

      expect(withinNewAccountCard.getByRole('link').getAttribute('href')).toBe(
        defaultProps.newAccountUrl
      );
    });
  });

  describe('Workshop Link Account Continue Account Card Tests', () => {
    it('should render a continue account card', async () => {
      renderDefault({newCtaType: 'continue'});

      const continueAccountCard = screen.getByTestId('continue-account-card');
      const withinContinueAccountCard = within(continueAccountCard);

      // Should render header
      withinContinueAccountCard.getByText(
        i18n.ltiLinkAccountNewAccountCardHeaderLabel()
      );
      // Should render card content
      withinContinueAccountCard.getByText(
        i18n.ltiLinkAccountContinueAccountCardContent()
      );
      // Should have button to continue to code.org
      withinContinueAccountCard.getByText(i18n.ltiIframeCallToAction());

      expect(
        withinContinueAccountCard.getByRole('link').getAttribute('href')
      ).toBe(defaultProps.continueAccountUrl);
    });
  });

  describe('cancel button', () => {
    it('should link to the cancel controller when newCtaType is new', () => {
      renderDefault();

      expect(
        screen.getByRole('link', {name: i18n.cancel()}).getAttribute('href')
      ).toBe('/users/cancel');
    });

    it('should link to the sign out controller when newCtaType is continue', () => {
      renderDefault({newCtaType: 'continue'});

      expect(
        screen.getByRole('link', {name: i18n.cancel()}).getAttribute('href')
      ).toBe('/users/sign_out');
    });
  });
});
