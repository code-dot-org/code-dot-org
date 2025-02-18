import {fireEvent, render, screen} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import LtiUpgradeAccountDialog from '@cdo/apps/simpleSignUp/lti/upgrade/LtiUpgradeAccountDialog';
import {LtiUpgradeAccountForm} from '@cdo/apps/simpleSignUp/lti/upgrade/types';
import i18n from '@cdo/locale';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const MOCK_FORM_DATA: LtiUpgradeAccountForm = {
  destination_url: 'https://code.org/upgrade',
  email: 'test@code.org',
};

describe('LTI Upgrade Account Dialog', () => {
  beforeEach(() => {
    const jqueryStub = sinon.stub($, 'ajax');
    jqueryStub.yieldsTo('success');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Email Form', () => {
    it('should show an email address form with the LTI email pre-populated', () => {
      render(<LtiUpgradeAccountDialog formData={MOCK_FORM_DATA} />);

      screen.getByText(i18n.ltiUpgradeAccountDialogTitle());

      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());

      expect(emailInput.value).to.equal(MOCK_FORM_DATA.email);
    });

    it('should show an error if the email is empty', () => {
      render(<LtiUpgradeAccountDialog formData={MOCK_FORM_DATA} />);

      screen.getByText(i18n.ltiUpgradeAccountDialogTitle());

      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());

      expect(emailInput.value).to.equal(MOCK_FORM_DATA.email);

      fireEvent.change(emailInput, {target: {value: ''}});

      // should show an error message if no email
      screen.getByText(i18n.ltiUpgradeAccountDialogInvalidEmail());

      // remove error if email is populated
      fireEvent.change(emailInput, {target: {value: 'test2@code.org'}});
      const errorMessage = screen.queryByText(
        i18n.ltiUpgradeAccountDialogInvalidEmail()
      );

      expect(errorMessage).to.equal(null);
    });

    it('should NOT populate the email address field if there is no LTI email pre-populated', () => {
      const formData = {...MOCK_FORM_DATA, email: undefined};
      render(<LtiUpgradeAccountDialog formData={formData} />);

      screen.getByText(i18n.ltiUpgradeAccountDialogTitle());

      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());

      expect(emailInput.value).to.equal('');

      // should show an error message if no email
      screen.getByText(i18n.ltiUpgradeAccountDialogInvalidEmail());
    });

    it('should submit the email address to the api endpoint', () => {
      const mockOnClose = sinon.spy();
      render(
        <LtiUpgradeAccountDialog
          formData={MOCK_FORM_DATA}
          onClose={mockOnClose}
        />
      );

      const continueButton = screen.getByText(i18n.continue());

      fireEvent.click(continueButton);

      expect($.ajax).to.have.been.calledWith(
        sinon.match({
          url: '/lti/v1/upgrade_account',
          data: {
            email: MOCK_FORM_DATA.email,
          },
          dataType: 'json',
          success: sinon.match.any,
        })
      );

      // render the spinner
      screen.getByText(i18n.loading());
      sinon.assert.called(mockOnClose);
    });
  });
});
