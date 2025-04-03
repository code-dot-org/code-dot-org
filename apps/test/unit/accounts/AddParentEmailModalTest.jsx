import {render, screen, getDefaultNormalizer} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import AddParentEmailModal from '@cdo/apps/accounts/AddParentEmailModal';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  handleSubmit: jest.fn(() => Promise.resolve()),
  handleCancel: jest.fn(),
  currentParentEmail: 'old@example.com',
};

describe('AddParentEmailModal', () => {
  const renderComponent = (props = {}) => {
    return render(<AddParentEmailModal {...DEFAULT_PROPS} {...props} />);
  };

  const getParentEmailInput = () =>
    screen.getByRole('textbox', {
      name: i18n.addParentEmailModal_parentEmail_label(),
    });
  const getConfirmedParentEmailInput = () =>
    screen.getByRole('textbox', {
      name: i18n.addParentEmailModal_confirmedParentEmail_label(),
    });
  const getEmailOptInYes = () => screen.getByLabelText(i18n.yes());
  const getEmailOptInNo = () => screen.getByLabelText(i18n.no());
  const getSubmitButton = () =>
    screen.getByRole('button', {
      name: i18n.addParentEmailModal_save(),
    });
  const getCancelButton = () =>
    screen.getByRole('button', {name: i18n.cancel()});

  const completeAndSubmitForm = async user => {
    await user.clear(getParentEmailInput());
    await user.type(getParentEmailInput(), 'new@example.com');
    await user.type(getConfirmedParentEmailInput(), 'new@example.com');
    await user.click(getSubmitButton());
  };

  describe('validation', () => {
    it('shows an error when parent email is empty', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.clear(getParentEmailInput());

      await expect(
        screen.getByText(i18n.addParentEmailModal_parentEmail_isRequired())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when parent email is invalid', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.clear(getParentEmailInput());
      await user.type(getParentEmailInput(), 'invalidEmail');

      await expect(
        screen.getByText(i18n.addParentEmailModal_parentEmail_invalid())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when parent email is the same as the current one', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.clear(getParentEmailInput());
      await user.type(getParentEmailInput(), 'old@example.com');

      await expect(
        screen.getByText(i18n.addParentEmailModal_parentEmail_mustBeDifferent())
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('shows an error when confirmed email does not match parent email', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.clear(getParentEmailInput());
      await user.type(getParentEmailInput(), 'new@example.com');
      await user.type(getConfirmedParentEmailInput(), 'different@example.com');

      await expect(
        screen.getByText(
          i18n.addParentEmailModal_confirmedParentEmail_mustMatch()
        )
      ).toBeInTheDocument();
      expect(getSubmitButton()).toBeDisabled();
    });

    it('enables the submit button when form is valid', async () => {
      const user = userEvent.setup();
      renderComponent();
      await user.clear(getParentEmailInput());
      await user.type(getParentEmailInput(), 'new@example.com');
      await user.type(getConfirmedParentEmailInput(), 'new@example.com');

      expect(getSubmitButton()).toBeEnabled();
    });
  });

  describe('onSubmit', () => {
    it('disables everything and shows save text when saving', async () => {
      const user = userEvent.setup();
      renderComponent();
      await completeAndSubmitForm(user);

      await expect(getParentEmailInput()).toBeDisabled();
      await expect(getConfirmedParentEmailInput()).toBeDisabled();
      await expect(getEmailOptInYes()).toBeDisabled();
      await expect(getEmailOptInNo()).toBeDisabled();
      await expect(getSubmitButton()).toBeDisabled();
      await expect(getCancelButton()).toBeDisabled();
      await expect(screen.getByText(i18n.saving())).toBeInTheDocument();
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
    it('clears server errors when error field is updated', async () => {
      const user = userEvent.setup();
      renderComponent();
      expect(
        await screen.findByText(
          i18n.addParentEmailModal_parentEmail_mustBeDifferent()
        )
      ).toBeInTheDocument();
      await user.clear(getParentEmailInput());
      await user.type(getParentEmailInput(), 'new@example.com');

      expect(
        screen.queryByText(
          i18n.addParentEmailModal_parentEmail_mustBeDifferent()
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('onSubmitFailure', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('shows unknown error text when an unknown error occurs', async () => {
      const handleSubmit = jest
        .fn()
        .mockRejectedValueOnce(new Error('Unknown error'));
      const user = userEvent.setup();
      renderComponent({handleSubmit});
      await completeAndSubmitForm(user);

      expect(
        await screen.findByText(i18n.changeEmailModal_unexpectedError(), {
          normalizer: getDefaultNormalizer({collapseWhitespace: false}),
        })
      ).toBeInTheDocument();
    });

    it('shows unknown error when no server errors are returned', async () => {
      const handleSubmit = jest.fn().mockRejectedValueOnce({});
      const user = userEvent.setup();
      renderComponent({handleSubmit});
      await completeAndSubmitForm(user);

      expect(
        await screen.findByText(i18n.changeEmailModal_unexpectedError(), {
          normalizer: getDefaultNormalizer({collapseWhitespace: false}),
        })
      ).toBeInTheDocument();
    });

    it('shows server errors when they are returned', async () => {
      const serverError = 'test-email-server-error';
      const handleSubmit = jest
        .fn()
        .mockRejectedValueOnce({serverErrors: {parentEmail: serverError}});
      const user = userEvent.setup();
      renderComponent({handleSubmit});
      await completeAndSubmitForm(user);

      expect(await screen.findByText(serverError)).toBeInTheDocument();
    });
  });
});
