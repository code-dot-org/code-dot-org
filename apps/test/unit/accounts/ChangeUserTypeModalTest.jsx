import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import ChangeUserTypeModal from '@cdo/apps/accounts/ChangeUserTypeModal';

// Mock i18n strings used in the components
jest.mock('@cdo/locale', () => ({
  changeUserTypeModal_save_teacher: jest.fn(() => 'Save Teacher'),
  cancel: jest.fn(() => 'Cancel'),
  saving: jest.fn(() => 'Saving...'),
  changeUserTypeModal_title: jest.fn(() => 'Change User Type'),
  changeUserTypeModal_description_toTeacher: jest.fn(
    () => 'Change User Type description to teacher'
  ),
  changeUserTypeModal_unexpectedError: jest.fn(
    () => 'An unexpected error occurred.'
  ),
  changeUserTypeModal_email_label: jest.fn(() => 'Email label'),
  changeUserTypeModal_email_labelDetails: jest.fn(() => 'Email label details'),
  changeUserTypeModal_email_isRequired: jest.fn(() => 'Email is required.'),
  changeUserTypeModal_email_invalid: jest.fn(() => 'Invalid email.'),
  changeUserTypeModal_emailOptIn_description: jest.fn(
    () => 'Email opt-in description.'
  ),
  changeUserTypeModal_emailOptIn_privacyPolicy: jest.fn(
    () => 'Email opt-in privacy policy.'
  ),
  changeUserTypeModal_emailOptIn_isRequired: jest.fn(
    () => 'Email opt-in is required.'
  ),
  dialogOK: jest.fn(() => 'OK'),
  closeDialog: jest.fn(() => 'Close'),
  yes: jest.fn(() => 'Yes'),
  no: jest.fn(() => 'No'),
}));

describe('ChangeUserTypeModal', () => {
  const DEFAULT_PROPS = {
    handleSubmit: jest.fn(() => Promise.resolve()),
    handleCancel: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<ChangeUserTypeModal {...DEFAULT_PROPS} {...props} />);
  };

  const getEmailInput = () => screen.getByRole('textbox', {name: /email/i});
  const getEmailOptInSelect = () =>
    screen.getByRole('combobox', {name: /email opt-in/i});
  const getSubmitButton = () =>
    screen.getByRole('button', {name: /save teacher/i});
  const getCancelButton = () => screen.getByRole('button', {name: /cancel/i});

  it('renders the modal with the correct title', () => {
    renderComponent();
    expect(screen.getByText('Change User Type')).toBeInTheDocument();
  });

  it('disables everything and shows save text when saving', async () => {
    renderComponent();
    fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
    fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});
    fireEvent.click(getSubmitButton());

    expect(getEmailInput()).toBeDisabled();
    expect(getEmailOptInSelect()).toBeDisabled();
    expect(getSubmitButton()).toBeDisabled();
    expect(getCancelButton()).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows unknown error text when an unknown error occurs', async () => {
    DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce(
      new Error('Unknown error')
    );
    renderComponent();
    fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
    fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});
    fireEvent.click(getSubmitButton());

    expect(
      await screen.findByText('An unexpected error occurred.')
    ).toBeInTheDocument();
  });

  it('calls handleCancel when clicking the cancel button', () => {
    const handleCancel = jest.fn();
    renderComponent({handleCancel});

    fireEvent.click(getCancelButton());
    expect(handleCancel).toHaveBeenCalled();
  });

  describe('validation', () => {
    it('shows an error when email is empty', () => {
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: ''}});
      fireEvent.blur(getEmailInput());

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when email is invalid', () => {
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: 'invalidEmail'}});
      fireEvent.blur(getEmailInput());

      expect(screen.getByText('Invalid email.')).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when email opt-in is empty', () => {
      renderComponent();
      fireEvent.change(getEmailOptInSelect(), {target: {value: ''}});
      fireEvent.blur(getEmailOptInSelect());

      expect(screen.getByText('Email opt-in is required.')).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('enables the submit button when form is valid', () => {
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
      fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});

      expect(getSubmitButton()).not.toBeDisabled();
    });
  });

  describe('server errors', () => {
    it('shows server errors for email', () => {
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
      fireEvent.change(getEmailInput(), {target: {value: ''}});

      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });

    it('shows server errors for email opt-in', () => {
      renderComponent();
      fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});
      fireEvent.change(getEmailOptInSelect(), {target: {value: ''}});

      expect(screen.getByText('Email opt-in is required.')).toBeInTheDocument();
    });
  });

  describe('onSubmitFailure', () => {
    it('shows unknown error when no server errors are returned', async () => {
      DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce(
        new Error('Unknown error')
      );
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
      fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});
      fireEvent.click(getSubmitButton());

      expect(
        await screen.findByText('An unexpected error occurred.')
      ).toBeInTheDocument();
    });

    it('shows server errors when they are returned', async () => {
      const serverErrors = {
        email: 'Email already in use',
        emailOptIn: 'Invalid opt-in selection',
      };
      DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce({serverErrors});
      renderComponent();
      fireEvent.change(getEmailInput(), {target: {value: 'valid@example.com'}});
      fireEvent.change(getEmailOptInSelect(), {target: {value: 'yes'}});
      fireEvent.click(getSubmitButton());

      expect(
        await screen.findByText('Email already in use')
      ).toBeInTheDocument();
      expect(screen.getByText('Invalid opt-in selection')).toBeInTheDocument();
    });
  });
});
