import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import WorkshopLinkAccountPage from '@cdo/apps/lib/ui/simpleSignUp/workshop/WorkshopLinkAccountPage';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {expect} from '../../../../../util/reconfiguredChai';

describe('Workshop Link Account Page Tests', () => {
  const defaultProps = {
    newCtaType: 'new',
    emailAddress: 'test_workshop_signup@code.org',
    newAccountUrl: 'newAccountUrl.com',
    continueAccountUrl: 'continueAccountUrl.com',
    existingAccountUrlHref: 'existingAccountUrl.com',
  };

  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
  });

  afterEach(() => {
    (utils.navigateToHref as sinon.SinonStub).restore();
  });

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
      const existingAccountButton = withinExistingAccountCard.getByText(
        i18n.ltiLinkAccountExistingAccountCardActionLabel()
      );

      fireEvent.click(existingAccountButton);

      expect(utils.navigateToHref).to.have.been.calledWith(
        defaultProps.existingAccountUrlHref
      );
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
      const newAccountButton = withinNewAccountCard.getByText(
        i18n.createAccount()
      );

      fireEvent.click(newAccountButton);

      await waitFor(
        () =>
          expect(utils.navigateToHref).to.have.been.calledWith(
            defaultProps.newAccountUrl
          ),
        {timeout: 999999}
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
      const continueAccountButton = withinContinueAccountCard.getByText(
        i18n.ltiIframeCallToAction()
      );

      fireEvent.click(continueAccountButton);

      await waitFor(
        () =>
          expect(utils.navigateToHref).to.have.been.calledWith(
            defaultProps.continueAccountUrl
          ),
        {timeout: 999999}
      );
    });
  });

  describe('cancel button', () => {
    it('should link to the cancel controller when newCtaType is new', () => {
      renderDefault();

      const cancelButton = screen.getByText(i18n.cancel());

      fireEvent.click(cancelButton);

      expect(utils.navigateToHref).to.have.been.calledWith(`/users/cancel`);
    });

    it('should link to the sign out controller when newCtaType is continue', () => {
      renderDefault({newCtaType: 'continue'});

      const cancelButton = screen.getByText(i18n.cancel());

      fireEvent.click(cancelButton);

      expect(utils.navigateToHref).to.have.been.calledWith(`/users/sign_out`);
    });
  });
});
