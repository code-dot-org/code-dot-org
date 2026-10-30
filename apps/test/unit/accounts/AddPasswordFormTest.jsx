import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import AddPasswordForm, {
  SAVING_STATE,
  SUCCESS_STATE,
  PASSWORD_TOO_SHORT,
  PASSWORDS_MUST_MATCH,
} from '@cdo/apps/accounts/AddPasswordForm';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

describe('AddPasswordForm', () => {
  let handleSubmit;

  const renderForm = props => {
    render(<AddPasswordForm handleSubmit={handleSubmit} {...props} />);
    return {
      passwordField: screen.getByLabelText(i18n.password()),
      passwordConfirmationField: screen.getByLabelText(
        i18n.passwordConfirmation()
      ),
      submitButton: screen.getByRole('button', {name: i18n.createPassword()}),
    };
  };

  const setPasswords = (passwordField, passwordConfirmationField, password) => {
    fireEvent.change(passwordField, {target: {value: password}});
    fireEvent.change(passwordConfirmationField, {target: {value: password}});
  };

  beforeEach(() => {
    handleSubmit = jest.fn();
    jest.spyOn(utils, 'reload').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('enables form submission if passwords have minimum length and match', () => {
    const {passwordField, passwordConfirmationField, submitButton} =
      renderForm();
    setPasswords(passwordField, passwordConfirmationField, 'mypassword');

    expect(submitButton).toBeEnabled();
  });

  it('disables form submission if passwords are empty', () => {
    const {submitButton} = renderForm();

    expect(submitButton).toBeDisabled();
  });

  it('disables form submission if passwords are too short', () => {
    const {passwordField, passwordConfirmationField, submitButton} =
      renderForm();
    setPasswords(passwordField, passwordConfirmationField, 'short');

    expect(submitButton).toBeDisabled();
  });

  it('disables form submission if passwords do not match', () => {
    const {passwordField, passwordConfirmationField, submitButton} =
      renderForm();
    fireEvent.change(passwordField, {target: {value: 'newpassword'}});
    fireEvent.change(passwordConfirmationField, {
      target: {value: 'notnewpassword'},
    });

    expect(submitButton).toBeDisabled();
  });

  it('renders password length validation errors if passwords are too short', () => {
    const {passwordField, passwordConfirmationField} = renderForm();
    setPasswords(passwordField, passwordConfirmationField, 'short');

    expect(screen.getAllByText(PASSWORD_TOO_SHORT)).toHaveLength(2);
  });

  it('renders a password mismatch validation error if passwords do not match', () => {
    const {passwordField, passwordConfirmationField} = renderForm();
    fireEvent.change(passwordField, {target: {value: 'newpassword'}});
    fireEvent.change(passwordConfirmationField, {
      target: {value: 'notnewpassword'},
    });

    expect(screen.getByText(PASSWORDS_MUST_MATCH)).toBeInTheDocument();
  });

  it('renders the form submission state', async () => {
    handleSubmit.mockReturnValue(new Promise(() => {}));
    const {passwordField, passwordConfirmationField, submitButton} =
      renderForm();
    setPasswords(passwordField, passwordConfirmationField, 'mypassword');
    fireEvent.click(submitButton);

    await screen.findByText(SAVING_STATE);
  });

  describe('on successful submission', () => {
    let passwordField, passwordConfirmationField, submitButton;

    beforeEach(async () => {
      handleSubmit.mockResolvedValue({});
      ({passwordField, passwordConfirmationField, submitButton} = renderForm());
      setPasswords(passwordField, passwordConfirmationField, 'mypassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith('mypassword', 'mypassword');
      });
      await screen.findByText(SUCCESS_STATE);
    });

    it('resets the password field to its default state', () => {
      expect(passwordField).toHaveValue('');
    });

    it('resets the password confirmation field to its default state', () => {
      expect(passwordConfirmationField).toHaveValue('');
    });

    it('renders the success state', () => {
      expect(screen.getByText(SUCCESS_STATE)).toBeInTheDocument();
    });
  });

  describe('on failed submission', () => {
    let passwordField, passwordConfirmationField, submitButton;

    beforeEach(async () => {
      handleSubmit.mockRejectedValue(new Error('Oh no!'));
      ({passwordField, passwordConfirmationField, submitButton} = renderForm());
      setPasswords(passwordField, passwordConfirmationField, 'mypassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith('mypassword', 'mypassword');
      });
      await screen.findByText('Oh no!');
    });

    it('does not reset the password field to its default state', () => {
      expect(passwordField).toHaveValue('mypassword');
    });

    it('does not reset the password confirmation field to its default state', () => {
      expect(passwordConfirmationField).toHaveValue('mypassword');
    });

    it('renders the error state', () => {
      expect(screen.getByText('Oh no!')).toBeInTheDocument();
    });
  });
});
