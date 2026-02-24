import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import $ from 'jquery';
import React from 'react';

import DeleteAccount, {
  DELETE_VERIFICATION_STRING,
} from '@cdo/apps/accounts/DeleteAccount';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  isPasswordRequired: true,
  isTeacher: false,
  hasStudents: false,
  dependentStudentsCount: 3,
  isAdmin: false,
};

describe('DeleteAccount', () => {
  const renderComponent = (props = {}) => {
    return render(<DeleteAccount {...DEFAULT_PROPS} {...props} />);
  };

  const getDeleteAccountButton = () =>
    screen.getByRole('button', {name: RegExp(i18n.deleteAccount(), 'i')});
  const getConfirmDeleteButton = () =>
    screen.getByRole('button', {
      name: RegExp(i18n.deleteAccountDialog_button(), 'i'),
    });
  const getConfirmWarningButton = () =>
    screen.getByRole('button', {
      name: RegExp(i18n.deleteAccountDialog_button_studentWarning(), 'i'),
    });
  const getPasswordInput = () =>
    screen.getByText(i18n.deleteAccountDialog_currentPassword());
  const getDeleteVerificationInput = () =>
    screen.getByRole('textbox', {
      name: RegExp(
        i18n.deleteAccountDialog_verification({
          verificationString: DELETE_VERIFICATION_STRING,
        }),
        'i'
      ),
    });

  const typeVerificationString = async user => {
    await user.type(getDeleteVerificationInput(), DELETE_VERIFICATION_STRING);
  };

  const checkAllCheckboxes = async user => {
    const checkboxes = screen
      .getAllByRole('checkbox')
      .filter(checkbox => !checkbox.checked);
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
  };

  const clearAllCheckboxes = async user => {
    const checkboxes = screen
      .getAllByRole('checkbox')
      .filter(checkbox => checkbox.checked);
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }
  };

  describe('openDialog', () => {
    describe('when user is a student', () => {
      it('disables confirm button if password is required and not provided', async () => {
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await typeVerificationString(user);

        expect(getConfirmDeleteButton()).toBeDisabled();
      });

      it('disables confirm button if verification string is not provided', async () => {
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');

        expect(getConfirmDeleteButton()).toBeDisabled();
      });

      it('disables confirm button if verification string is incorrect', async () => {
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await user.type(getDeleteVerificationInput(), 'incorrect');

        expect(getConfirmDeleteButton()).toBeDisabled();
      });

      it('enables confirm button if password is provided and verification string is correct', async () => {
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);

        await expect(getConfirmDeleteButton()).not.toBeDisabled();
      });

      it('enables confirm button if password is not required and verification string is correct', async () => {
        const user = userEvent.setup();
        renderComponent({isPasswordRequired: false});
        await user.click(getDeleteAccountButton());
        await typeVerificationString(user);

        await expect(getConfirmDeleteButton()).toBeEnabled();
      });
    });

    describe('when users is a teacher', () => {
      it('disables confirm button if not all checkboxes are checked', async () => {
        const user = userEvent.setup();
        renderComponent({
          isTeacher: true,
          hasStudents: true,
        });
        await user.click(getDeleteAccountButton());
        await user.click(screen.getByText(i18n.personalLoginDialog_button()));
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);
        await clearAllCheckboxes(user);
        await user.click(
          screen.getByRole('checkbox', {
            name: RegExp(i18n.deleteAccountDialog_checkbox1_1(), 'i'),
          })
        );

        await expect(getConfirmWarningButton()).toBeDisabled();
      });

      it('enables confirm button if checkboxes are checked, verification string is correct, and password is not required', async () => {
        const user = userEvent.setup();
        renderComponent({
          isPasswordRequired: false,
          isTeacher: true,
          hasStudents: true,
        });
        await user.click(getDeleteAccountButton());
        await user.click(screen.getByText(i18n.personalLoginDialog_button()));
        await typeVerificationString(user);
        await checkAllCheckboxes(user);

        expect(getConfirmWarningButton()).toBeEnabled();
      });

      it('enables confirm button if checkboxes are checked, verification string is correct, and password provided and required', async () => {
        const user = userEvent.setup();
        renderComponent({
          isTeacher: true,
          hasStudents: true,
        });
        await user.click(getDeleteAccountButton());
        await user.click(screen.getByText(i18n.personalLoginDialog_button()));
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);
        await checkAllCheckboxes(user);

        await expect(getConfirmWarningButton()).toBeEnabled();
      });

      it('enables confirm button if there are no checkboxes, verification string is correct, and password provided and required', async () => {
        const user = userEvent.setup();
        renderComponent({
          isTeacher: true,
          hasStudents: false,
        });
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);

        expect(getConfirmDeleteButton()).not.toBeDisabled();
      });
      describe('when teacher has students who depend upon them for log in', () => {
        it('displays PersonalLoginDialog with dependent student count', async () => {
          const user = userEvent.setup();
          renderComponent({
            isTeacher: true,
            hasStudents: true,
          });
          await user.click(getDeleteAccountButton());

          expect(
            screen.getByText(
              RegExp(i18n.personalLoginDialog_body1({numStudents: 3}), 'i')
            )
          ).toBeInTheDocument();
        });
      });
    });

    describe('when user is an admin', () => {
      it('displays AdminAccountDialog if trying to delete admin account', async () => {
        const user = userEvent.setup();
        renderComponent({isAdmin: true});
        await user.click(getDeleteAccountButton());

        expect(
          screen.getByText(i18n.adminAccountDeletionDialog_header())
        ).toBeInTheDocument();
      });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      jest.spyOn($, 'ajax').mockImplementation(() => {
        const deferred = $.Deferred();
        deferred.resolve();
        return deferred;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('when deletion succeeds', () => {
      it('navigates to root', async () => {
        jest.spyOn(utils, 'navigateToHref');
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);
        await user.click(getConfirmDeleteButton());

        await waitFor(() => {
          expect(utils.navigateToHref).toHaveBeenCalledWith('/');
        });
      });
    });

    describe('when deletion fails', () => {
      it('renders a password error if server returns one', async () => {
        jest.spyOn($, 'ajax').mockImplementation(() => {
          const deferred = $.Deferred();
          return deferred.reject({
            responseJSON: {error: {current_password: ['Incorrect password!']}},
          });
        });
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);
        await user.click(getConfirmDeleteButton());

        await waitFor(() => {
          expect(screen.getByText('Incorrect password!')).toBeInTheDocument();
        });
      });

      it('renders a generic error if server does not return a validation error', async () => {
        jest.spyOn($, 'ajax').mockImplementation(() => {
          const deferred = $.Deferred();
          return deferred.reject({status: 400});
        });
        const user = userEvent.setup();
        renderComponent();
        await user.click(getDeleteAccountButton());
        await user.type(getPasswordInput(), 'password');
        await typeVerificationString(user);
        await user.click(getConfirmDeleteButton());

        await waitFor(() => {
          expect(screen.getByText('Unexpected error: 400')).toBeInTheDocument();
        });
      });
    });
  });
});
