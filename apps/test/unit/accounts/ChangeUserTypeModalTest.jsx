import {render, screen, getDefaultNormalizer} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ChangeUserTypeModal from '@cdo/apps/accounts/ChangeUserTypeModal';
import i18n from '@cdo/locale';

describe('ChangeUserTypeModal', () => {
  const DEFAULT_PROPS = {
    handleSubmit: jest.fn(() => Promise.resolve()),
    handleCancel: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(<ChangeUserTypeModal {...DEFAULT_PROPS} {...props} />);
  };

  const getEmailInput = () =>
    screen.getByRole('textbox', {
      name: RegExp(i18n.changeUserTypeModal_email_label(), 'i'),
    });
  const getEmailOptInSelect = () =>
    screen.getByRole('combobox', {
      name: RegExp(i18n.changeUserTypeModal_emailOptIn_description(), 'i'),
    });
  const getSubmitButton = () =>
    screen.getByRole('button', {
      name: RegExp(i18n.changeUserTypeModal_save_teacher(), 'i'),
    });
  const getCancelButton = () =>
    screen.getByRole('button', {name: i18n.cancel()});

  describe('validation', () => {
    it('checks that email is present', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.selectOptions(getEmailOptInSelect(), 'yes');

      expect(
        screen.getByText(i18n.changeUserTypeModal_email_isRequired())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('checks that email is valid', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.type(getEmailInput(), 'invalid-email');
      await user.selectOptions(getEmailOptInSelect(), 'yes');

      expect(
        screen.getByText(i18n.changeUserTypeModal_email_invalid())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('checks that email opt-in is present', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.type(getEmailInput(), 'valid@example.com');

      expect(
        screen.getByText(i18n.changeUserTypeModal_emailOptIn_isRequired())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('enables the submit button when the form is valid', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.type(getEmailInput(), 'valid@example.com');
      await user.selectOptions(getEmailOptInSelect(), 'yes');

      expect(getSubmitButton()).not.toBeDisabled();
    });
  });

  describe('onSubmit', () => {
    it('disables everything and shows saving text when submitting', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.type(getEmailInput(), 'valid@example.com');
      await user.selectOptions(getEmailOptInSelect(), 'yes');
      await user.click(getSubmitButton());

      expect(getEmailInput()).toBeDisabled();
      expect(getEmailOptInSelect()).toBeDisabled();
      expect(getSubmitButton()).toBeDisabled();
      expect(getCancelButton()).toBeDisabled();
      expect(screen.getByText(i18n.saving())).toBeInTheDocument();
    });
  });

  describe('onCancel', () => {
    it('calls handleCancel when clicking the cancel button', async () => {
      const handleCancel = jest.fn();
      const user = userEvent.setup();
      renderComponent({handleCancel});
      await user.click(getCancelButton());

      expect(handleCancel).toHaveBeenCalled();
    });
  });

  describe('server errors', () => {
    it('clears email error on email change', async () => {
      const user = userEvent.setup();
      renderComponent({
        serverErrors: {email: i18n.changeUserTypeModal_email_isRequired()},
      });

      expect(
        screen.getByText(i18n.changeUserTypeModal_email_isRequired())
      ).toBeInTheDocument();

      await user.type(getEmailInput(), 'valid@example.com');

      expect(
        screen.queryByText(i18n.changeUserTypeModal_email_isRequired())
      ).not.toBeInTheDocument();
    });

    it('clears email opt-in error on opt-in change', async () => {
      const user = userEvent.setup();
      renderComponent({
        serverErrors: {
          emailOptIn: i18n.changeUserTypeModal_emailOptIn_isRequired(),
        },
      });

      expect(
        screen.getByText(i18n.changeUserTypeModal_emailOptIn_isRequired())
      ).toBeInTheDocument();

      await user.selectOptions(getEmailOptInSelect(), 'yes');

      expect(
        screen.queryByText(i18n.changeUserTypeModal_emailOptIn_isRequired())
      ).not.toBeInTheDocument();
    });
  });

  describe('onSubmitFailure', () => {
    it('displays unknown error when no specific server errors exist', async () => {
      const handleSubmit = jest
        .fn()
        .mockRejectedValue(new Error('Unknown error'));
      const user = userEvent.setup();
      renderComponent({handleSubmit});
      await user.type(getEmailInput(), 'valid@example.com');
      await user.selectOptions(getEmailOptInSelect(), 'yes');
      await user.click(getSubmitButton());

      expect(
        await screen.findByText(i18n.changeUserTypeModal_unexpectedError(), {
          normalizer: getDefaultNormalizer({collapseWhitespace: false}),
        })
      ).toBeInTheDocument();
    });

    it('displays specific server errors when returned', async () => {
      const serverErrors = {
        email: 'Email already in use',
        emailOptIn: 'Invalid opt-in selection',
      };
      const handleSubmit = jest.fn().mockRejectedValue({serverErrors});
      const user = userEvent.setup();
      renderComponent({handleSubmit});
      await user.type(getEmailInput(), 'valid@example.com');
      await user.selectOptions(getEmailOptInSelect(), 'yes');
      await user.click(getSubmitButton());

      expect(screen.getByText('Email already in use')).toBeInTheDocument();
      expect(screen.getByText('Invalid opt-in selection')).toBeInTheDocument();
    });
  });
});
