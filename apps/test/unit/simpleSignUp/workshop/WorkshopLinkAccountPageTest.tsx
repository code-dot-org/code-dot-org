import {render, screen, within} from '@testing-library/react';
import React from 'react';

import WorkshopLinkAccountPage from '@cdo/apps/simpleSignUp/workshop/WorkshopLinkAccountPage';
import i18n from '@cdo/locale';

describe('Workshop Link Account Page Tests', () => {
  const defaultProps = {
    emailAddress: 'test_workshop_signup@code.org',
    newAccountUrl: 'newAccountUrl.com',
    existingAccountUrl: 'existingAccountUrl.com',
  };

  function renderDefault() {
    render(<WorkshopLinkAccountPage {...defaultProps} />);
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
      ).toBe(defaultProps.existingAccountUrl);
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

  describe('cancel button', () => {
    it('should link to the cancel controller', () => {
      renderDefault();

      expect(
        screen.getByRole('link', {name: i18n.cancel()}).getAttribute('href')
      ).toBe('/users/cancel');
    });
  });
});
