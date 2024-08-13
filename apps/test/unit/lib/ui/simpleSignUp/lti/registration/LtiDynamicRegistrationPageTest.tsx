import {fireEvent, render, screen} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import LtiDynamicRegistrationPage from '@cdo/apps/lib/ui/simpleSignUp/lti/registration/LtiDynamicRegistrationPage';
import i18n from '@cdo/locale';

import {expect} from '../../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const MOCK_DATA = {
  email: 'test@code.org',
  registrationID: '12345',
};

const DEFAULT_PROPS = {
  logoUrl: 'https://code.org/assets/logo.svg',
  registrationID: MOCK_DATA.registrationID,
};

describe('LTI Dynamic Registration Page', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('LTI Dynamic Registration Form', () => {
    it('should render the registration form', () => {
      render(<LtiDynamicRegistrationPage {...DEFAULT_PROPS} />);

      screen.getByText(i18n.ltiDynamicRegistrationDescription());

      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());
      expect(emailInput).to.exist;
    });
  });

  describe('LTI Dynamic Registration Submit,', () => {
    it('should invoke success callback on form submit', () => {
      sinon.stub($, 'ajax').yieldsTo('success');
      render(<LtiDynamicRegistrationPage {...DEFAULT_PROPS} />);
      const button = screen.getByRole('button', {
        name: i18n.ltiDynamicRegistrationSubmit(),
      });
      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());
      expect(emailInput.value).to.equal('');
      fireEvent.change(emailInput, {target: {value: MOCK_DATA.email}});
      expect(emailInput.value).to.equal(MOCK_DATA.email);
      fireEvent.click(button);

      expect($.ajax).to.have.been.calledWith(
        sinon.match({
          url: '/lti/v1/dynamic_registration',
          data: {
            email: MOCK_DATA.email,
            registration_id: DEFAULT_PROPS.registrationID,
          },
          dataType: 'json',
          success: sinon.match.any,
        })
      );
    });

    it('should display error message with unsuccessful form submit', () => {
      const errorMsg = 'Error occurred';
      sinon
        .stub($, 'ajax')
        .yieldsTo(
          'error',
          {responseText: JSON.stringify({error: errorMsg})},
          'error'
        );

      render(<LtiDynamicRegistrationPage {...DEFAULT_PROPS} />);
      const emailInput: HTMLInputElement = screen.getByLabelText(i18n.email());
      const button = screen.getByRole('button', {
        name: i18n.ltiDynamicRegistrationSubmit(),
      });

      fireEvent.change(emailInput, {target: {value: MOCK_DATA.email}});
      fireEvent.click(button);

      expect(screen.getByText(errorMsg)).to.exist;
    });
  });
});
