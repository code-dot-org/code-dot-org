import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AddParentEmailModal from '@cdo/apps/accounts/AddParentEmailModal';

jest.mock('@cdo/locale', () => {
  const customStrings = {
    addParentEmailModal_save: () => 'Save',
    cancel: () => 'Cancel',
    saving: () => 'Saving...',
    changeEmailModal_unexpectedError: () => 'An unexpected error occurred.',
    addParentEmailModal_parentEmail_isRequired: () =>
      'Parent email is required.',
    addParentEmailModal_parentEmail_invalid: () => 'Invalid parent email.',
    addParentEmailModal_parentEmail_mustBeDifferent: () =>
      'Parent email must be different.',
    addParentEmailModal_confirmedParentEmail_mustMatch: () =>
      'Confirmed email must match.',
    addParentEmailModal_title: () => 'Add Parent Email',
    addParentEmailModal_subtitle: () =>
      'Please provide a parent email address.',
    addParentEmailModal_parentEmail_label: () => 'Parent Email',
    addParentEmailModal_confirmedParentEmail_label: () =>
      'Confirm Parent Email',
    yes: () => 'Yes',
    no: () => 'No',
  };
  return {
    __esModule: true,
    default: new Proxy(customStrings, {
      get: (target, prop) => {
        return prop in target ? target[prop] : () => prop;
      },
    }),
  };
});

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
