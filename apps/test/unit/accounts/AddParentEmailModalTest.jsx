import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AddParentEmailModal from '@cdo/apps/accounts/AddParentEmailModal';

jest.mock('@cdo/locale', () => ({
  addParentEmailModal_save: jest.fn(() => 'Save'),
  cancel: jest.fn(() => 'Cancel'),
  closeDialog: jest.fn(() => 'Close'),
  saving: jest.fn(() => 'Saving...'),
  changeEmailModal_unexpectedError: jest.fn(
    () => 'An unexpected error occurred.'
  ),
  addParentEmailModal_parentEmail_isRequired: jest.fn(
    () => 'Parent email is required.'
  ),
  addParentEmailModal_parentEmail_invalid: jest.fn(
    () => 'Invalid parent email.'
  ),
  addParentEmailModal_parentEmail_mustBeDifferent: jest.fn(
    () => 'Parent email must be different.'
  ),
  addParentEmailModal_confirmedParentEmail_mustMatch: jest.fn(
    () => 'Confirmed email must match.'
  ),
  addParentEmailModal_title: jest.fn(() => 'Add Parent Email'),
  addParentEmailModal_subtitle: jest.fn(
    () => 'Please provide a parent email address.'
  ),
  addParentEmailModal_parentEmail_label: jest.fn(() => 'Parent Email'),
  addParentEmailModal_confirmedParentEmail_label: jest.fn(
    () => 'Confirm Parent Email'
  ),
  addParentEmailModal_emailOptIn_label: jest.fn(() => 'Email Opt-In'),
  addParentEmailModal_emailOptIn_sublabel: jest.fn(
    () => 'Would you like to opt-in to emails?'
  ),
  addParentEmailModal_emailOptIn_description: jest.fn(
    () => 'Opt-in to receive emails.'
  ),
  changeEmailModal_emailOptIn_privacyPolicy: jest.fn(() => 'Privacy Policy'),
  dialogOK: jest.fn(() => 'OK'),
  yes: jest.fn(() => 'Yes'),
  no: jest.fn(() => 'No'),
}));

describe('AddParentEmailModal', () => {
  const DEFAULT_PROPS = {
    handleSubmit: jest.fn(() => Promise.resolve()),
    handleCancel: jest.fn(),
    currentParentEmail: 'old@example.com',
  };

  const renderComponent = (props = {}) => {
    return render(<AddParentEmailModal {...DEFAULT_PROPS} {...props} />);
  };

  const getParentEmailInput = () => screen.getByLabelText('Parent Email');
  const getConfirmedParentEmailInput = () =>
    screen.getByLabelText('Confirm Parent Email');
  const getEmailOptInYes = () => screen.getByLabelText('Yes');
  const getEmailOptInNo = () => screen.getByLabelText('No');
  const getSubmitButton = () => screen.getByRole('button', {name: /save/i});
  const getCancelButton = () => screen.getByRole('button', {name: /cancel/i});

  it('renders the modal with the correct title and subtitle', () => {
    renderComponent();
    expect(screen.getByText('Add Parent Email')).toBeInTheDocument();
    expect(
      screen.getByText('Please provide a parent email address.')
    ).toBeInTheDocument();
  });

  it('disables everything and shows save text when saving', async () => {
    renderComponent();
    fireEvent.change(getParentEmailInput(), {
      target: {value: 'new@example.com'},
    });
    fireEvent.change(getConfirmedParentEmailInput(), {
      target: {value: 'new@example.com'},
    });
    fireEvent.click(getSubmitButton());

    expect(getParentEmailInput()).toBeDisabled();
    expect(getConfirmedParentEmailInput()).toBeDisabled();
    expect(getEmailOptInYes()).toBeDisabled();
    expect(getEmailOptInNo()).toBeDisabled();
    expect(getSubmitButton()).toBeDisabled();
    expect(getCancelButton()).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows unknown error text when an unknown error occurs', async () => {
    DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce(
      new Error('Unknown error')
    );
    renderComponent();
    fireEvent.change(getParentEmailInput(), {
      target: {value: 'new@example.com'},
    });
    fireEvent.change(getConfirmedParentEmailInput(), {
      target: {value: 'new@example.com'},
    });
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
    it('shows an error when parent email is empty', () => {
      renderComponent();
      fireEvent.change(getParentEmailInput(), {target: {value: ''}});
      fireEvent.blur(getParentEmailInput());

      expect(screen.getByText('Parent email is required.')).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when parent email is invalid', () => {
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'invalidEmail'},
      });
      fireEvent.blur(getParentEmailInput());

      expect(screen.getByText('Invalid parent email.')).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when parent email is the same as the current one', () => {
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'old@example.com'},
      });
      fireEvent.blur(getParentEmailInput());

      expect(
        screen.getByText('Parent email must be different.')
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when confirmed email does not match parent email', () => {
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.change(getConfirmedParentEmailInput(), {
        target: {value: 'different@example.com'},
      });
      fireEvent.blur(getConfirmedParentEmailInput());

      expect(
        screen.getByText('Confirmed email must match.')
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('enables the submit button when form is valid', () => {
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.change(getConfirmedParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.click(getEmailOptInYes());

      expect(getSubmitButton()).not.toBeDisabled();
    });
  });

  describe('server errors', () => {
    it('shows server errors for parent email', async () => {
      const serverError = 'Email already in use';
      DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce({
        serverErrors: {parentEmail: serverError},
      });
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.change(getConfirmedParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.click(getSubmitButton());

      expect(await screen.findByText(serverError)).toBeInTheDocument();
    });
  });

  describe('onSubmitFailure', () => {
    it('shows unknown error when no server errors are returned', async () => {
      DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce(
        new Error('Unknown error')
      );
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.change(getConfirmedParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.click(getSubmitButton());

      expect(
        await screen.findByText('An unexpected error occurred.')
      ).toBeInTheDocument();
    });

    it('shows server errors when they are returned', async () => {
      const serverErrors = {
        parentEmail: 'Email already in use',
      };
      DEFAULT_PROPS.handleSubmit.mockRejectedValueOnce({serverErrors});
      renderComponent();
      fireEvent.change(getParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.change(getConfirmedParentEmailInput(), {
        target: {value: 'new@example.com'},
      });
      fireEvent.click(getSubmitButton());

      expect(
        await screen.findByText(serverErrors.parentEmail)
      ).toBeInTheDocument();
    });
  });
});
